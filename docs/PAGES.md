# Oyko — Pages & Fonctionnalites MVP

> Reference exhaustive de chaque page de l'application.
> Pour chaque page : ce qu'elle fait, ce qui existe aujourd'hui, et ce qui reste a faire pour le MVP.
>
> Principe : MVP efficace, pas de surcharge. On garde ce qui marche, on simplifie ce qui est trop complexe.

---

## Navigation globale

**Desktop** : Sidebar slim a gauche avec icones (Dashboard, Depenses, Budget, Patrimoine) + Parametres en bas.

**Mobile** : Header sticky avec hamburger, drawer lateral, avatar, toggle theme.

**Statut** : Existe et fonctionne.

---

## 1. Pages publiques

### 1.1 Landing page (`/`)

Page marketing. Hors scope MVP backend — ne requete aucune API. Reste telle quelle.

### 1.2 Pages legales (`/mentions-legales`, `/politique-confidentialite`, `/cgu`)

Pages statiques. Hors scope MVP backend.

---

## 2. Authentification

### 2.1 Inscription (`/signup`)

**Ce que ca fait :**
- Formulaire 2 etapes : nom + email, puis mot de passe avec validation temps reel
- Envoi email de confirmation

**Aujourd'hui** : Supabase Auth gere tout (formulaire UI existe).

**MVP** : Le formulaire UI reste identique. Le backend Spring Boot expose `POST /api/v1/auth/register` avec email + password + nom. Le front appelle cette API au lieu de Supabase Auth.

### 2.2 Connexion (`/login`)

**Ce que ca fait :**
- Email + mot de passe
- "Se souvenir de moi"
- Redirection vers `/dashboard` ou `/onboarding` si profil incomplet

**Aujourd'hui** : Supabase Auth.

**MVP** : `POST /api/v1/auth/login` retourne access token (15min) + refresh token (7j). Le front stocke les tokens (cookies HttpOnly). Le middleware Next.js verifie le token pour proteger les routes.

### 2.3 Verification email (`/verify-email`) & Confirmation (`/email-confirmed`)

**MVP** : Simplifier. Un seul endpoint `GET /api/v1/auth/verify?token=xxx` valide le compte. Pas besoin de page intermediaire complexe pour le MVP.

### 2.4 Onboarding (`/onboarding`)

**Ce que ca fait :**
- Parcours guide en 6 etapes : Revenus, Charges fixes, Budget (enveloppes), Epargne, Mode (semaine/mois), Comptes

**Aujourd'hui** : Existe cote UI. Appelle Supabase pour persister chaque etape.

**MVP** : Garder les 6 etapes UI. Le backend expose `POST /api/v1/onboarding` qui recoit la config complete en une seule requete (revenus, charges, categories, epargne, mode, comptes). Plus simple qu'un endpoint par etape.

---

## 3. Dashboard (`/dashboard`)

**Ce que ca fait (visible sur screenshot) :**

| Zone | Description |
|------|-------------|
| **Header** | "Semaine 20 - Mai 2026", toggle Semaine/Mois, fleches navigation |
| **Budget card** | Carte violette : montant depense / budget total, pourcentage, reste, barre de progression |
| **Actions** | Bouton "+ Depense cash" (ouvre modale ajout rapide), bouton "Importer" |
| **Enveloppes** | 4 cartes (max visible) avec icone, nom, depense/budget, barre, reste. Lien "Voir toutes" |
| **Barre resume** | Revenus - Charges = Disponible |
| **Dernieres transactions** | 5 dernieres transactions avec description, date relative, montant. Lien "Voir tout" |
| **Prochains prelevements** | 4 prochaines charges fixes avec icone, nom, delai, montant. Lien "Voir tout" |

**Aujourd'hui** : Tout existe et fonctionne (donnees mock).

**MVP** : Garder tel quel. Un seul endpoint `GET /api/v1/dashboard?mode=semaine&period=2026-05-19` retourne toutes les donnees agregees.

**Pas dans le MVP** : Connexion bancaire depuis le dashboard (bouton "Importer" reste mais pour CSV uniquement).

---

## 4. Depenses (`/depenses`)

**Ce que ca fait (visible sur screenshot) :**

