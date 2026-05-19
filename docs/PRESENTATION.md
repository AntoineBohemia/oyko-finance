# Oyko — Presentation du projet

> Application web de gestion de finances personnelles.
> URL : **oyko.space** | Contact : contact@oyko.fr

---

## Vue d'ensemble

Oyko est une application web francaise qui permet aux particuliers de gerer leurs finances personnelles : suivi des depenses, gestion de budget par enveloppes, suivi du patrimoine (comptes, investissements, dettes), et synchronisation bancaire automatique.

L'application est **gratuite**, responsive (web + mobile), avec un mode clair/sombre. Elle cible le marche francais et est entierement en francais.

**Positionnement** : Alternative simple et gratuite aux apps comme Bankin', Linxo, ou Finary — combinant budget, depenses et patrimoine en un seul outil.

---

## Pages publiques (visiteur non connecte)

### Landing page (`/`)

Page d'accueil marketing composee de plusieurs sections :

1. **Hero** — Titre "Gerez vos finances personnelles simplement", sous-titre, boutons "Demo" et "Commencer", mockup MacBook du dashboard
2. **Carrousel cas d'usage** — 4 profils types avec animations :
   - **Freelance** : separation pro/perso, calcul des charges, export comptable
   - **Couple** : comptes joints, budgets partages, repartition equitable
   - **Famille** : vue consolidee, suivi par enfant, planification vacances
   - **Etudiant** : interface simple, alertes decouvert, 100% gratuit
3. **Grille fonctionnalites** — 4 features interactives (Dashboard, Depenses, Budget, Patrimoine) avec mockup central et graphiques
4. **FAQ** — 6 questions en accordeon anime (gratuite, securite, banques compatibles, categorisation, mobile, budgets intelligents)
5. **CTA** — Bandeau "Pret a reprendre le controle ?" avec boutons Commencer/Contact
6. **Footer** — Logo Oyko, liens, newsletter, badges de confiance (AES-256, RGPD, Heberge en France), liens legaux

### Pages legales

- **Mentions legales** (`/mentions-legales`) — Editeur (Oyko SAS), hebergeur, contact
- **Politique de confidentialite** (`/politique-confidentialite`) — RGPD, donnees collectees, droits
- **CGU** (`/cgu`) — Conditions generales d'utilisation

---

## Parcours d'authentification

### Inscription (`/signup`)

Formulaire en **2 etapes** :
1. **Etape 1** : Nom complet + Email + option "S'inscrire avec Google"
2. **Etape 2** : Mot de passe avec indicateurs en temps reel (8 caracteres, majuscule, minuscule, chiffre) + confirmation

Apres soumission : envoi d'un email de confirmation.

### Verification email (`/verify-email`)

Page d'attente avec :
- Icone animee (pulse)
- 3 etapes visuelles : "Ouvrez votre boite de reception" > "Cliquez sur le lien" > "Configurez votre compte"
- Lien pour reessayer

### Confirmation email (`/email-confirmed`)

Page de succes avec :
- Icone celebratoire (check vert)
- Compte a rebours de 5 secondes avant redirection automatique vers l'onboarding
- Barre de progression visuelle

### Connexion (`/login`)

- Email + Mot de passe
- "Se souvenir de moi" + "Mot de passe oublie"
- Connexion Google (OAuth)
- Redirection vers `/dashboard` ou vers l'URL d'origine (parametre `redirectTo`)
- Detection automatique : si le profil n'a pas de revenus configures → redirection vers `/onboarding`

### Onboarding (`/onboarding`)

Parcours guide en **6 etapes** avec barre de progression :

| Etape | Nom | Description |
|-------|-----|-------------|
| 1 | **Revenus** | Saisie du revenu mensuel net |
| 2 | **Charges fixes** | Ajout des charges recurrentes (loyer, telephone, abonnements...) avec suggestions preconfigurees |
| 3 | **Budget** | Configuration des enveloppes de depenses variables (Alimentation, Transport, Loisirs, Vetements, Imprevus) avec montants ajustables |
| 4 | **Epargne** | Definition d'un objectif d'epargne mensuel |
| 5 | **Mode** | Choix du mode de gestion : "Semaine" ou "Mois" |
| 6 | **Comptes** | Connexion bancaire automatique via Bridge API, ou ajout manuel de comptes (courant, epargne, cash) |

