import { api } from "@/lib/api/client";
import { isDevModeActive } from "@/lib/dev/config";
import { getMockParametresData } from "@/lib/dev/mock-data";
import type { Profile } from "@/types/api";

// Types pour les donnees des parametres
export interface ParametresData {
  profile: Profile | null;
  categories: CategorieParametres[];
  chargesFixes: ChargeFixParametres[];
  comptes: CompteParametres[];
  totaux: TotauxParametres;
}

export interface CategorieParametres {
  id: string;
  nom: string;
  budget: number;
  icone: string;
  couleur: string;
}

export interface ChargeFixParametres {
  id: string;
  nom: string;
  montant: number;
  jourPrelevement: number;
  icone: string;
  couleur: string;
  categorieNom: string;
  actif: boolean;
}

export interface CompteParametres {
  id: string;
  nom: string;
  banque: string;
  solde: number;
  type: "courant" | "epargne" | "cash" | "investissement";
}

export interface TotauxParametres {
  totalChargesFixes: number;
  totalComptes: number;
}

// Recuperer toutes les donnees des parametres (compose depuis plusieurs endpoints)
export async function getParametresData(): Promise<ParametresData> {
  if (await isDevModeActive()) return getMockParametresData();

  type ChargeRaw = { id: string; nom: string; montant: number; jourPrelevement?: number; jour_prelevement?: number; icone?: string; couleur?: string; categorieNom?: string; estActif?: boolean; est_actif?: boolean };

  const [profile, categoriesRaw, chargesResponse, comptesRaw] = await Promise.all([
    api<Profile>("/api/v1/profile"),
    api<Record<string, unknown>>("/api/v1/categories"),
    api<Record<string, unknown>>("/api/v1/recurring-charges"),
    api<Record<string, unknown>>("/api/v1/accounts"),
  ]);

  // Le backend peut retourner un array ou un objet avec une clé
  const categories = (Array.isArray(categoriesRaw) ? categoriesRaw : (categoriesRaw as Record<string, unknown>).categories ?? []) as { id: string; nom: string; budgetMensuel?: number; budget_mensuel?: number; icone?: string; couleur?: string }[];
  const charges = (Array.isArray(chargesResponse) ? chargesResponse : (chargesResponse as Record<string, unknown>).chargesFixes ?? []) as ChargeRaw[];
  const comptes = (Array.isArray(comptesRaw) ? comptesRaw : (comptesRaw as Record<string, unknown>).comptes ?? []) as { id: string; nom: string; banque?: string; solde?: number; soldeCents?: number; type: string }[];

  const mappedCategories: CategorieParametres[] = categories.map((c) => ({
    id: c.id,
    nom: c.nom,
    budget: c.budgetMensuel ?? c.budget_mensuel ?? 0,
    icone: c.icone ?? "📦",
    couleur: c.couleur ?? "#6b7280",
  }));

  const mappedCharges: ChargeFixParametres[] = charges.map((c) => ({
    id: c.id,
    nom: c.nom,
    montant: c.montant,
    jourPrelevement: c.jourPrelevement ?? c.jour_prelevement ?? 1,
    icone: c.icone ?? "💸",
    couleur: c.couleur ?? "#6b7280",
    categorieNom: c.categorieNom ?? "",
    actif: c.estActif ?? c.est_actif ?? true,
  }));

  const mappedComptes: CompteParametres[] = comptes.map((c) => ({
    id: c.id,
    nom: c.nom,
    banque: c.banque ?? "",
    solde: c.solde ?? (c.soldeCents ? c.soldeCents / 100 : 0),
    type: c.type as "courant" | "epargne" | "cash" | "investissement",
  }));

  const totalChargesFixes = mappedCharges
    .filter((c) => c.actif)
    .reduce((acc, c) => acc + c.montant, 0);
  const totalComptes = mappedComptes.reduce((acc, c) => acc + c.solde, 0);

  return {
    profile,
    categories: mappedCategories,
    chargesFixes: mappedCharges,
    comptes: mappedComptes,
    totaux: { totalChargesFixes, totalComptes },
  };
}

// Mettre a jour le profil
export async function updateProfile(data: {
  revenusMensuels?: number;
  objectifEpargne?: number;
  modeGestion?: "semaine" | "mois";
}): Promise<boolean> {
  if (await isDevModeActive()) return true;

  try {
    await api("/api/v1/profile", { method: "PUT", body: data });
    return true;
  } catch {
    return false;
  }
}

// Ajouter une charge fixe
export async function addChargeFix(data: {
  nom: string;
  montant: number;
  jourDuMois: number;
  categorieId?: string;
  icone?: string;
}): Promise<boolean> {
  if (await isDevModeActive()) return true;

  try {
    await api("/api/v1/recurring-charges", { method: "POST", body: data });
    return true;
  } catch {
    return false;
  }
}

// Supprimer une charge fixe
export async function deleteChargeFix(id: string): Promise<boolean> {
  if (await isDevModeActive()) return true;

  try {
    await api("/api/v1/recurring-charges/" + id, { method: "DELETE" });
    return true;
  } catch {
    return false;
  }
}

// Ajouter un compte
export async function addCompte(data: {
  nom: string;
  banque: string;
  solde: number;
  type: "courant" | "epargne" | "cash";
}): Promise<boolean> {
  if (await isDevModeActive()) return true;

  try {
    await api("/api/v1/accounts", { method: "POST", body: data });
    return true;
  } catch {
    return false;
  }
}

// Supprimer un compte
export async function deleteCompte(id: string): Promise<boolean> {
  if (await isDevModeActive()) return true;

  try {
    await api("/api/v1/accounts/" + id, { method: "DELETE" });
    return true;
  } catch {
    return false;
  }
}

// Mettre a jour une categorie
export async function updateCategorie(
  id: string,
  data: {
    nom?: string;
    budgetMensuel?: number;
    icone?: string;
  },
): Promise<boolean> {
  if (await isDevModeActive()) return true;

  try {
    await api("/api/v1/categories/" + id, { method: "PUT", body: data });
    return true;
  } catch {
    return false;
  }
}

// Ajouter une categorie
export async function addCategorie(data: {
  nom: string;
  budgetMensuel: number;
  icone: string;
}): Promise<boolean> {
  if (await isDevModeActive()) return true;

  try {
    await api("/api/v1/categories", { method: "POST", body: data });
    return true;
  } catch {
    return false;
  }
}

// Supprimer une categorie
export async function deleteCategorie(id: string): Promise<boolean> {
  if (await isDevModeActive()) return true;

  try {
    await api("/api/v1/categories/" + id, { method: "DELETE" });
    return true;
  } catch {
    return false;
  }
}
