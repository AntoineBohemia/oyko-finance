# PROMPT — Migration UI complete vers API Spring Boot

> Ce prompt est a copier-coller dans Claude Code pour executer la migration UI en une seule passe.
> Il ne touche QUE le frontend Next.js. Le backend Spring Boot n'existe pas encore — on cree un client API qui pointe vers une URL configurable et on garde le mode dev (mock data) fonctionnel.

---

## INSTRUCTIONS

Tu es un dev senior Next.js/React/TypeScript. Tu dois migrer l'UI d'Oyko de Supabase vers une API REST Spring Boot. Tu ne t'arretes pas, tu fais TOUT d'un coup. Pas de questions, pas d'hesitation. Si un choix est ambigu, prends la decision la plus simple.

**Regles absolues :**
- NE TOUCHE PAS aux composants UI visuels (src/components/) — ils restent identiques
- NE TOUCHE PAS aux pages statiques (landing, mentions legales, CGU, politique confidentialite)
- NE CREE PAS de nouveaux fichiers inutiles — edite l'existant
- GARDE le mode dev (mock data) fonctionnel — c'est le fallback
- NE SUPPRIME PAS les pages inactives dans src/app/(inactive)/ — ignore-les
- TOUT le code est en TypeScript strict, pas de `any`
- Les imports utilisent le path alias `@/`

---

## ETAPE 1 — Client API (`src/lib/api/`)

Cree `src/lib/api/client.ts` :

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | undefined>;
};

export class ApiError extends Error {
  constructor(public status: number, public detail: string) {
    super(detail);
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  // Cote serveur (RSC) : lire le cookie access_token
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  // Cote client : le cookie est envoye automatiquement
  return {};
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, params } = options;

