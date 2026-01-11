import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend";

// Debug: Log environment variables presence
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const HOOK_SECRET = Deno.env.get("SEND_EMAIL_HOOK_SECRET");

console.log("=== ENV CHECK ===");
console.log("RESEND_API_KEY exists:", !!RESEND_API_KEY);
console.log("SEND_EMAIL_HOOK_SECRET exists:", !!HOOK_SECRET);

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}
if (!HOOK_SECRET) {
  throw new Error("SEND_EMAIL_HOOK_SECRET is not set");
}

const resend = new Resend(RESEND_API_KEY);
const hookSecret = HOOK_SECRET;

// Configuration
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Oyko <onboarding@resend.dev>";
const SITE_URL = Deno.env.get("SITE_URL") || "https://oyko.space";

// Types
interface WebhookPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      prenom?: string;
      nom?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: "signup" | "recovery" | "invite" | "magiclink" | "email_change";
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
  };
}

// Logo Oyko en SVG inline
const oykoLogoSvg = `
<svg viewBox="0 0 40 48" fill="none" width="40" height="48" style="display: inline-block;">
  <path d="m27.6627 4h-15.3253l-12.3374 12.3373v15.3253l12.3374 12.3374h15.3253l12.3373-12.3374v-15.3253zm-13.2049 27.8554-7.90357-7.9036 7.90357-7.9036c2.988-2.988 7.9037-2.988 10.8916 0l7.9036 7.9036-7.9036 7.9036c-2.9879 2.988-7.8072 2.988-10.8916 0z" fill="#7c3aed"/>
</svg>
`;

