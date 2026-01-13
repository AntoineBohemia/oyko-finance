import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Configuration Bridge API
const BRIDGE_API_URL = "https://api.bridgeapi.io/v3";
const BRIDGE_VERSION = "2025-01-15";
const BRIDGE_CLIENT_ID = Deno.env.get("BRIDGE_CLIENT_ID");
const BRIDGE_CLIENT_SECRET = Deno.env.get("BRIDGE_CLIENT_SECRET");
const BRIDGE_WEBHOOK_SECRET = Deno.env.get("BRIDGE_WEBHOOK_SECRET");

// Supabase
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

if (!BRIDGE_CLIENT_ID || !BRIDGE_CLIENT_SECRET) {
  throw new Error("BRIDGE_CLIENT_ID and BRIDGE_CLIENT_SECRET must be set");
}

// Types pour les webhooks Bridge
interface BridgeWebhookPayload {
  type: string;
  timestamp: string;
  content: {
    item_id?: number;
    account_id?: number;
    user_uuid?: string;
    [key: string]: unknown;
  };
}

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

// Vérification de signature HMAC-SHA256 Bridge
async function verifyBridgeSignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) {
    console.error("Missing bridge-signature header");
    return false;
  }

  // Bridge signature format: t=timestamp,v1=signature
  const parts = signature.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const signaturePart = parts.find((p) => p.startsWith("v1="));

  if (!timestampPart || !signaturePart) {
    console.error("Invalid signature format");
    return false;
  }

  const timestamp = timestampPart.substring(2);
  const receivedSignature = signaturePart.substring(3);

  // Vérifier que le timestamp n'est pas trop ancien (5 minutes max)
  const timestampMs = parseInt(timestamp) * 1000;
  const now = Date.now();
  if (now - timestampMs > 5 * 60 * 1000) {
    console.error("Webhook timestamp too old");
    return false;
  }

  // Calculer la signature attendue: HMAC-SHA256(timestamp + "." + payload, secret)
  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload)
  );

  // Convertir en hex
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Comparaison constante pour éviter timing attacks
  if (expectedSignature.length !== receivedSignature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    result |= expectedSignature.charCodeAt(i) ^ receivedSignature.charCodeAt(i);
  }

  return result === 0;
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