  let url = `${API_URL}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value));
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const authHeaders = await getAuthHeaders();

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, error.detail || error.message || res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
```

Cree `src/lib/api/auth.ts` :

```typescript
import { api } from "./client";

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { email: string; password: string; prenom: string; nom: string };
export type AuthResponse = { accessToken: string; refreshToken: string; user: { id: string; email: string; prenom: string; nom: string } };

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return api<AuthResponse>("/api/v1/auth/login", { method: "POST", body: data });
}

export async function register(data: RegisterRequest): Promise<{ message: string }> {
  return api<{ message: string }>("/api/v1/auth/register", { method: "POST", body: data });
}

export async function refreshToken(token: string): Promise<AuthResponse> {
  return api<AuthResponse>("/api/v1/auth/refresh", { method: "POST", body: { refreshToken: token } });
}

export async function logout(): Promise<void> {
  return api<void>("/api/v1/auth/logout", { method: "POST" });
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  return api<{ message: string }>("/api/v1/auth/verify", { params: { token } });
}
```

---

## ETAPE 2 — Types API centralises (`src/lib/api/types.ts`)

Cree ce fichier. Ces types correspondent aux DTOs retournes par l'API Spring Boot. Ils remplacent les types eparpilles dans chaque fichier data/*.ts.

```typescript
// === PROFILE ===
export type Profile = {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  revenusMensuels: number;
  objectifEpargne: number;
  modeGestion: "semaine" | "mois";
};

// === COMPTES ===
export type Compte = {
  id: string;
  nom: string;
  banque: string;
  solde: number;
  type: "courant" | "epargne" | "cash" | "investissement";
  icone: string;
  couleur: string;
  estActif: boolean;
};

// === CATEGORIES ===
export type Categorie = {
  id: string;
  nom: string;
  type: "depense" | "revenu";
  estFixe: boolean;
  estActif: boolean;
  budgetMensuel: number;
  icone: string;
  couleur: string;
};

// === TRANSACTIONS ===
export type Transaction = {
  id: string;
  montant: number;
  description: string;
  dateTransaction: string; // ISO date
  categorieId: string;
  compteId: string;
  chargeFixeId?: string;
  type: "depense" | "revenu" | "fixe";
  categorie?: { nom: string; icone: string; couleur: string };
  compte?: { nom: string };
};

// === CHARGES FIXES ===
export type ChargeFix = {
  id: string;
  nom: string;
  montant: number;
  frequence: "hebdo" | "mensuel" | "trimestriel" | "annuel";
  jourPrelevement: number;
  categorieId?: string;
  compteId?: string;
  icone: string;
  couleur: string;
  estActif: boolean;
  notes: string;
  categorie?: { nom: string };
};

// === INVESTISSEMENTS ===
export type Investissement = {
  id: string;
  nom: string;
  ticker: string;
  type: string;
  plateforme: string;
  quantite: number;
  prixAchatUnitaire: number;
  prixActuel: number;
  valeurActuelle: number;
  plusValue: number;
  plusValuePourcent: number;
  dateAchat?: string;
  notes?: string;
};

// === DETTES ===
export type TypeDette = "etudiant" | "immobilier" | "consommation" | "auto" | "personnel" | "autre";

export type Dette = {
  id: string;
  nom: string;
  type: TypeDette;
  capitalInitial: number;
  capitalRestant: number;
  tauxInteret: number;
  mensualite: number;
  jourPrelevement: number;
  dateDebut?: string;
  dateFin?: string;
  preteur: string;
  compteId?: string;
  notes?: string;
  prochainPrelevement?: string;
};

// === DASHBOARD ===
export type DashboardData = {
  profile: Profile;
  budgetPeriode: {
    montantDepense: number;
    budgetTotal: number;
    pourcentage: number;
    reste: number;
    joursRestants: number;
    label: string;
  };
  enveloppes: Array<{
    id: string;
    nom: string;
    icone: string;
    couleur: string;
    depense: number;
    budget: number;
    reste: number;
  }>;
  resume: {
    revenus: number;
    charges: number;
    disponible: number;
  };
  dernieresTransactions: Transaction[];
  prochainsPrelevements: Array<{
    id: string;
    nom: string;
    icone: string;
    montant: number;
    datePrelevement: string;
    joursRestants: number;
  }>;
  patrimoine: {
    valeurNette: number;
    variationMensuelle: number;
    liquidites: number;
    investissements: number;
  };
};

// === BUDGET ===
export type BudgetData = {
  mois: number;
  annee: number;
  resume: {
    revenus: number;
    chargesFixes: number;
    disponible: number;
  };
  budgetMensuel: {
    depense: number;
    pourcentage: number;
    reste: number;
    joursRestants: number;
  };
  enveloppes: Array<{
    id: string;
    nom: string;
    icone: string;
    couleur: string;
    prevu: number;
    depense: number;
    reste: number;
    statut: "ok" | "attention" | "depasse";
  }>;
  chargesFixes: Array<{
    id: string;
    nom: string;
    icone: string;
    montant: number;
    statut: "preleve" | "a_venir";
    datePrelevement: number;
    joursRestants?: number;
  }>;
  totalChargesFixes: number;
  vueSemaine: Array<{
    numero: number;
    dateDebut: string;
    dateFin: string;
    budget: number;
    depense: number;
    reste: number;
    transactions: Transaction[];
  }>;
};

// === CHARGES FIXES PAGE ===
export type ChargesFixesData = {
  totaux: {
    chargesActives: number;
    coutMensuel: number;
    coutAnnuel: number;
    prochainPrelevement: { nom: string; montant: number; date: string };
  };
  chargesFixes: Array<ChargeFix & {
    coutMensuel: number;
    prochainPrelevement: string;
    joursRestants: number;
  }>;
  timeline: Array<{
    nom: string;
    icone: string;
    montant: number;
    date: string;
    joursRestants: number;
  }>;
};

// === DEPENSES ===
export type DepensesData = {
  resume: {
    depenses: number;
    revenus: number;
    balance: number;
  };
  topCategories: Array<{ nom: string; icone: string; total: number }>;
  depensesParJour: Array<{ jour: string; total: number }>;
  transactions: Transaction[];
  comptes: Compte[];
  categories: Categorie[];
};

// === PATRIMOINE ===
export type PatrimoineData = {
  valeurNette: number;
  variationMensuelle: number;
  totalActifs: number;
  totalPassifs: number;
  pourcentageActifs: number;
  pourcentagePassifs: number;
  liquidites: { total: number; comptes: Compte[] };
  investissements: { total: number; plusValue: number; plusValuePourcent: number; liste: Investissement[] };
  dettes: { total: number; mensualitesTotales: number; liste: Dette[] };
  evolution: Array<{ mois: string; actifs: number; passifs: number; valeurNette: number }>;
};

// === PARAMETRES ===
export type ParametresData = {
  profile: Profile;
  categories: Categorie[];
  chargesFixes: ChargeFix[];
  comptes: Compte[];
};
```

---

## ETAPE 3 — Refactorer les fichiers data (`src/lib/data/*.ts`)

Pour CHAQUE fichier dans `src/lib/data/`, applique ce pattern :

1. Supprime tous les imports Supabase (`createClient`, `@supabase/ssr`)
2. Remplace par des imports depuis `@/lib/api/client` et `@/lib/api/types`
3. Garde le check `IS_DEV_MODE` et le retour de mock data
4. Remplace les requetes Supabase par des appels `api<T>()`
5. Garde les memes noms de fonctions exportees et les memes signatures de retour pour ne pas casser les pages

### Exemple de transformation — `dashboard.ts` :

**AVANT :**
```typescript
import { createClient } from "@/lib/supabase/server";
import { IS_DEV_MODE, getMockDashboardData } from "@/lib/dev/mock-data";

export async function getDashboardData() {
  if (IS_DEV_MODE) return getMockDashboardData();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return getEmptyData();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  // ... 15 autres requetes Supabase
}
```

**APRES :**
```typescript
import { api } from "@/lib/api/client";
import { IS_DEV_MODE, getMockDashboardData } from "@/lib/dev/mock-data";
import type { DashboardData } from "@/lib/api/types";

export async function getDashboardData(mode?: string, period?: string): Promise<DashboardData> {
  if (IS_DEV_MODE) return getMockDashboardData();
  return api<DashboardData>("/api/v1/dashboard", { params: { mode, period } });
}
```

Applique CE MEME PATTERN a tous les fichiers :

### `budget.ts`
```typescript
import { api } from "@/lib/api/client";
import { IS_DEV_MODE, getMockBudgetData } from "@/lib/dev/mock-data";
import type { BudgetData } from "@/lib/api/types";

export async function getBudgetData(month: number, year: number): Promise<BudgetData> {
  if (IS_DEV_MODE) return getMockBudgetData(month, year);
  return api<BudgetData>("/api/v1/budget", { params: { year, month } });
}

export async function updateCategoryBudget(categoryId: string, newBudget: number): Promise<boolean> {
  if (IS_DEV_MODE) return true;
  await api("/api/v1/categories/" + categoryId, { method: "PUT", body: { budgetMensuel: newBudget } });
  return true;
}
```

### `depenses.ts`
```typescript
import { api } from "@/lib/api/client";
import { IS_DEV_MODE, getMockDepensesData } from "@/lib/dev/mock-data";
import type { DepensesData } from "@/lib/api/types";

export async function getDepensesData(periodeFilter: string = "this-week"): Promise<DepensesData> {
  if (IS_DEV_MODE) return getMockDepensesData(periodeFilter);
  return api<DepensesData>("/api/v1/transactions", { params: { period: periodeFilter } });
}

export async function addTransaction(data: {
  montant: number;
  description: string;
  dateTransaction: string;
  categorieId: string;
  compteId: string;
  type: "depense" | "revenu";
}): Promise<{ success: boolean; error?: string }> {
  if (IS_DEV_MODE) return { success: true };
  try {
    await api("/api/v1/transactions", { method: "POST", body: data });
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function deleteTransaction(id: string): Promise<{ success: boolean; error?: string }> {
  if (IS_DEV_MODE) return { success: true };
  try {
    await api("/api/v1/transactions/" + id, { method: "DELETE" });
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}
```

### `patrimoine.ts`
```typescript
import { api } from "@/lib/api/client";
import { IS_DEV_MODE, getMockPatrimoineData } from "@/lib/dev/mock-data";
import type { PatrimoineData } from "@/lib/api/types";

export async function getPatrimoineData(): Promise<PatrimoineData> {
  if (IS_DEV_MODE) return getMockPatrimoineData();
  return api<PatrimoineData>("/api/v1/patrimoine");
}

export async function updateCompteSolde(compteId: string, nouveauSolde: number): Promise<boolean> {
  if (IS_DEV_MODE) return true;
  await api("/api/v1/comptes/" + compteId, { method: "PUT", body: { solde: nouveauSolde } });
  return true;
}
```

### `investissements.ts`
```typescript
import { api } from "@/lib/api/client";
import { IS_DEV_MODE, getMockInvestissementsData } from "@/lib/dev/mock-data";
import type { InvestissementsData } from "@/lib/api/types"; // Ajouter ce type si manquant

export async function getInvestissementsData() {
  if (IS_DEV_MODE) return getMockInvestissementsData();
  return api("/api/v1/investissements");
}

export async function addInvestissement(data: Record<string, unknown>) {
  if (IS_DEV_MODE) return { success: true, id: "mock-id" };
  const result = await api<{ id: string }>("/api/v1/investissements", { method: "POST", body: data });
  return { success: true, id: result.id };
}

export async function updateInvestissement(id: string, data: Record<string, unknown>) {
  if (IS_DEV_MODE) return true;
  await api("/api/v1/investissements/" + id, { method: "PUT", body: data });
  return true;
}

export async function deleteInvestissement(id: string) {
  if (IS_DEV_MODE) return true;
  await api("/api/v1/investissements/" + id, { method: "DELETE" });
  return true;
}

export async function addPosition(id: string, data: { quantite: number; prixUnitaire: number }) {
  if (IS_DEV_MODE) return true;
  await api("/api/v1/investissements/" + id + "/position", { method: "POST", body: data });
  return true;
}

export async function updatePrixActuel(id: string, prixActuel: number) {
  if (IS_DEV_MODE) return true;
  await api("/api/v1/investissements/" + id, { method: "PUT", body: { prixActuel } });
  return true;
}
```

### `dettes.ts`
```typescript
import { api } from "@/lib/api/client";
import { IS_DEV_MODE, getMockDettesData } from "@/lib/dev/mock-data";

export async function getDettesData() {
  if (IS_DEV_MODE) return getMockDettesData();
  return api("/api/v1/dettes");
}

export async function addDette(data: Record<string, unknown>) {
  if (IS_DEV_MODE) return { success: true };
  try {
    await api("/api/v1/dettes", { method: "POST", body: data });
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function updateDette(id: string, data: Record<string, unknown>) {
  if (IS_DEV_MODE) return { success: true };
  try {
    await api("/api/v1/dettes/" + id, { method: "PUT", body: data });
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function deleteDette(id: string) {
  if (IS_DEV_MODE) return { success: true };
  try {
    await api("/api/v1/dettes/" + id, { method: "DELETE" });
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erreur" };
  }
}
```

### `charges-fixes.ts`
```typescript
import { api } from "@/lib/api/client";
import { IS_DEV_MODE, getMockChargesFixesData } from "@/lib/dev/mock-data";
import type { ChargesFixesData } from "@/lib/api/types";

export async function getChargesFixesData(): Promise<ChargesFixesData> {
  if (IS_DEV_MODE) return getMockChargesFixesData();
  return api<ChargesFixesData>("/api/v1/charges-fixes");
}

export async function addChargeFix(data: Record<string, unknown>) {
  if (IS_DEV_MODE) return { success: true, id: "mock-id" };
  const result = await api<{ id: string }>("/api/v1/charges-fixes", { method: "POST", body: data });
  return { success: true, id: result.id };
}

export async function updateChargeFix(id: string, data: Record<string, unknown>) {
  if (IS_DEV_MODE) return true;
  await api("/api/v1/charges-fixes/" + id, { method: "PUT", body: data });
  return true;
}

export async function deleteChargeFix(id: string) {
  if (IS_DEV_MODE) return true;
  await api("/api/v1/charges-fixes/" + id, { method: "DELETE" });
  return true;
}

export async function toggleChargeFixActive(id: string, estActif: boolean) {
  if (IS_DEV_MODE) return true;
  await api("/api/v1/charges-fixes/" + id + "/toggle", { method: "PATCH", body: { estActif } });
  return true;
}
```

### `parametres.ts`
```typescript
import { api } from "@/lib/api/client";
import { IS_DEV_MODE, getMockParametresData } from "@/lib/dev/mock-data";
import type { ParametresData } from "@/lib/api/types";

export async function getParametresData(): Promise<ParametresData> {
  if (IS_DEV_MODE) return getMockParametresData();
  return api<ParametresData>("/api/v1/settings");
}

export async function updateProfile(data: { revenusMensuels?: number; objectifEpargne?: number; modeGestion?: string }) {
  if (IS_DEV_MODE) return true;
  await api("/api/v1/settings/profile", { method: "PUT", body: data });
  return true;
}

export async function addCategorie(data: Record<string, unknown>) {
  if (IS_DEV_MODE) return true;
  await api("/api/v1/categories", { method: "POST", body: data });
  return true;
}

export async function updateCategorie(id: string, data: Record<string, unknown>) {
  if (IS_DEV_MODE) return true;
  await api("/api/v1/categories/" + id, { method: "PUT", body: data });
  return true;
}

export async function deleteCategorie(id: string) {
  if (IS_DEV_MODE) return true;
  await api("/api/v1/categories/" + id, { method: "DELETE" });
  return true;
}

export async function addCompte(data: Record<string, unknown>) {
  if (IS_DEV_MODE) return true;
  await api("/api/v1/comptes", { method: "POST", body: data });
  return true;
}

export async function deleteCompte(id: string) {
  if (IS_DEV_MODE) return true;
  await api("/api/v1/comptes/" + id, { method: "DELETE" });
  return true;
}

// Re-export pour la page parametres qui utilise aussi les charges fixes
export { addChargeFix, deleteChargeFix } from "./charges-fixes";
```

---

## ETAPE 4 — Middleware auth (`middleware.ts`)

Remplace le contenu entier de `middleware.ts` :

```typescript
import { NextRequest, NextResponse } from "next/server";

const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE !== "false";

const PROTECTED_ROUTES = ["/dashboard", "/budget", "/depenses", "/patrimoine", "/parametres", "/bank"];
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/verify-email", "/email-confirmed"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Dev mode : bypass auth
  if (IS_DEV_MODE) {
    // Redirect auth pages to dashboard in dev mode
    if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshTokenValue = request.cookies.get("refresh_token")?.value;
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuth = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Pas de token et route protegee → login
  if (!accessToken && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token present et page auth → dashboard
  if (accessToken && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Token expire mais refresh dispo → tenter refresh
  if (!accessToken && refreshTokenValue && isProtected) {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (res.ok) {
        const data = await res.json();
        const response = NextResponse.next();
        response.cookies.set("access_token", data.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 15 * 60, // 15 min
          path: "/",
        });
        response.cookies.set("refresh_token", data.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60, // 7 jours
          path: "/",
        });
        return response;
      }
    } catch {
      // Refresh failed, redirect to login
    }

    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

## ETAPE 5 — Layout app (`src/app/(app)/layout.tsx`)

Remplace la verification auth Supabase :

```typescript
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/application/app-shell"; // ou le bon import

const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE !== "false";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!IS_DEV_MODE) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) {
      redirect("/login");
    }
  }

  return <AppShell>{children}</AppShell>;
}
```

---

## ETAPE 6 — Pages auth (login/signup)

### `src/app/(auth)/login/page.tsx`

Le formulaire de login doit :
1. Appeler `login()` depuis `@/lib/api/auth`
2. Stocker les tokens dans des cookies via une Server Action ou un route handler
3. Rediriger vers `/dashboard`

Cree `src/app/api/auth/login/route.ts` (Route Handler Next.js pour setter les cookies HttpOnly) :

```typescript
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Erreur de connexion" }));
    return NextResponse.json(error, { status: res.status });
  }

  const data = await res.json();
  const response = NextResponse.json({ user: data.user });

  response.cookies.set("access_token", data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60,
    path: "/",
  });

  response.cookies.set("refresh_token", data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
```

Cree `src/app/api/auth/register/route.ts` :

```typescript
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
```

Cree `src/app/api/auth/logout/route.ts` :

```typescript
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  return response;
}
```

Puis dans le LoginForm (composant client), remplace l'appel Supabase par :

```typescript
const handleLogin = async (email: string, password: string) => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Erreur de connexion");
  }
  router.push("/dashboard");
};
```

Meme pattern pour le SignupForm : appeler `/api/auth/register` puis rediriger vers `/verify-email`.

---

## ETAPE 7 — Supprimer les dependances Supabase

Dans le LoginForm, le SignupForm, et partout ou `createClient` ou `createBrowserClient` est importe depuis `@/lib/supabase/` :
- Supprime l'import
- Remplace par l'appel API correspondant (voir etapes precedentes)

**NE SUPPRIME PAS** les fichiers `src/lib/supabase/` pour l'instant — ils pourraient etre references ailleurs. Marque-les avec un commentaire `// DEPRECATED — a supprimer apres migration complete`.