---

## Application (pages protegees — utilisateur connecte)

### Navigation

**Desktop** : Sidebar slim a gauche avec icones (Accueil, Depenses, Budget, Patrimoine) + Parametres en bas.

**Mobile** : Header sticky avec hamburger → drawer lateral avec la navigation complete, avatar utilisateur, et toggle theme.

Toutes les pages ont un **header contextuel** avec titre de page et description.

---

### Dashboard / Accueil (`/dashboard`)

Vue d'ensemble des finances avec :

- **Mode de vue** : basculer entre vue "Semaine" et vue "Mois"
- **Solde disponible** : montant restant a depenser sur la periode, avec jours restants
- **Patrimoine** : valeur nette, variation mensuelle (%), repartition en donut chart (liquidites, investissements par type, epargne)
- **Enveloppes budget** : liste des categories de depenses variables avec barres de progression (depense vs budget)
- **Charges fixes du mois** : prochains prelevements avec dates et montants
- **Dernieres transactions** : historique recent avec categorie, description, montant
- **Import CSV/Excel** : bouton d'import de fichier pour ajouter des transactions en masse (XLSX)
- **Connexion bancaire** : acces a la connexion Bridge depuis le dashboard

---

### Depenses (`/depenses`)

Page de gestion des transactions avec :

- **Graphique en barres** (Recharts) : depenses par jour sur la periode selectionnee
- **Filtres de periode** : Cette semaine, Ce mois, Mois dernier, Tout
- **Recherche** par description
- **Liste des transactions** groupee par jour :
  - Chaque transaction affiche : icone categorie, description, compte source, montant (rouge pour depense, vert pour revenu)
  - Actions : modifier, supprimer
- **Ajout de transaction** : modale avec montant, categorie (depense ou revenu), compte, description, date
- **Suppression** de transactions

---

### Budget (`/budget`)

Page de gestion budgetaire avec :

- **Navigation mensuelle** : fleches pour changer de mois
- **Resume du mois** :
  - Revenus du mois
  - Total charges fixes (avec lien vers la sous-page)
  - Reste a vivre (revenus - charges fixes - epargne)
  - Jours restants dans le mois
- **Enveloppes de depenses** : grille de cartes avec pour chaque categorie :
  - Icone + nom
  - Barre de progression (depense / budget)
  - Montant depense / budget total
  - Possibilite de modifier le budget
- **Tableau des charges fixes** : liste des prelevements du mois avec statut (preleve / a venir / jour du prelevement)
- **Ajout d'enveloppe** : modale de creation de nouvelle categorie de depense

#### Sous-page : Charges fixes (`/budget/charges-fixes`)

Page dediee a la gestion detaillee des charges recurrentes :

- **Metriques** : nombre d'abonnements actifs/inactifs, cout mensuel total, cout annuel total, prochain prelevement
- **Vue calendrier** : calendrier mensuel avec les prelevements positionnes sur leurs jours
- **Vue tableau** : tableau triable/filtrable avec colonnes (nom, montant, frequence, categorie, compte, prochain prelevement, statut)
- **Repartition par categorie** : donut chart (Streaming, Transport, Telecom, Sport, etc.)
- **Timeline** : prochains prelevements a venir
- **CRUD complet** : ajout, modification, activation/desactivation, suppression
- **Frequences** : hebdomadaire, mensuel, trimestriel, annuel — avec calcul automatique du cout mensuel/annuel

---

### Patrimoine (`/patrimoine`)

Vue consolidee du patrimoine avec :

- **Metriques principales** :
  - Valeur nette (actifs - dettes)
  - Total liquidites
  - Total investissements
  - Total dettes
  - Plus-value globale (montant et %)
  - Total mensualites dettes