// Authentifier un utilisateur Bridge par UUID
async function authenticateBridgeUserByUuid(userUuid: string): Promise<string> {
  const response = await fetch(`${BRIDGE_API_URL}/aggregation/authorization/token`, {
    method: "POST",
    headers: getBridgeHeaders(),
    body: JSON.stringify({
      user_uuid: userUuid,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Bridge authentication failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Récupérer un item Bridge
async function getItem(accessToken: string, itemId: number): Promise<BridgeItem> {
  const response = await fetch(`${BRIDGE_API_URL}/aggregation/items/${itemId}`, {
    method: "GET",
    headers: getBridgeHeaders(accessToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get item: ${JSON.stringify(error)}`);
  }

  return response.json();
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

// Synchroniser les comptes et transactions
async function syncAccountsAndTransactions(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  connectionId: string,
  accessToken: string,
  itemId: number
) {
  console.log(`Syncing item ${itemId} for user ${userId}`);

  // 1. Récupérer les comptes
  const accounts = await getAccounts(accessToken, itemId);
  console.log(`Found ${accounts.length} accounts`);

  for (const account of accounts) {
    // Insérer ou mettre à jour le compte
    const { data: dbAccount, error: accountError } = await supabase
      .from("bank_accounts")
      .upsert({
        user_id: userId,
        connection_id: connectionId,
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

    console.log(`Account ${account.id} synced as ${dbAccount.id}`);

    // 2. Récupérer les transactions du compte
    const transactions = await getTransactions(accessToken, account.id);
    console.log(`Found ${transactions.length} transactions for account ${account.id}`);

    // Filtrer les transactions non supprimées et préparer le batch
    const transactionsToUpsert = transactions
      .filter((tx) => !tx.deleted)
      .map((tx) => ({
        user_id: userId,
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
      }));

    // Insertion batch par lots de 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < transactionsToUpsert.length; i += BATCH_SIZE) {
      const batch = transactionsToUpsert.slice(i, i + BATCH_SIZE);
      const { error: batchError } = await supabase
        .from("transactions")
        .upsert(batch, {
          onConflict: "user_id,external_id",
          ignoreDuplicates: false,
        });

      if (batchError) {
        console.error(`Error upserting transaction batch ${i / BATCH_SIZE + 1}:`, batchError);
      }
    }

    console.log(`Inserted ${transactionsToUpsert.length} transactions for account ${account.id}`);
  }
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, bridge-signature",
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
    // Lire le body brut pour la vérification de signature
    const rawBody = await req.text();
    const payload: BridgeWebhookPayload = JSON.parse(rawBody);
    console.log(`Received webhook: ${payload.type}`, JSON.stringify(payload.content));

    // Vérifier la signature si le secret est configuré
    if (BRIDGE_WEBHOOK_SECRET) {
      const signature = req.headers.get("bridge-signature");
      const isValid = await verifyBridgeSignature(rawBody, signature, BRIDGE_WEBHOOK_SECRET);

      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.log("Webhook signature verified successfully");
    } else {
      console.warn("BRIDGE_WEBHOOK_SECRET not configured - signature verification skipped");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Traiter les différents types d'événements
    switch (payload.type) {
      case "item.created":
      case "item.refreshed": {
        const { item_id, user_uuid } = payload.content;
        if (!item_id || !user_uuid) {
          console.error("Missing item_id or user_uuid in payload");
          return new Response(JSON.stringify({ error: "Missing item_id or user_uuid" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Trouver la connexion par provider_user_id ET external_item_id
        let connectionQuery = supabase
          .from("bank_connections")
          .select("id, user_id")
          .eq("provider_user_id", user_uuid)
          .eq("provider", "bridge");

        // Si item.refreshed, filtrer aussi par external_item_id
        if (payload.type === "item.refreshed") {
          connectionQuery = connectionQuery.eq("external_item_id", item_id.toString());
        }

        const { data: connection, error: connError } = await connectionQuery.single();

        if (connError || !connection) {
          // Pour item.created, chercher sans external_item_id (pas encore défini)
          if (payload.type === "item.created") {
            const { data: newConn, error: newConnError } = await supabase
              .from("bank_connections")
              .select("id, user_id")
              .eq("provider_user_id", user_uuid)
              .eq("provider", "bridge")
              .is("external_item_id", null)
              .single();

            if (newConnError || !newConn) {
              console.error("Connection not found for user_uuid:", user_uuid);
              return new Response(JSON.stringify({ error: "Connection not found" }), {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
            }

            // Mettre à jour avec l'external_item_id
            await supabase
              .from("bank_connections")
              .update({ external_item_id: item_id.toString() })
              .eq("id", newConn.id);

            // Continuer avec cette connexion
            Object.assign(connection || {}, newConn);
          } else {
            console.error("Connection not found for user_uuid and item_id:", user_uuid, item_id);
            return new Response(JSON.stringify({ error: "Connection not found" }), {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }

        const conn = connection!;

        // Authentifier sur Bridge
        const accessToken = await authenticateBridgeUserByUuid(user_uuid as string);

        // Récupérer les infos de l'item pour mettre à jour la connexion
        const item = await getItem(accessToken, item_id as number);

        // Mettre à jour la connexion bancaire
        await supabase
          .from("bank_connections")
          .update({
            external_item_id: item_id.toString(),
            institution_name: item.provider_name,
            status: item.status === 0 ? "active" : "error",
            error_message: item.status_code_description,
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", conn.id);

        // Synchroniser les comptes et transactions
        await syncAccountsAndTransactions(
          supabase,
          conn.user_id,
          conn.id,
          accessToken,
          item_id as number
        );

        console.log(`Item ${item_id} synced successfully`);
        break;
      }

      case "item.account.created":
      case "item.account.updated": {
        const { account_id, user_uuid, item_id } = payload.content;
        if (!account_id || !user_uuid) {
          console.error("Missing account_id or user_uuid in payload");
          return new Response(JSON.stringify({ error: "Missing account_id or user_uuid" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Trouver la connexion (avec item_id si disponible)
        let connectionQuery = supabase
          .from("bank_connections")
          .select("id, user_id")
          .eq("provider_user_id", user_uuid)
          .eq("provider", "bridge");

        if (item_id) {
          connectionQuery = connectionQuery.eq("external_item_id", item_id.toString());
        }

        const { data: connection, error: connError } = await connectionQuery.single();

        if (connError || !connection) {
          console.error("Connection not found for user_uuid:", user_uuid);
          return new Response(JSON.stringify({ error: "Connection not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Authentifier sur Bridge
        const accessToken = await authenticateBridgeUserByUuid(user_uuid as string);

        // Récupérer les transactions mises à jour pour ce compte
        const transactions = await getTransactions(accessToken, account_id as number);
        console.log(`Syncing ${transactions.length} transactions for account ${account_id}`);

        // Trouver le compte en DB
        const { data: dbAccount, error: accountError } = await supabase
          .from("bank_accounts")
          .select("id")
          .eq("user_id", connection.user_id)
          .eq("external_id", (account_id as number).toString())
          .single();

        if (accountError || !dbAccount) {
          console.error("Account not found in DB:", account_id);
          return new Response(JSON.stringify({ error: "Account not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Préparer le batch de transactions
        const transactionsToUpsert = transactions
          .filter((tx) => !tx.deleted)
          .map((tx) => ({
            user_id: connection.user_id,
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
          }));

        // Insertion batch par lots de 100
        const BATCH_SIZE = 100;
        for (let i = 0; i < transactionsToUpsert.length; i += BATCH_SIZE) {
          const batch = transactionsToUpsert.slice(i, i + BATCH_SIZE);
          const { error: batchError } = await supabase
            .from("transactions")
            .upsert(batch, {
              onConflict: "user_id,external_id",
            });

          if (batchError) {
            console.error(`Error upserting transaction batch:`, batchError);
          }
        }

        // Mettre à jour la date de sync
        await supabase
          .from("bank_connections")
          .update({
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", connection.id);

        console.log(`Account ${account_id} updated successfully with ${transactionsToUpsert.length} transactions`);
        break;
      }

      case "item.deleted": {
        const { item_id, user_uuid } = payload.content;
        console.log(`Item ${item_id} deleted for user ${user_uuid}`);

        // Marquer la connexion comme supprimée
        if (user_uuid && item_id) {
          const { error } = await supabase
            .from("bank_connections")
            .update({
              status: "expired",
              updated_at: new Date().toISOString(),
            })
            .eq("provider_user_id", user_uuid)
            .eq("external_item_id", item_id.toString())
            .eq("provider", "bridge");

          if (error) {
            console.error("Error marking connection as expired:", error);
          }
        }
        break;
      }

      case "item.account.deleted": {
        const { account_id, user_uuid } = payload.content;
        console.log(`Account ${account_id} deleted for user ${user_uuid}`);
        // Les transactions restent pour l'historique
        break;
      }

      default:
        console.log(`Unhandled webhook type: ${payload.type}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
