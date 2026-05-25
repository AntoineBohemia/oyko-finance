# Backend — Implémentation de la vérification d'email

> Spec complète pour que le backend Spring Boot gère l'envoi d'emails de vérification et le flow complet.

---

## Contexte

Actuellement, l'inscription (`POST /api/v1/auth/register`) crée l'utilisateur mais **n'envoie aucun email**. L'envoi était prévu via Supabase Edge Functions + Resend, mais le backend Spring Boot ne déclenche jamais le webhook Supabase. Le flow est cassé.

**Objectif :** Le backend prend en charge l'intégralité du flow de vérification email :
1. Génère un token de vérification à l'inscription
2. Envoie l'email via Resend (ou SMTP)
3. Vérifie le token quand l'utilisateur clique sur le lien
4. Permet de renvoyer l'email

---

## Changements DB requis

### Table `users` — colonnes à ajouter/vérifier

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token_expires_at TIMESTAMP NULL;
```

---

## Endpoints à implémenter / modifier

### 1. `POST /api/v1/auth/register` — Modifier

**Comportement actuel :** Crée l'utilisateur, retourne `201`.

**Nouveau comportement :**
1. Créer l'utilisateur avec `email_verified = false`
2. Générer un token de vérification (UUID v4 ou token crypto aléatoire 64 chars)
3. Stocker le token hashé (SHA-256) + date d'expiration (24h) dans la table `users`
4. **Envoyer l'email de vérification** avec le lien :
   ```
   {FRONTEND_URL}/api/auth/verify-callback?token={token_brut}
   ```
5. Retourner `201 { "message": "Vérifiez votre email" }`

**Variables de configuration :**
```properties
# application.properties ou application.yml
app.frontend-url=http://localhost:3000          # URL du frontend (pour les liens email)
app.email.from=Oyko <noreply@oyko.space>        # Adresse d'envoi
app.email.verification-ttl=24h                  # Durée de validité du token

# Resend API (recommandé)
resend.api-key=${RESEND_API_KEY}

# OU SMTP classique
spring.mail.host=smtp.example.com
spring.mail.port=587
spring.mail.username=${SMTP_USER}
spring.mail.password=${SMTP_PASSWORD}
```

**Sécurité du token :**
- Stocker le **hash SHA-256** du token en DB, pas le token brut
- Envoyer le **token brut** dans l'email
- À la vérification, hasher le token reçu et comparer avec le hash en DB
- Cela protège contre les fuites de DB (le token brut n'est jamais stocké)

---

### 2. `GET /api/v1/auth/verify?token={token}` — Déjà dans la spec, à implémenter

**Comportement :**
1. Recevoir le `token` en query param
2. Hasher le token reçu (SHA-256)
3. Chercher l'utilisateur avec ce hash en DB
4. Vérifications :
   - Token trouvé ? Sinon → `400 INVALID_TOKEN`
   - Token non expiré ? Sinon → `410 TOKEN_EXPIRED`
   - Email pas déjà vérifié ? Sinon → `200` (idempotent, pas d'erreur)
5. Mettre à jour :
   ```sql
   UPDATE users
   SET email_verified = true,
       email_verified_at = NOW(),
       email_verification_token = NULL,
       email_verification_token_expires_at = NULL
   WHERE id = ?
   ```
6. Retourner `200 { "message": "Email vérifié avec succès" }`

**Réponses :**
```json
// 200 — succès
{ "message": "Email vérifié avec succès" }

// 400 — token invalide
{ "status": 400, "detail": "Token de vérification invalide", "code": "INVALID_TOKEN" }