---

## ETAPE 8 — Variables d'environnement

Ajoute dans `.env.local` :
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Garde `NEXT_PUBLIC_DEV_MODE=true` pour que tout reste fonctionnel.

---

## ETAPE 9 — Onboarding

Dans la page onboarding, remplace l'appel Supabase de sauvegarde par :

```typescript
const handleComplete = async (data: OnboardingData) => {
  if (IS_DEV_MODE) {
    router.push("/dashboard");
    return;
  }
  await fetch("/api/auth/onboarding", { // creer ce route handler aussi
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  router.push("/dashboard");
};
```

Cree `src/app/api/auth/onboarding/route.ts` qui forward vers `POST /api/v1/onboarding` du backend Spring Boot avec le token.

---

## ETAPE 10 — Bank callback

Dans `src/app/bank/callback/page.tsx`, remplace les appels aux Edge Functions Supabase :

```typescript
// AVANT
const res = await fetch(`${supabaseUrl}/functions/v1/bridge-sync`, { ... });

// APRES
const res = await fetch("/api/bank/sync", { method: "POST", body: JSON.stringify({ ref }) });
```

Cree `src/app/api/bank/sync/route.ts` et `src/app/api/bank/connect/route.ts` qui forward vers le backend Spring Boot.

---

## CHECKLIST FINALE

