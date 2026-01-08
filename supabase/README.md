# Configuration Supabase - Budget App

Ce guide explique comment configurer Supabase avec Resend pour l'envoi d'emails personnalisés.

## Prérequis

1. Un compte [Supabase](https://supabase.com)
2. Un compte [Resend](https://resend.com)
3. [Supabase CLI](https://supabase.com/docs/guides/cli) installé

## Installation du Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (avec Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# npm
npm install -g supabase
```

## Configuration pas à pas

### 1. Configurer Resend

1. Créez un compte sur [Resend](https://resend.com)
2. Allez dans **API Keys** et créez une nouvelle clé API
3. **Important**: Ajoutez et vérifiez votre domaine dans Resend:
   - Allez dans **Domains** > **Add Domain**
   - Suivez les instructions pour ajouter les enregistrements DNS
   - Attendez la vérification (peut prendre quelques minutes)

### 2. Lier le projet Supabase

```bash
# Connectez-vous à Supabase
supabase login

# Liez votre projet (remplacez par votre project ref)
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Configurer les secrets

Créez un fichier `.env` dans le dossier `supabase/` (copier depuis `.env.example`):

```bash
cp supabase/.env.example supabase/.env
```

Éditez le fichier avec vos valeurs réelles.

Puis uploadez les secrets sur Supabase:

```bash
# Depuis le dossier supabase/
supabase secrets set RESEND_API_KEY=re_votre_cle_api
supabase secrets set FROM_EMAIL="Budget App <noreply@votredomaine.com>"
supabase secrets set SITE_URL=https://votredomaine.com
```

**Note**: Le secret `SEND_EMAIL_HOOK_SECRET` sera généré automatiquement à l'étape suivante.

### 4. Déployer l'Edge Function

```bash
# Depuis la racine du projet
supabase functions deploy send-email --no-verify-jwt
```

### 5. Configurer l'Auth Hook dans Supabase Dashboard

1. Allez dans votre projet Supabase Dashboard
2. **Authentication** > **Hooks**
3. Cliquez sur **Add hook** pour "Send Email"
4. Configurez:
   - **Hook type**: HTTP Request
   - **Method**: POST
   - **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email`
   - Cliquez sur **Generate Secret** pour créer le secret
5. **Copiez le secret généré** et ajoutez-le aux secrets:

```bash
supabase secrets set SEND_EMAIL_HOOK_SECRET="v1,whsec_votre_secret"
```

### 6. Configurer les URLs de redirection

Dans Supabase Dashboard > **Authentication** > **URL Configuration**:

- **Site URL**: `http://localhost:3000` (dev) ou `https://votredomaine.com` (prod)
- **Redirect URLs**: Ajoutez:
  - `http://localhost:3000/auth/callback`
  - `https://votredomaine.com/auth/callback`

## Structure des fichiers

```
supabase/
├── config.toml          # Configuration locale Supabase
├── .env.example         # Template des variables d'environnement
├── .env                  # Variables d'environnement (ne pas commiter)
├── README.md            # Ce fichier
└── functions/
    └── send-email/
        └── index.ts     # Edge Function pour l'envoi d'emails
```

## Templates d'emails

L'Edge Function `send-email` inclut des templates HTML pour les types d'emails suivants:

- **signup**: Confirmation d'inscription
- **recovery**: Réinitialisation de mot de passe
- **magiclink**: Lien de connexion magique
- **email_change**: Changement d'adresse email
- **invite**: Invitation utilisateur

Vous pouvez personnaliser ces templates dans `functions/send-email/index.ts`.

## Tester localement

```bash
# Démarrer Supabase localement
supabase start

# Démarrer les fonctions
supabase functions serve send-email --env-file supabase/.env
```

## Dépannage

### Les emails ne sont pas envoyés

1. Vérifiez que le domaine est bien vérifié dans Resend
2. Vérifiez les logs de l'Edge Function:
   ```bash
   supabase functions logs send-email
   ```
3. Vérifiez que tous les secrets sont bien configurés:
   ```bash
   supabase secrets list
   ```

### Erreur "Invalid webhook signature"

Le secret `SEND_EMAIL_HOOK_SECRET` n'est pas correctement configuré. Assurez-vous de copier le secret complet incluant `v1,whsec_`.

### L'email arrive dans les spams

1. Configurez les enregistrements SPF, DKIM et DMARC pour votre domaine
2. Utilisez un domaine personnalisé (pas le domaine par défaut de Resend)

## Ressources

- [Documentation Supabase Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook)
- [Documentation Resend](https://resend.com/docs)
- [Documentation Supabase CLI](https://supabase.com/docs/guides/cli)
