import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Configuration Bridge API
const BRIDGE_API_URL = "https://api.bridgeapi.io/v3";
const BRIDGE_VERSION = "2025-01-15";
const BRIDGE_CLIENT_ID = Deno.env.get("BRIDGE_CLIENT_ID");
const BRIDGE_CLIENT_SECRET = Deno.env.get("BRIDGE_CLIENT_SECRET");

// Supabase
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

if (!BRIDGE_CLIENT_ID || !BRIDGE_CLIENT_SECRET) {
  throw new Error("BRIDGE_CLIENT_ID and BRIDGE_CLIENT_SECRET must be set");
}

// Types
interface BridgeAccount {
  id: number;
  item_id: number;
  name: string;
  balance: number;
  currency_code: string;
  iban: string | null;
  type: string;
  status: number;
  updated_at: string;
}

interface BridgeTransaction {
  id: number;
  account_id: number;
  clean_description: string;
  provider_description: string;
  amount: number;
  currency_code: string;
  date: string;
  booking_date: string | null;
  category_id: number | null;
  operation_type: string;
  deleted: boolean;
  updated_at: string;
}

interface BridgeItem {
  id: number;
  status: number;
  status_code_info: string | null;
  status_code_description: string | null;
  provider_id: number;
  provider_name: string;
}

// Headers communs pour Bridge API
function getBridgeHeaders(accessToken?: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Bridge-Version": BRIDGE_VERSION,
    "Client-Id": BRIDGE_CLIENT_ID!,
    "Client-Secret": BRIDGE_CLIENT_SECRET!,
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return headers;
}

// Authentifier un utilisateur Bridge
async function authenticateBridgeUser(externalUserId: string): Promise<string> {
  const response = await fetch(`${BRIDGE_API_URL}/aggregation/authorization/token`, {
    method: "POST",
    headers: getBridgeHeaders(),
    body: JSON.stringify({
      external_user_id: externalUserId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Bridge authentication failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Récupérer tous les items d'un utilisateur
async function getItems(accessToken: string): Promise<BridgeItem[]> {
  const response = await fetch(`${BRIDGE_API_URL}/aggregation/items`, {
    method: "GET",
    headers: getBridgeHeaders(accessToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get items: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.resources || [];
}

// Récupérer les comptes d'un item
async function getAccounts(accessToken: string, itemId: number): Promise<BridgeAccount[]> {
  const response = await fetch(`${BRIDGE_API_URL}/aggregation/items/${itemId}/accounts`, {
    method: "GET",
    headers: getBridgeHeaders(accessToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get accounts: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.resources || [];
}

// Récupérer les transactions d'un compte
async function getTransactions(
  accessToken: string,
  accountId: number,
  since?: string
): Promise<BridgeTransaction[]> {
  let url = `${BRIDGE_API_URL}/aggregation/accounts/${accountId}/transactions?limit=500`;
  if (since) {
    url += `&since=${encodeURIComponent(since)}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getBridgeHeaders(accessToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get transactions: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.resources || [];
}

// Demander un refresh des données
async function refreshItem(accessToken: string, itemId: number): Promise<void> {
  const response = await fetch(`${BRIDGE_API_URL}/aggregation/items/${itemId}/refresh`, {
    method: "POST",
    headers: getBridgeHeaders(accessToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to refresh item: ${JSON.stringify(error)}`);
  }
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Vérifier l'authentification Supabase
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Créer un client Supabase avec le token de l'utilisateur
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Vérifier le token et récupérer l'utilisateur
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parser le body pour les options
    let options: { refresh?: boolean } = {};
    try {
      options = await req.json();
    } catch {
      // Body vide, OK
    }

    console.log(`Syncing Bridge data for user: ${user.id}`);

    // 1. Vérifier que l'utilisateur a une connexion Bridge
    const { data: connection, error: connError } = await supabase
      .from("bank_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "bridge")
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "No Bridge connection found. Please connect your bank first." }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Authentifier sur Bridge
    const accessToken = await authenticateBridgeUser(user.id);
    console.log("Bridge authentication successful");

    // 3. Récupérer tous les items
    const items = await getItems(accessToken);
    console.log(`Found ${items.length} items`);

    if (items.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No bank connections found",
          accounts: 0,
          transactions: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 4. Si refresh demandé, déclencher un refresh sur tous les items
    if (options.refresh) {
      for (const item of items) {
        try {
          await refreshItem(accessToken, item.id);
          console.log(`Refresh requested for item ${item.id}`);
        } catch (error) {
          console.error(`Failed to refresh item ${item.id}:`, error);
        }
      }
    }

    // 5. Synchroniser les données
    let totalAccounts = 0;
    let totalTransactions = 0;

    for (const item of items) {
      // Mettre à jour la connexion avec les infos de la banque
      await supabase
        .from("bank_connections")
        .update({
          institution_name: item.provider_name,
          status: item.status === 0 ? "active" : "error",
          error_message: item.status_code_description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", connection.id);

      // Récupérer les comptes
      const accounts = await getAccounts(accessToken, item.id);
      console.log(`Item ${item.id}: ${accounts.length} accounts`);

      for (const account of accounts) {
        // Insérer/Mettre à jour le compte
        const { data: dbAccount, error: accountError } = await supabase
          .from("bank_accounts")
          .upsert({
            user_id: user.id,
            connection_id: connection.id,
            external_id: account.id.toString(),
            name: account.name,
            iban: account.iban,
            balance: account.balance,
            currency: account.currency_code,
            account_type: account.type,
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "user_id,external_id",
          })
          .select()
          .single();

        if (accountError) {
          console.error(`Error upserting account ${account.id}:`, accountError);
          continue;
        }

        totalAccounts++;

        // Récupérer les transactions
        const lastSync = connection.last_sync_at;
        const transactions = await getTransactions(accessToken, account.id, lastSync || undefined);
        console.log(`Account ${account.id}: ${transactions.length} transactions`);

        for (const tx of transactions) {
          if (tx.deleted) continue;

          const { error: txError } = await supabase
            .from("transactions")
            .upsert({
              user_id: user.id,
              external_id: tx.id.toString(),
              bank_account_id: dbAccount.id,
              montant: tx.amount,
              description: tx.clean_description,
              raw_description: tx.provider_description,
              date_transaction: tx.date,
              source: "sync",
              is_reviewed: false,
              provider_category: tx.category_id?.toString() || null,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: "user_id,external_id",
            });

          if (!txError) {
            totalTransactions++;
          }
        }
      }
    }

    // Mettre à jour la date de dernière sync
    await supabase
      .from("bank_connections")
      .update({
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", connection.id);

    console.log(`Sync completed: ${totalAccounts} accounts, ${totalTransactions} transactions`);

    return new Response(
      JSON.stringify({
        success: true,
        accounts: totalAccounts,
        transactions: totalTransactions,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