Apres toutes les modifications, verifie :

- [ ] `npm run build` passe sans erreur
- [ ] Le mode dev (NEXT_PUBLIC_DEV_MODE=true) fonctionne — toutes les pages s'affichent avec les mock data
- [ ] Aucun import de `@supabase/ssr` ou `@supabase/supabase-js` dans les fichiers modifies
- [ ] Les fichiers `src/lib/supabase/` sont marques DEPRECATED
- [ ] Le middleware protege les routes sans Supabase
- [ ] Les Route Handlers `/api/auth/*` existent et forward vers le backend
- [ ] La variable `NEXT_PUBLIC_API_URL` est dans `.env.local`
- [ ] Les types dans `src/lib/api/types.ts` couvrent toutes les pages

---

## FICHIERS A CREER

```
src/lib/api/client.ts          — Client HTTP generique
src/lib/api/auth.ts            — Fonctions auth
src/lib/api/types.ts           — Types API centralises
src/app/api/auth/login/route.ts    — Route Handler login (cookies)
src/app/api/auth/register/route.ts — Route Handler register
src/app/api/auth/logout/route.ts   — Route Handler logout (clear cookies)
src/app/api/auth/onboarding/route.ts — Route Handler onboarding
src/app/api/bank/connect/route.ts  — Route Handler bank connect
src/app/api/bank/sync/route.ts     — Route Handler bank sync
```

