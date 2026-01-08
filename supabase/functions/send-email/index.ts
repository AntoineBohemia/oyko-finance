import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string;

// Configuration
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Budget App <noreply@votredomaine.com>";
const SITE_URL = Deno.env.get("SITE_URL") || "http://localhost:3000";

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

// Templates d'emails en français
const emailTemplates = {
  signup: {
    subject: "Confirmez votre inscription - Budget App",
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
      <div style="display: inline-block; width: 48px; height: 48px; background-color: #7c3aed; border-radius: 12px; line-height: 48px; font-size: 24px;">
        💰
      </div>
      <h1 style="margin: 16px 0 0; font-size: 24px; color: #18181b;">Budget App</h1>
    </div>

    <h2 style="font-size: 20px; color: #18181b; margin: 0 0 16px;">Bienvenue ${data.user.user_metadata?.prenom || ""} !</h2>

    <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Merci de vous être inscrit sur Budget App. Pour activer votre compte et commencer à gérer votre budget, veuillez confirmer votre adresse email.
    </p>

    <a href="${confirmationUrl}" style="display: block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-align: center; margin-bottom: 24px;">
      Confirmer mon email
    </a>

    <p style="color: #71717a; font-size: 14px; margin: 0 0 8px;">
      Ou utilisez ce code de confirmation :
    </p>
    <div style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #18181b;">${data.email_data.token}</span>
    </div>

    <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
      Si vous n'avez pas créé de compte sur Budget App, vous pouvez ignorer cet email.
    </p>
  </div>

  <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px;">
    © ${new Date().getFullYear()} Budget App. Tous droits réservés.
  </p>
</body>
</html>
    `,
  },

  recovery: {
    subject: "Réinitialisez votre mot de passe - Budget App",
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
      <div style="display: inline-block; width: 48px; height: 48px; background-color: #7c3aed; border-radius: 12px; line-height: 48px; font-size: 24px;">
        🔐
      </div>
      <h1 style="margin: 16px 0 0; font-size: 24px; color: #18181b;">Budget App</h1>
    </div>

    <h2 style="font-size: 20px; color: #18181b; margin: 0 0 16px;">Réinitialisation du mot de passe</h2>

    <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
    </p>

    <a href="${confirmationUrl}" style="display: block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-align: center; margin-bottom: 24px;">
      Réinitialiser mon mot de passe
    </a>

    <p style="color: #71717a; font-size: 14px; margin: 0 0 8px;">
      Ou utilisez ce code :
    </p>
    <div style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #18181b;">${data.email_data.token}</span>
    </div>

    <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
      Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. Votre mot de passe restera inchangé.
    </p>
  </div>

  <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px;">
    © ${new Date().getFullYear()} Budget App. Tous droits réservés.
  </p>
</body>
</html>
    `,
  },

  magiclink: {
    subject: "Votre lien de connexion - Budget App",
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
      <div style="display: inline-block; width: 48px; height: 48px; background-color: #7c3aed; border-radius: 12px; line-height: 48px; font-size: 24px;">
        ✨
      </div>
      <h1 style="margin: 16px 0 0; font-size: 24px; color: #18181b;">Budget App</h1>
    </div>

    <h2 style="font-size: 20px; color: #18181b; margin: 0 0 16px;">Connexion rapide</h2>

    <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Cliquez sur le bouton ci-dessous pour vous connecter instantanément à votre compte Budget App.
    </p>

    <a href="${confirmationUrl}" style="display: block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-align: center; margin-bottom: 24px;">
      Se connecter
    </a>

    <p style="color: #71717a; font-size: 14px; margin: 0 0 8px;">
      Ou utilisez ce code :
    </p>
    <div style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #18181b;">${data.email_data.token}</span>
    </div>

    <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
      Ce lien expire dans 1 heure. Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet email.
    </p>
  </div>

  <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px;">
    © ${new Date().getFullYear()} Budget App. Tous droits réservés.
  </p>
</body>
</html>
    `,
  },

  email_change: {
    subject: "Confirmez votre nouvelle adresse email - Budget App",
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
      <div style="display: inline-block; width: 48px; height: 48px; background-color: #7c3aed; border-radius: 12px; line-height: 48px; font-size: 24px;">
        📧
      </div>
      <h1 style="margin: 16px 0 0; font-size: 24px; color: #18181b;">Budget App</h1>
    </div>

    <h2 style="font-size: 20px; color: #18181b; margin: 0 0 16px;">Changement d'adresse email</h2>

    <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Vous avez demandé à changer votre adresse email. Cliquez sur le bouton ci-dessous pour confirmer ce changement.
    </p>

    <a href="${confirmationUrl}" style="display: block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-align: center; margin-bottom: 24px;">
      Confirmer le changement
    </a>

    <p style="color: #71717a; font-size: 14px; margin: 0 0 8px;">
      Ou utilisez ce code :
    </p>
    <div style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #18181b;">${data.email_data.token}</span>
    </div>

    <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
      Si vous n'avez pas demandé ce changement, veuillez sécuriser votre compte immédiatement.
    </p>
  </div>

  <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px;">
    © ${new Date().getFullYear()} Budget App. Tous droits réservés.
  </p>
</body>
</html>
    `,
  },

  invite: {
    subject: "Vous avez été invité sur Budget App",
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
      <div style="display: inline-block; width: 48px; height: 48px; background-color: #7c3aed; border-radius: 12px; line-height: 48px; font-size: 24px;">
        🎉
      </div>
      <h1 style="margin: 16px 0 0; font-size: 24px; color: #18181b;">Budget App</h1>
    </div>

    <h2 style="font-size: 20px; color: #18181b; margin: 0 0 16px;">Vous êtes invité !</h2>

    <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Vous avez été invité à rejoindre Budget App. Cliquez sur le bouton ci-dessous pour accepter l'invitation et créer votre compte.
    </p>

    <a href="${confirmationUrl}" style="display: block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-align: center; margin-bottom: 24px;">
      Accepter l'invitation
    </a>

    <p style="color: #71717a; font-size: 14px; margin: 0 0 8px;">
      Ou utilisez ce code :
    </p>
    <div style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #18181b;">${data.email_data.token}</span>
    </div>

    <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
      Cette invitation expire dans 24 heures.
    </p>
  </div>

  <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px;">
    © ${new Date().getFullYear()} Budget App. Tous droits réservés.
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

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  // Vérifier la signature du webhook
  const wh = new Webhook(hookSecret.replace("v1,whsec_", ""));

  let data: WebhookPayload;
  try {
    data = wh.verify(payload, headers) as WebhookPayload;
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return new Response(
      JSON.stringify({ error: { message: "Invalid webhook signature" } }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { user, email_data } = data;
  const emailType = email_data.email_action_type;

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

  try {
    const { error } = await resend.emails.send({
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

    console.log(`Email sent successfully to ${user.email} (type: ${emailType})`);
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: { message: error.message } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