| Zone | Description |
|------|-------------|
| **Header** | Titre "Depenses", bouton "Exporter" |
| **Formulaire inline** | Montant + pills categories (Alimentation, Transport, Loisirs, Vetements, Imprevus) + description + compte + date + bouton Enregistrer |
| **Ajout revenu** | Lien "+ Revenu" sous le formulaire |
| **Sidebar droite** | Resume "Cette semaine" (depenses, revenus, balance), "Top categories" (classement), graphique barres "7 derniers jours" |
| **Historique** | Liste groupee par jour (Aujourd'hui, Hier, dates). Chaque transaction : checkbox, icone categorie, description, heure, montant, badge categorie. Badge "Fixe" pour les charges fixes |
| **Filtres** | Bouton "Filtres" (dropdown) |

**Aujourd'hui** : Existe et fonctionne.

**MVP** : Garder tel quel. Endpoints :
- `GET /api/v1/transactions?period=week&date=2026-05-13` — liste + resume + top categories
- `POST /api/v1/transactions` — ajouter depense ou revenu
- `DELETE /api/v1/transactions/{id}` — supprimer
- `GET /api/v1/transactions/export?format=csv` — export CSV

**Simplification MVP** : Pas de modification de transaction (seulement ajout et suppression). L'edition viendra en V2.

---

## 5. Budget (`/budget`)

**Ce que ca fait (visible sur screenshot) :**

| Zone | Description |
|------|-------------|
| **Header** | "Budget - Mai 2026", fleches navigation mois, bouton "Modifier les enveloppes" |
| **Resume du mois** | Carte : Revenus - Charges fixes = Disponible pour depenses variables |
| **Barre budget** | Depense ce mois (montant + %), reste a depenser (montant + jours restants), barre progression |
| **Enveloppes variables** | Tableau : Categorie (icone + nom), Prevu, Depense, Reste, barre progression, statut (OK/Depasse). Lien "Modifier" |
| **Charges fixes** | Tableau : Charge (icone + nom), Montant, Statut (Preleve / J-X), Date. Lien "Gerer les abonnements" |
| **Vue par semaine** | Onglets Sem 1-4 avec total par semaine. Detail : budget semaine, depense, reste, liste transactions |
| **Total mensuel** | Ligne totale des charges fixes |

**Aujourd'hui** : Existe et fonctionne.

**MVP** : Garder tel quel. Endpoints :
- `GET /api/v1/budget?year=2026&month=5` — resume + enveloppes + charges fixes + vue semaine
- `PUT /api/v1/categories/{id}/budget` — modifier le budget d'une enveloppe

---

## 6. Charges fixes (`/budget/charges-fixes`)

**Ce que ca fait (visible sur screenshot) :**

| Zone | Description |
|------|-------------|
| **Header** | "Charges fixes", boutons "Importer" + "Nouvelle charge fixe" |
| **Onglets** | Liste / Calendrier / Historique |
| **Filtres sidebar** | Tous / Actifs / Inactifs + Frequence (Tous, Actifs, Mensuel, Annuel) |
| **Metriques** | 4 cartes : Charges actives (nombre), Cout mensuel, Cout annuel, Prochain prelevement |
| **Filtres inline** | Pills "Tous statuts", "Toutes frequences", "Plus de filtres" + recherche |
| **Tableau** | Colonnes : Charge fixe (avatar + nom + frequence), Statut (Actif/Inactif), Montant, Cout/mois, Prochain (date + J-X), Categorie, actions (supprimer/modifier) |
| **Sidebar droite** | "Prochains prelevements" (timeline avec dates, montants, badges J-X) + "Repartition par categorie" (donut chart) |

**Aujourd'hui** : Existe, page tres riche.

**MVP — Simplification** : Cette page est sur-engineeree pour un MVP. Garder :
- Le tableau avec tri/filtre basique
- Les 4 metriques en haut
- La sidebar "prochains prelevements"
- CRUD (ajouter, modifier, supprimer, activer/desactiver)

**Retirer du MVP** :
- Onglet Calendrier (complexe, peu de valeur ajoutee)
- Onglet Historique
- Donut chart repartition (deja visible dans le tableau via colonne Categorie)
- Import de charges fixes

**Endpoints** :
- `GET /api/v1/charges-fixes` — liste + metriques + prochains prelevements
- `POST /api/v1/charges-fixes` — ajouter
- `PUT /api/v1/charges-fixes/{id}` — modifier
- `PATCH /api/v1/charges-fixes/{id}/toggle` — activer/desactiver
- `DELETE /api/v1/charges-fixes/{id}` — supprimer

---

## 7. Patrimoine (`/patrimoine`)

**Ce que ca fait (visible sur screenshot) :**

| Zone | Description |
|------|-------------|
| **Header** | "Patrimoine", bouton "Mettre a jour les soldes" |
| **Valeur nette** | Carte : montant total, variation % mensuelle, donut (Liquidites / Investissements) |
| **Barre actifs/passifs** | Barre segmentee (vert actifs / rouge passifs) avec pourcentages |
| **Onglets** | Liquidites / Investissements / Dettes |

La page patrimoine est une page a onglets. Le header (valeur nette + barre) reste fixe, le contenu change selon l'onglet.

### 7.1 Onglet Liquidites

| Zone | Description |
|------|-------------|
| **Total** | "Total liquidites" + montant + bouton "Nouveau compte" |
| **Cartes comptes** | Grille de cartes : icone type, nom, banque, solde, badge type (Courant/Epargne/Cash), menu 3 points |

**Aujourd'hui** : Existe.

**MVP** : Garder tel quel. Modifier le solde via le menu 3 points (modale simple).

### 7.2 Onglet Investissements

| Zone | Description |
|------|-------------|
| **Total** | "Total investissements" + montant + "Plus-value" (montant + %) + bouton "Nouvel investissement" |
| **Tableau** | Colonnes : Actif (avatar initiales + nom + ticker), Type (badge ETF/Crypto/Immobilier/Assurance-vie), Valeur actuelle, +/- Value (% avec fleche) |
| **Graphique** | Evolution du patrimoine sur 12 mois (AreaChart : Actifs, Passifs, Valeur nette) |

**Aujourd'hui** : Existe.

**MVP** : Garder le tableau et le bouton d'ajout. Le graphique d'evolution est partage entre les 3 onglets (meme composant, memes donnees).

**Simplification MVP** : Pas de page detaillee `/patrimoine/investissements` separee. L'onglet dans `/patrimoine` suffit. Le CRUD se fait via modales depuis l'onglet.

### 7.3 Onglet Dettes

| Zone | Description |
|------|-------------|
| **Total** | "Total dettes" (rouge) + "Mensualites totales" + bouton "Nouvelle dette" |
| **Cartes dettes** | Pour chaque dette : avatar initiales, nom, badge type (Etudiant/Conso), preteur, capital restant/total, mensualite, barre de progression remboursement, prochain prelevement + J-X |
| **Graphique** | Meme graphique evolution 12 mois |

**Aujourd'hui** : Existe.

**MVP** : Garder tel quel. CRUD via modales.

**Simplification MVP** : Pas de page detaillee `/patrimoine/dettes` separee. L'onglet suffit.

**Endpoints patrimoine** :
- `GET /api/v1/patrimoine` — valeur nette, repartition, comptes, investissements, dettes, historique 12 mois
- `POST/PUT/DELETE /api/v1/comptes/{id}` — CRUD comptes
- `POST/PUT/DELETE /api/v1/investissements/{id}` — CRUD investissements
- `POST/PUT/DELETE /api/v1/dettes/{id}` — CRUD dettes

---

## 8. Parametres (`/parametres`)

**Ce que ca fait (visible sur screenshot) :**

| Section | Description |
|---------|-------------|
| **Budget** | Revenus mensuels (montant + bouton Modifier), Objectif epargne (montant + Modifier), Mode de gestion (badge Semaine + Modifier), Categories de depenses (pills avec icone + nom + budget) + Modifier |
| **Charges fixes** | Liste : icone, nom, categorie, montant, jour prelevement, bouton supprimer. Bouton "Ajouter une charge fixe" |
| **Comptes** | Grille cartes (comme patrimoine liquidites) : icone, nom, banque, solde, badge type, bouton supprimer. Bouton "Ajouter un compte" |
| **Donnees** | "Exporter mes donnees" (bouton JSON), "Importer des transactions" (bouton CSV), "Reinitialiser l'application" (bouton rouge) |
| **Apparence** | Toggle theme : Clair / Sombre / Systeme |

**Aujourd'hui** : Existe et fonctionne.

**MVP** : Garder tel quel. C'est la page de configuration centrale, tout est necessaire.

**Endpoints** :
- `GET /api/v1/settings` — profil + categories + charges fixes + comptes
- `PUT /api/v1/settings/profile` — modifier revenus, epargne, mode
- `POST/PUT/DELETE /api/v1/categories/{id}` — CRUD categories
- `POST/DELETE /api/v1/charges-fixes/{id}` — (partage avec la page charges fixes)
- `POST/DELETE /api/v1/comptes/{id}` — (partage avec patrimoine)
- `GET /api/v1/export` — export JSON de toutes les donnees
- `POST /api/v1/import/csv` — import transactions CSV
- `DELETE /api/v1/settings/reset` — reinitialiser (avec confirmation)

---

## 9. Connexion bancaire (GoCardless)

### 9.1 Flow de connexion

**Aujourd'hui** : Bridge API via Edge Functions Supabase.

**MVP** : GoCardless Bank Account Data via Spring Boot.
1. User clique "Connecter ma banque" (depuis onboarding ou parametres)
2. Front appelle `POST /api/v1/bank/connect` → retourne URL GoCardless
3. User redirige vers GoCardless, choisit sa banque, s'authentifie
4. Retour sur `/bank/callback?ref=xxx`
5. Front appelle `POST /api/v1/bank/sync` → backend recupere comptes + transactions
6. Redirection vers dashboard

### 9.2 Page callback (`/bank/callback`)

**Ce que ca fait :**
- Loading → Syncing → Success (nombre de comptes/transactions) ou Error
- Boutons : "Continuer" ou "Reessayer"

**Aujourd'hui** : Existe.

**MVP** : Garder tel quel, adapter les appels API vers Spring Boot.

### 9.3 Synchronisation continue

**Difference majeure GoCardless vs Bridge** : pas de webhooks natifs.

**MVP** : Job `@Scheduled` cote Spring Boot qui synchronise toutes les 6-12h. Pas de sync temps reel, acceptable pour le MVP.

---

## 10. Pages NON incluses dans le MVP

| Page | Raison de l'exclusion |
|------|----------------------|
| `/patrimoine/investissements` (page separee) | L'onglet dans `/patrimoine` suffit |
| `/patrimoine/dettes` (page separee) | L'onglet dans `/patrimoine` suffit |
| Calendrier charges fixes | Complexe, peu de valeur vs le tableau |
| Historique charges fixes | V2 |
| Notifications email | V2 |
| OAuth Google | V2 |
| Import charges fixes | V2 |

---

## Resume : Pages MVP

```
PUBLIQUES (pas de backend)
/                              Landing page (statique)
/mentions-legales              (statique)
/politique-confidentialite     (statique)
/cgu                           (statique)

AUTH (backend Spring Boot)
/login                         Connexion email/password
/signup                        Inscription 2 etapes
/verify-email                  Attente verification
/email-confirmed               Confirmation reussie
/onboarding                    Configuration initiale 6 etapes

APP (backend Spring Boot)
/dashboard                     Vue d'ensemble budget + transactions + charges
/depenses                      Ajout/historique transactions + export CSV
/budget                        Budget mensuel (enveloppes + charges fixes + vue semaine)
/budget/charges-fixes          Gestion des charges recurrentes (tableau + metriques)
/patrimoine                    Patrimoine a onglets (Liquidites / Investissements / Dettes)
/parametres                    Configuration (profil, categories, charges, comptes, donnees, theme)

BANK (backend Spring Boot)
/bank/callback                 Retour OAuth GoCardless
```

**Total : 15 pages** (dont 4 statiques, 4 auth, 6 app, 1 callback)

---

## Resume : Endpoints API MVP

```
AUTH
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/auth/verify?token=xxx
POST   /api/v1/auth/logout

ONBOARDING
POST   /api/v1/onboarding

DASHBOARD
GET    /api/v1/dashboard?mode=semaine&period=2026-05-19

TRANSACTIONS
GET    /api/v1/transactions?period=week&date=2026-05-13
POST   /api/v1/transactions
DELETE /api/v1/transactions/{id}
GET    /api/v1/transactions/export?format=csv

BUDGET
GET    /api/v1/budget?year=2026&month=5

CATEGORIES
GET    /api/v1/categories
POST   /api/v1/categories
PUT    /api/v1/categories/{id}
DELETE /api/v1/categories/{id}

CHARGES FIXES
GET    /api/v1/charges-fixes
POST   /api/v1/charges-fixes
PUT    /api/v1/charges-fixes/{id}
PATCH  /api/v1/charges-fixes/{id}/toggle
DELETE /api/v1/charges-fixes/{id}

PATRIMOINE
GET    /api/v1/patrimoine

COMPTES
GET    /api/v1/comptes
POST   /api/v1/comptes
PUT    /api/v1/comptes/{id}
DELETE /api/v1/comptes/{id}

INVESTISSEMENTS
GET    /api/v1/investissements
POST   /api/v1/investissements
PUT    /api/v1/investissements/{id}
DELETE /api/v1/investissements/{id}

DETTES
GET    /api/v1/dettes
POST   /api/v1/dettes
PUT    /api/v1/dettes/{id}
DELETE /api/v1/dettes/{id}

SETTINGS
GET    /api/v1/settings
PUT    /api/v1/settings/profile
GET    /api/v1/export
POST   /api/v1/import/csv
DELETE /api/v1/settings/reset

BANK (GoCardless)
POST   /api/v1/bank/connect
POST   /api/v1/bank/sync
```

**Total : ~35 endpoints**