- **Graphique d'evolution** (AreaChart) : evolution sur 12 mois des actifs, passifs et valeur nette
- **Onglets** : Vue d'ensemble / Comptes / Investissements / Dettes
- **Liste des comptes** : type (courant/epargne/cash), banque, solde — avec modification du solde
- **Liste des investissements** : nom, type, valeur actuelle, plus-value — avec lien vers la page detaillee
- **Liste des dettes** : nom, type, capital restant, barre de progression du remboursement — avec lien vers la page detaillee
- **Ajout de compte** : modale (nom, banque, solde, type)

#### Sous-page : Investissements (`/patrimoine/investissements`)

Page detaillee du portfolio d'investissements :

- **Metriques** : total investi, valeur actuelle, plus-value globale (montant + %), nombre d'actifs
- **Graphique d'evolution** (AreaChart) : evolution de la valeur du portfolio vs montant investi
- **Repartition par type** (RadialBarChart) : ETF, Actions, Crypto, Immobilier, Obligations, Autre
- **Performance annuelle** : graphique comparatif sur 3 ans
- **Tableau du portfolio** : triable, filtrable, paginable, avec colonnes (actif, type, plateforme, quantite, prix achat, prix actuel, valeur, plus-value, date achat)
- **CRUD** : ajout, modification, renforcement de position (achat supplementaire avec calcul du prix moyen pondere), mise a jour du prix actuel, suppression
- **Recherche et filtres** par type

#### Sous-page : Dettes (`/patrimoine/dettes`)

Page detaillee des emprunts :

- **Metriques** : dette totale, mensualite totale, taux moyen pondere, progression globale du remboursement
- **Repartition par type** (PieChart) : pret etudiant, immobilier, consommation, auto, personnel, autre
- **Onglets** : Toutes / Par type
- **Tableau** : triable, filtrable, avec colonnes (dette, type, capital restant, mensualite, taux, prochain prelevement, progression)
- **Vue detail par dette** : barre de progression du remboursement, informations du preteur, dates, notes
- **CRUD** : ajout, modification (capital restant, mensualite, notes), suppression
- **Recherche et filtres** par type de dette

---

### Parametres (`/parametres`)

Page de configuration du profil et de l'application :

- **Profil financier** :
  - Revenus mensuels (modification)
  - Objectif d'epargne (modification)
  - Mode de gestion : semaine ou mois
- **Categories de depenses** (enveloppes) :
  - Liste avec icone, nom, budget mensuel
  - Ajout, modification, suppression
- **Charges fixes** :
  - Liste avec nom, montant, jour de prelevement, statut actif/inactif
  - Ajout, suppression
- **Comptes bancaires** :
  - Liste avec nom, banque, solde, type
  - Ajout, suppression
- **Apparence** : Toggle mode clair/sombre (disponible dans le sidebar egalement)
- **Export** : Possibilite d'exporter les donnees
- **Deconnexion**

---

## Connexion bancaire (Open Banking)

### Fonctionnement

Oyko utilise **Bridge API** (partenaire agree ACPR) pour la synchronisation bancaire :

1. L'utilisateur clique "Connecter ma banque" (depuis l'onboarding ou le dashboard)
2. Un appel a l'Edge Function `bridge-connect` cree une session Connect
3. L'utilisateur est redirige vers Bridge pour s'authentifier aupres de sa banque
4. Apres authentification, retour sur `/bank/callback`
5. La page de callback declenche une synchronisation via `bridge-sync`
6. Les comptes et transactions sont importes dans Supabase

### Page callback bancaire (`/bank/callback`)

Ecran de retour apres connexion bancaire avec 4 etats :
- **Loading** : traitement de la reponse
- **Syncing** : recuperation des comptes et transactions (spinner)
- **Success** : nombre de comptes et transactions synchronises
- **Error** : message d'erreur + boutons "Reessayer" / "Continuer sans banque"