## FICHIERS A MODIFIER

```
middleware.ts                      — Remplacer Supabase par JWT cookies
src/app/(app)/layout.tsx           — Remplacer Supabase par cookie check
src/lib/data/dashboard.ts          — Remplacer Supabase par api()
src/lib/data/budget.ts             — Remplacer Supabase par api()
src/lib/data/depenses.ts           — Remplacer Supabase par api()
src/lib/data/patrimoine.ts         — Remplacer Supabase par api()
src/lib/data/investissements.ts    — Remplacer Supabase par api()
src/lib/data/dettes.ts             — Remplacer Supabase par api()
src/lib/data/charges-fixes.ts      — Remplacer Supabase par api()
src/lib/data/parametres.ts         — Remplacer Supabase par api()
src/app/(auth)/login/page.tsx      — Login via API (ou son composant client)
src/app/(auth)/signup/page.tsx     — Signup via API (ou son composant client)
src/app/(auth)/onboarding/page.tsx — Onboarding via API
src/app/bank/callback/page.tsx     — Bank callback via API
.env.local                         — Ajouter NEXT_PUBLIC_API_URL
```

## FICHIERS A NE PAS TOUCHER

```
src/components/**/*                — Tous les composants UI
src/app/(landing)/**/*             — Pages marketing statiques
src/app/(inactive)/**/*            — Pages inactives
src/lib/dev/mock-data.ts           — Mock data (GARDER tel quel)
src/lib/dev/config.ts              — Config dev mode
src/providers/**/*                 — Providers existants
```
