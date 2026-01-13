import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Configuration Bridge API
const BRIDGE_API_URL = "https://api.bridgeapi.io/v3";
const BRIDGE_VERSION = "2025-01-15";
const BRIDGE_CLIENT_ID = Deno.env.get("BRIDGE_CLIENT_ID");
const BRIDGE_CLIENT_SECRET = Deno.env.get("BRIDGE_CLIENT_SECRET");
const SITE_URL = Deno.env.get("SITE_URL") || "https://www.oyko.space";

// Supabase
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

if (!BRIDGE_CLIENT_ID || !BRIDGE_CLIENT_SECRET) {
  throw new Error("BRIDGE_CLIENT_ID and BRIDGE_CLIENT_SECRET must be set");
}

// Types
interface BridgeUser {
  uuid: string;
  external_user_id: string;
}

interface BridgeAuthResponse {
  access_token: string;
  expires_at: string;
  user: BridgeUser;
}

interface BridgeConnectSession {
  id: string;
  url: string;
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

// Créer un utilisateur Bridge
async function createBridgeUser(externalUserId: string): Promise<BridgeUser> {
  const response = await fetch(`${BRIDGE_API_URL}/aggregation/users`, {
    method: "POST",
    headers: getBridgeHeaders(),
    body: JSON.stringify({
      external_user_id: externalUserId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Bridge user creation failed: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// Authentifier un utilisateur Bridge et obtenir un access token
async function authenticateBridgeUser(externalUserId: string): Promise<BridgeAuthResponse> {
  const response = await fetch(`${BRIDGE_API_URL}/aggregation/authorization/token`, {
    method: "POST",
    headers: getBridgeHeaders(),
    body: JSON.stringify({
      external_user_id: externalUserId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    // Si l'utilisateur n'existe pas, le créer
    if (response.status === 404) {
      console.log("Bridge user not found, creating...");
      await createBridgeUser(externalUserId);
      // Réessayer l'authentification
      return authenticateBridgeUser(externalUserId);
    }
    throw new Error(`Bridge authentication failed: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// Créer une session Connect
async function createConnectSession(
  accessToken: string,
  userEmail: string,
  callbackUrl: string
): Promise<BridgeConnectSession> {
  const response = await fetch(`${BRIDGE_API_URL}/aggregation/connect-sessions`, {
    method: "POST",
    headers: getBridgeHeaders(accessToken),
    body: JSON.stringify({
      user_email: userEmail,
      callback_url: callbackUrl,
      country: "fr",
      prefill_email: userEmail,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Bridge connect session creation failed: ${JSON.stringify(error)}`);
  }

  return response.json();
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

    console.log(`Creating Bridge connection for user: ${user.id}`);

    // 1. Authentifier l'utilisateur sur Bridge (le créer si nécessaire)
    const bridgeAuth = await authenticateBridgeUser(user.id);
    console.log(`Bridge user authenticated: ${bridgeAuth.user.uuid}`);

    // 2. Créer la session Connect
    const callbackUrl = `${SITE_URL}/bank/callback`;
    const connectSession = await createConnectSession(
      bridgeAuth.access_token,
      user.email!,
      callbackUrl
    );
    console.log(`Connect session created: ${connectSession.id}`);

    // 3. Créer ou mettre à jour la connexion bancaire en DB
    const { error: dbError } = await supabase
      .from("bank_connections")
      .upsert({
        user_id: user.id,
        provider: "bridge",
        provider_user_id: bridgeAuth.user.uuid,
        status: "pending",
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,provider",
      });

    if (dbError) {
      console.error("Database error:", dbError);
      // Ne pas échouer si l'insertion échoue, continuer avec l'URL
    }

    return new Response(
      JSON.stringify({
        connect_url: connectSession.url,
        session_id: connectSession.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