// 410 — token expiré
{ "status": 410, "detail": "Le lien de vérification a expiré. Demandez un nouvel email.", "code": "TOKEN_EXPIRED" }
```

---

### 3. `POST /api/v1/auth/resend-verification` — Nouveau endpoint

**Body :**
```json
{ "email": "user@example.com" }
```

**Comportement :**
1. Chercher l'utilisateur par email
2. Vérifications :
   - Utilisateur existe ? Sinon → `200` (ne pas révéler si l'email existe)
   - Email déjà vérifié ? Sinon → `200` (idem, pas de fuite d'info)
   - Rate limit : max 1 email / 60 secondes par adresse → `429 TOO_MANY_REQUESTS`
3. Générer un **nouveau token** (invalide l'ancien)
4. Envoyer l'email
5. Retourner `200 { "message": "Si cette adresse existe, un email a été envoyé." }`

**Réponse (toujours 200 sauf rate limit) :**
```json
// 200 — dans tous les cas (sécurité : pas d'user enumeration)
{ "message": "Si cette adresse existe, un email a été envoyé." }

// 429 — trop de demandes
{ "status": 429, "detail": "Veuillez patienter avant de demander un nouvel email.", "code": "TOO_MANY_REQUESTS" }
```

**Rate limiting :**
- Stocker `last_verification_email_sent_at` dans la table users ou en cache (Redis/in-memory)
- Refuser si < 60 secondes depuis le dernier envoi

---

### 4. `POST /api/v1/auth/login` — Modifier

**Changement :** S'assurer que le login retourne bien `403 EMAIL_NOT_VERIFIED` si `email_verified = false`.

```json
// 403
{ "status": 403, "detail": "Veuillez vérifier votre email avant de vous connecter.", "code": "EMAIL_NOT_VERIFIED" }
```

---

## Template d'email

L'email envoyé doit contenir un lien vers :
```
{FRONTEND_URL}/api/auth/verify-callback?token={token_brut}
```

### Template HTML recommandé

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

    <!-- Logo Oyko -->
    <div style="text-align: center; margin-bottom: 32px;">
      <svg viewBox="0 0 40 48" fill="none" width="40" height="48" style="display: inline-block;">
        <path d="m27.6627 4h-15.3253l-12.3374 12.3373v15.3253l12.3374 12.3374h15.3253l12.3373-12.3374v-15.3253zm-13.2049 27.8554-7.90357-7.9036 7.90357-7.9036c2.988-2.988 7.9037-2.988 10.8916 0l7.9036 7.9036-7.9036 7.9036c-2.9879 2.988-7.8072 2.988-10.8916 0z" fill="#18181B"/>
      </svg>
      <h1 style="margin: 16px 0 0; font-size: 24px; color: #18181b; font-weight: 600;">Oyko</h1>
    </div>

    <h2 style="font-size: 20px; color: #18181b; margin: 0 0 16px;">
      Bienvenue {{prenom}} !
    </h2>

    <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Merci de vous être inscrit sur Oyko. Pour activer votre compte et commencer à gérer vos finances, confirmez votre adresse email.
    </p>

    <!-- CTA — couleur brand anthracite, pas violet -->
    <a href="{{verification_url}}"
       style="display: block; background-color: #18181B; color: #BEFF00; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-align: center; margin-bottom: 24px;">
      Confirmer mon email
    </a>

    <p style="color: #a1a1aa; font-size: 13px; line-height: 1.5; margin: 0 0 8px;">
      Ce lien expire dans 24 heures.
    </p>
    <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
      Si vous n'avez pas créé de compte sur Oyko, ignorez cet email.
    </p>
  </div>

  <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px;">
    © 2026 Oyko · Fait en France
  </p>
</body>
</html>
```

**Variables du template :**
- `{{prenom}}` — prénom de l'utilisateur (fallback : partie avant @ de l'email)
- `{{verification_url}}` — `{FRONTEND_URL}/api/auth/verify-callback?token={token}`

---

## Option d'envoi : Resend API (recommandé)

Resend est déjà utilisé côté Supabase Edge Functions. Utiliser la même API côté Spring Boot.

### Dépendance Maven
```xml
<!-- Pas de SDK Java officiel Resend — utiliser un appel HTTP direct -->
<!-- Ou utiliser le SDK community : -->
<dependency>
  <groupId>com.resendlabs</groupId>
  <artifactId>resend-java</artifactId>
  <version>3.1.0</version>
</dependency>
```