// Templates d'emails
const emailTemplates = {
  signup: {
    subject: "Confirmez votre inscription - Oyko",
    html: (data: WebhookPayload, confirmationUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 32px;">
      ${oykoLogoSvg}
      <h1 style="margin: 16px 0 0; font-size: 24px; color: #18181b; font-weight: 600;">Oyko</h1>
    </div>
    <h2 style="font-size: 20px; color: #18181b; margin: 0 0 16px;">Bienvenue ${data.user.user_metadata?.prenom || data.user.email.split('@')[0]} !</h2>
    <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Merci de vous être inscrit sur Oyko. Pour activer votre compte et commencer à gérer vos finances, veuillez confirmer votre adresse email.
    </p>
    <a href="${confirmationUrl}" style="display: block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-align: center; margin-bottom: 24px;">
      Confirmer mon email
    </a>
    <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
      Si vous n'avez pas créé de compte sur Oyko, vous pouvez ignorer cet email.
    </p>
  </div>
  <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px;">
    © ${new Date().getFullYear()} Oyko. Tous droits réservés.
  </p>
</body>
</html>
    `,
  },

  recovery: {
    subject: "Réinitialisez votre mot de passe - Oyko",
    html: (data: WebhookPayload, confirmationUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 32px;">
      ${oykoLogoSvg}
      <h1 style="margin: 16px 0 0; font-size: 24px; color: #18181b; font-weight: 600;">Oyko</h1>
    </div>
    <h2 style="font-size: 20px; color: #18181b; margin: 0 0 16px;">Réinitialisation du mot de passe</h2>
    <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
    </p>
    <a href="${confirmationUrl}" style="display: block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-align: center; margin-bottom: 24px;">
      Réinitialiser mon mot de passe
    </a>
    <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
      Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
    </p>
  </div>
  <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px;">
    © ${new Date().getFullYear()} Oyko. Tous droits réservés.
  </p>
</body>
</html>
    `,
  },

  magiclink: {
    subject: "Votre lien de connexion - Oyko",
    html: (data: WebhookPayload, confirmationUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 32px;">
      ${oykoLogoSvg}
      <h1 style="margin: 16px 0 0; font-size: 24px; color: #18181b; font-weight: 600;">Oyko</h1>
    </div>
    <h2 style="font-size: 20px; color: #18181b; margin: 0 0 16px;">Connexion rapide</h2>
    <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Cliquez sur le bouton ci-dessous pour vous connecter instantanément à votre compte Oyko.
    </p>
    <a href="${confirmationUrl}" style="display: block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-align: center; margin-bottom: 24px;">
      Se connecter
    </a>
    <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
      Ce lien expire dans 1 heure.
    </p>
  </div>
  <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px;">
    © ${new Date().getFullYear()} Oyko. Tous droits réservés.
  </p>
</body>
</html>
    `,
  },

  email_change: {
    subject: "Confirmez votre nouvelle adresse email - Oyko",
    html: (data: WebhookPayload, confirmationUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 32px;">
      ${oykoLogoSvg}
      <h1 style="margin: 16px 0 0; font-size: 24px; color: #18181b; font-weight: 600;">Oyko</h1>
    </div>
    <h2 style="font-size: 20px; color: #18181b; margin: 0 0 16px;">Changement d'adresse email</h2>
    <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Vous avez demandé à changer votre adresse email. Cliquez sur le bouton ci-dessous pour confirmer.
    </p>
    <a href="${confirmationUrl}" style="display: block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-align: center; margin-bottom: 24px;">
      Confirmer le changement
    </a>
    <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
      Si vous n'avez pas demandé ce changement, sécurisez votre compte immédiatement.
    </p>
  </div>
  <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px;">
    © ${new Date().getFullYear()} Oyko. Tous droits réservés.
  </p>
</body>
</html>
    `,
  },

  invite: {
    subject: "Vous avez été invité sur Oyko",
    html: (data: WebhookPayload, confirmationUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 32px;">
      ${oykoLogoSvg}
      <h1 style="margin: 16px 0 0; font-size: 24px; color: #18181b; font-weight: 600;">Oyko</h1>
    </div>
    <h2 style="font-size: 20px; color: #18181b; margin: 0 0 16px;">Vous êtes invité !</h2>
    <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Vous avez été invité à rejoindre Oyko. Cliquez sur le bouton ci-dessous pour accepter l'invitation.
    </p>
    <a href="${confirmationUrl}" style="display: block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-align: center; margin-bottom: 24px;">
      Accepter l'invitation
    </a>
    <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
      Cette invitation expire dans 24 heures.
    </p>
  </div>
  <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px;">
    © ${new Date().getFullYear()} Oyko. Tous droits réservés.
  </p>
</body>
</html>
    `,
  },
};

// Génère l'URL de confirmation
function generateConfirmationUrl(emailData: WebhookPayload["email_data"], supabaseUrl: string): string {
  const redirectTo = emailData.redirect_to || SITE_URL;
  return `${supabaseUrl}/auth/v1/verify?token=${emailData.token_hash}&type=${emailData.email_action_type}&redirect_to=${encodeURIComponent(redirectTo)}`;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  console.log("=== RECEIVED REQUEST ===");

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  console.log("Headers:", JSON.stringify(headers, null, 2));

  // Vérifier la signature du webhook
  const wh = new Webhook(hookSecret.replace("v1,whsec_", ""));

  let data: WebhookPayload;
  try {
    data = wh.verify(payload, headers) as WebhookPayload;
    console.log("Webhook verified successfully");
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return new Response(
      JSON.stringify({ error: { message: "Invalid webhook signature" } }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { user, email_data } = data;
  const emailType = email_data.email_action_type;

  console.log(`Processing email type: ${emailType} for user: ${user.email}`);

  // Récupérer le template approprié
  const template = emailTemplates[emailType];
  if (!template) {
    console.error(`Unknown email type: ${emailType}`);
    return new Response(
      JSON.stringify({ error: { message: `Unknown email type: ${emailType}` } }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Générer l'URL de confirmation
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || email_data.site_url;
  const confirmationUrl = generateConfirmationUrl(email_data, supabaseUrl);

  console.log(`Confirmation URL: ${confirmationUrl}`);
  console.log(`Sending from: ${FROM_EMAIL}`);

  try {
    const { data: emailResult, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [user.email],
      subject: template.subject,
      html: template.html(data, confirmationUrl),
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: { message: error.message } }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Email sent successfully to ${user.email} (type: ${emailType})`, emailResult);
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: { message: (error as Error).message } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