### Synchronisation continue

Les webhooks Bridge (`bridge-webhook`) maintiennent les donnees a jour automatiquement :
- Nouveau compte (`item.created`)
- Compte rafraichi (`item.refreshed`)
- Transactions mises a jour (`item.account.updated`)
- Connexion supprimee (`item.deleted`)

Compatible avec **350+ banques** francaises et europeennes (BNP, SG, CA, Boursorama, Revolut, N26...).

---

## Stack technique (resume)

| Composant | Technologie |
|-----------|-------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, Untitled UI (design system) |
| Graphiques | Recharts |
| Animations | Motion (Framer Motion) |
| Auth & BDD | Supabase (PostgreSQL, Auth, Edge Functions) |
| Open Banking | Bridge API |
| Deploiement | Vercel (infere) |
| Theme | next-themes (clair/sombre) |
| Carousel | Embla Carousel |

---

## Architecture des pages

```
/                              Landing page
├── /mentions-legales          Mentions legales
├── /politique-confidentialite Politique de confidentialite
├── /cgu                       Conditions generales d'utilisation
│
├── /login                     Connexion
├── /signup                    Inscription (2 etapes)
├── /verify-email              Attente verification email
├── /email-confirmed           Confirmation email reussie
├── /onboarding                Configuration initiale (6 etapes)
│
├── /auth/callback             Callback OAuth (Google / email confirm)
├── /bank/callback             Callback connexion bancaire Bridge
│
├── /dashboard                 Accueil / Vue d'ensemble
├── /depenses                  Gestion des transactions
├── /budget                    Budget par enveloppes
│   └── /budget/charges-fixes  Gestion des charges recurrentes
├── /patrimoine                Vue patrimoine global
│   ├── /patrimoine/investissements  Portfolio investissements
│   └── /patrimoine/dettes           Gestion des dettes
└── /parametres                Configuration du compte
```

---

## Schema de donnees (tables principales)

| Table | Description |
|-------|-------------|
| `profiles` | Profil utilisateur (revenus, objectif epargne, mode gestion, patterns salaire) |
| `comptes` | Comptes bancaires manuels (courant, epargne, cash) |
| `categories` | Categories de depenses et revenus (budget mensuel, icone, couleur) |
| `charges_fixes` | Charges recurrentes (montant, frequence, jour prelevement, patterns de matching) |
| `transactions` | Transactions manuelles et synchronisees (montant, date, categorie, source) |
| `investissements` | Portfolio d'investissements (ticker, quantite, prix, plus-value) |
| `dettes` | Emprunts (capital, taux, mensualite, preteur) |
| `historique_soldes` | Snapshots mensuels du patrimoine (liquidites, investissements, dettes, valeur nette) |
| `bank_connections` | Connexions Open Banking (Bridge provider, statut, derniere sync) |
| `bank_accounts` | Comptes bancaires synchronises (IBAN, solde, devise) |

---

## Securite & conformite

- **Authentification** : Supabase Auth avec double verification (middleware + layout server-side)
- **Tokens** : Verification serveur via `getUser()` (et non `getSession()`)
- **Open Banking** : Partenaire agree ACPR, chiffrement AES-256 annonce
- **Webhooks** : Verification de signature HMAC-SHA256 avec protection timing-safe
- **Donnees** : Hebergement en France, conformite RGPD annoncee
- **HTTPS** : Force par defaut via Vercel
- **OAuth** : Google Sign-In avec flow PKCE via Supabase

---

## Fonctionnalites cles

- Budget par enveloppes avec barres de progression en temps reel
- Vue semaine ou mois au choix
- Import de transactions CSV/Excel
- Synchronisation bancaire automatique (350+ banques)
- Suivi du patrimoine (liquidites + investissements + dettes)
- Gestion de portfolio avec prix moyen pondere
- Charges fixes avec calendrier visuel
- Onboarding guide en 6 etapes
- Mode clair/sombre
- Responsive (desktop + mobile)
- 100% gratuit