### Appel HTTP direct (alternative sans dépendance)
```java
// POST https://api.resend.com/emails
// Header: Authorization: Bearer {RESEND_API_KEY}
// Body:
{
  "from": "Oyko <noreply@oyko.space>",
  "to": ["user@example.com"],
  "subject": "Confirmez votre inscription - Oyko",
  "html": "..."
}
```

### Configuration Resend
- Créer un compte sur https://resend.com
- Vérifier le domaine `oyko.space` (DNS records MX/SPF/DKIM)
- Générer une API key
- Stocker dans `RESEND_API_KEY` (variable d'environnement, PAS dans le code)

---

## Flow complet après implémentation

```
1. Utilisateur s'inscrit
   POST /api/v1/auth/register { email, password, prenom, nom }
   └── Backend crée user (email_verified=false)
   └── Backend génère token, hash SHA-256, stocke hash + expiry en DB
   └── Backend envoie email via Resend avec lien :
       {FRONTEND_URL}/api/auth/verify-callback?token={token_brut}
   └── Retourne 201 { message: "Vérifiez votre email" }
   └── Frontend redirige vers /verify-email?email={email}

2. Utilisateur clique sur le lien dans l'email
   GET {FRONTEND_URL}/api/auth/verify-callback?token={token}
   └── Next.js proxy → GET /api/v1/auth/verify?token={token}
   └── Backend vérifie hash, marque email_verified=true
   └── Next.js redirige vers /email-confirmed?next=/login

3. Utilisateur se connecte
   POST /api/v1/auth/login { email, password }
   └── Si email_verified=false → 403 EMAIL_NOT_VERIFIED
   └── Si vérifié → 200 { user, accessToken, refreshToken }

4. (Optionnel) Utilisateur renvoie l'email
   POST /api/v1/auth/resend-verification { email }
   └── Rate limit 60s
   └── Nouveau token (invalide l'ancien)
   └── Renvoie l'email
   └── 200 { message: "Si cette adresse existe, un email a été envoyé." }
```

---

## Checklist d'implémentation backend

- [ ] Ajouter colonnes DB : `email_verified`, `email_verified_at`, `email_verification_token`, `email_verification_token_expires_at`
- [ ] Modifier `POST /api/v1/auth/register` : générer token + envoyer email
- [ ] Implémenter `GET /api/v1/auth/verify?token=` : valider token, marquer vérifié
- [ ] Implémenter `POST /api/v1/auth/resend-verification` : rate limit + nouvel email
- [ ] Vérifier que `POST /api/v1/auth/login` retourne bien `403 EMAIL_NOT_VERIFIED`
- [ ] Configurer Resend (API key + domaine vérifié) ou SMTP
- [ ] Template email avec branding Oyko (anthracite + lime, pas violet)
- [ ] Supprimer `POST /api/v1/auth/auto-verify` (ou le garder uniquement en profil `dev`)
- [ ] Tests : inscription → email reçu → clic lien → email confirmé → login OK

---

## Modifications frontend déjà effectuées

Les fichiers suivants ont été modifiés/créés côté frontend pour supporter ce flow :

| Fichier | Changement |
|---------|------------|
| `src/app/(auth)/verify-email/page.tsx` | Bouton "Renvoyer l'email" ajouté, skip-verify conditionné à `DEV_MODE`, affichage des erreurs |
| `src/app/api/auth/resend-verification/route.ts` | **Nouveau** — proxy vers `POST /api/v1/auth/resend-verification` |
| `src/app/api/auth/verify-callback/route.ts` | **Nouveau** — reçoit `?token=`, appelle backend, redirige vers `/email-confirmed` |
| `src/app/api/auth/skip-verify/route.ts` | Conditionné à `NEXT_PUBLIC_DEV_MODE=true` (403 en prod) |
| `middleware.ts` | `/api/auth/verify-callback` ajouté aux routes auth (pas de redirect si logged in) |
| `src/lib/api/auth.ts` | `verifyEmail(token)` existait déjà — prêt |

Le frontend est prêt. Il attend les 3 endpoints backend ci-dessus.
