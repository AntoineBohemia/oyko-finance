# Oyko Frontend

Application Next.js de gestion de finances personnelles : budget, transactions, patrimoine, charges fixes, avec integration bancaire DSP2-ready.

## Stack technique

| Composant | Version |
|-----------|---------|
| Next.js | 16 (App Router, React 19) |
| TypeScript | 5.9 |
| Tailwind CSS | 4.1 |
| TanStack Query | 5 (cache client-side) |
| Zustand | 5 (auth state) |
| Zod | 4 (validation formulaires) |
| React Aria | 3.44 (composants accessibles) |
| Recharts | 3 (graphiques) |
| Vitest + MSW | Tests unitaires |
| Playwright | Tests E2E |

## Architecture

```
src/
├── app/                    # App Router Next.js
│   ├── (app)/              # Pages protegees (dashboard, budget, patrimoine, parametres)
│   ├── (auth)/             # Pages auth (login, signup, onboarding)
│   ├── api/                # Route handlers
│   │   ├── auth/           # Login, register, logout, refresh (gestion cookies httpOnly)
│   │   ├── bank/           # Connect, sync (agregation bancaire)
│   │   └── v1/[...path]/   # Proxy generique vers le backend Spring Boot
│   └── layout.tsx          # Root layout (providers: Query, Router, Theme)
├── hooks/
│   ├── api/                # Hooks TanStack Query (11 modules CRUD)
│   ├── use-auth.ts         # Auth hook (login, logout, fetchUser)
│   └── use-api-error.ts    # Helpers erreurs utilisateur
├── lib/
│   ├── api/
│   │   ├── client.ts       # Fetch wrapper (ProblemDetail, URL duale server/client)
│   │   └── query-keys.ts   # Factory de cles de cache TanStack Query
│   ├── data/               # Data layer (8 modules, dev mode + API calls)
│   ├── dev/                # Mock data + config dev mode
│   └── validation/         # Schemas Zod (9 schemas)
├── providers/              # React providers (QueryProvider, RouteProvider, Theme)
├── stores/                 # Zustand stores (auth-store)
├── types/                  # Types API (42 schemas)
└── components/             # Composants UI (Untitled UI + custom)
```

## Auth : architecture cookie-only

Les tokens ne sont **jamais accessibles en JavaScript client**. Tout passe par des cookies httpOnly :

```
Client (browser)
  |
  |--- fetch("/api/v1/dashboard")     <-- URL relative, same-origin
  |          cookies: access_token, refresh_token (auto, httpOnly)
  |
  v
Proxy Next.js (/api/v1/[...path])     <-- Server-side, lit les cookies
  |
  |--- fetch("http://backend:8080/api/v1/dashboard")
  |          Authorization: Bearer <access_token>
  |
  v
Spring Boot backend
```

**Auto-refresh** : si le backend renvoie 401, le proxy tente un refresh avec le `refresh_token`, rejoue la requete, et met a jour les cookies dans la reponse HTTP (transparent pour le client).

## Demarrage

### Prerequis

- Node.js 20+
- pnpm 10+
- Backend Spring Boot sur `http://localhost:8080` (ou configurer `NEXT_PUBLIC_API_URL`)

### Installation

```bash
pnpm install
```

### Variables d'environnement

```bash
cp .env.local.example .env.local
```

```env
# API Spring Boot
NEXT_PUBLIC_API_URL=http://localhost:8080

# Dev mode : "true" pour mock data sans backend
NEXT_PUBLIC_DEV_MODE=true
```

### Lancement

```bash
# Mode dev (avec Turbopack)
pnpm dev

# Build production
pnpm build && pnpm start
```

### Tests

```bash
# Tests unitaires (Vitest + MSW)
pnpm test:run

# Tests E2E (Playwright, necessite le backend)
pnpm test:e2e
```

## Dev mode

Mettre `NEXT_PUBLIC_DEV_MODE=true` dans `.env.local` pour acceder a l'app sans backend :
- Toutes les pages sont accessibles sans login
- Les donnees proviennent de `src/lib/dev/mock-data.ts`
- Profil mock : Antoine Dev, 3200 EUR/mois, 5 categories, 8 charges fixes

## Modules fonctionnels

| Module | Page | Description |
|--------|------|-------------|
| Dashboard | `/dashboard` | Vue d'ensemble : budget semaine/mois, enveloppes, transactions recentes |
| Budget | `/budget` | Enveloppes variables, charges fixes, vue par semaine |
| Transactions | `/budget?tab=transactions` | CRUD transactions, import CSV/Excel, filtres |
| Charges fixes | `/budget?tab=charges-fixes` | CRUD abonnements, toggle actif/inactif |
| Patrimoine | `/patrimoine` | Comptes, investissements, dettes, evolution |
| Investissements | `/patrimoine/investissements` | Portfolio, plus-values, repartition par type |
| Dettes | `/patrimoine/dettes` | Prets, echeancier, progress remboursement |
| Parametres | `/parametres` | Profil, categories, comptes, export, reset |
| Onboarding | `/onboarding` | Wizard 6 etapes pour les nouveaux utilisateurs |

## Hooks TanStack Query

11 modules dans `src/hooks/api/` avec invalidation de cache automatique :

```typescript
// Exemple d'utilisation
import { useDashboard, useCreateTransaction } from "@/hooks/api";

function MyComponent() {
  const { data, isLoading } = useDashboard();
  const createTx = useCreateTransaction();

  const handleAdd = () => {
    createTx.mutate({ montant: 42, type: "depense", ... });
    // Invalide automatiquement : transactions, budget, dashboard
  };
}
```

## Lien avec le backend

Le frontend communique avec [oyko-backend](../oyko-backend/) (Spring Boot) via :
- **Server Components** : appels directs `http://localhost:8080/api/v1/*` avec le cookie lu server-side
- **Client Components** : URL relatives `/api/v1/*` -> proxy Next.js -> backend
- **Auth** : route handlers `/api/auth/*` qui gerent les cookies httpOnly

## License

MIT (composants Untitled UI open-source). Voir [Untitled UI license](https://www.untitledui.com/license) pour les composants PRO.
