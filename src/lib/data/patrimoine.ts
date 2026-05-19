import { api } from "@/lib/api/client";
import { isDevModeActive } from "@/lib/dev/config";
import { getMockPatrimoineData } from "@/lib/dev/mock-data";
import type { Profile } from "@/types/api";

// Types pour les donnees du patrimoine
export interface PatrimoineData {
  profile: Profile | null;
  comptes: ComptePatrimoine[];
  investissements: InvestissementPatrimoine[];
  dettes: DettePatrimoine[];
  evolutionPatrimoine: EvolutionPatrimoine[];
  totaux: TotauxPatrimoine;
}

export interface ComptePatrimoine {
  id: string;
  nom: string;
  type: "courant" | "epargne" | "cash" | "investissement";
  banque: string;
  solde: number;
  icone: string;
  couleur: string;
}

export interface InvestissementPatrimoine {
  id: string;
  nom: string;
  ticker: string;
  type: string;
  valeurActuelle: number;
  plusValue: number;
  plusValuePercent: number;
  imageUrl: string | null;
}

export interface DettePatrimoine {
  id: string;
  nom: string;
  type: string;
  capitalRestant: number;
  capitalInitial: number;
  mensualite: number;
  prochainPrelevement: Date;
  preteur: string;
  imageUrl: string | null;
}

export interface EvolutionPatrimoine {
  date: string;
  actifs: number;
  passifs: number;
  net: number;
}

export interface TotauxPatrimoine {
  totalLiquidites: number;
  totalInvestissements: number;
  totalActifs: number;
  totalDettes: number;
  valeurNette: number;
  totalPlusValue: number;
  totalPlusValuePercent: number;
  totalMensualitesDettes: number;
}

// Recuperer toutes les donnees du patrimoine (compose depuis dashboard)
export async function getPatrimoineData(): Promise<PatrimoineData> {
  if (await isDevModeActive()) return getMockPatrimoineData();

  // Le backend n'a pas d'endpoint /patrimoine dedie
  // On compose depuis les endpoints individuels
  const [profile, accounts, investments, liabilities] = await Promise.all([
    api<Profile>("/api/v1/profile").catch(() => null),
    api<{ id: string; nom: string; type: string; banque?: string; solde?: number; soldeCents?: number; icone?: string; couleur?: string }[]>("/api/v1/accounts"),
    api<{ id: string; nom: string; ticker?: string; type: string; valeurActuelle?: number; valeur_actuelle?: number; plusValue?: number; plus_value?: number; plusValuePercent?: number; imageUrl?: string; image_url?: string }[]>("/api/v1/investments"),
    api<{ id: string; nom: string; type: string; capitalRestant?: number; capital_restant?: number; capitalInitial?: number; capital_initial?: number; mensualite?: number; jourPrelevement?: number; jour_prelevement?: number; preteur?: string; imageUrl?: string; image_url?: string }[]>("/api/v1/liabilities"),
  ]);

  const comptes: ComptePatrimoine[] = accounts.map((a) => ({
    id: a.id,
    nom: a.nom,
    type: (a.type as ComptePatrimoine["type"]) || "courant",
    banque: a.banque ?? "",
    solde: a.solde ?? (a.soldeCents ? a.soldeCents / 100 : 0),
    icone: a.icone ?? "🏦",
    couleur: a.couleur ?? "#3b82f6",
  }));

  const investissements: InvestissementPatrimoine[] = investments.map((i) => ({
    id: i.id,
    nom: i.nom,
    ticker: i.ticker ?? "",
    type: i.type,
    valeurActuelle: i.valeurActuelle ?? i.valeur_actuelle ?? 0,
    plusValue: i.plusValue ?? i.plus_value ?? 0,
    plusValuePercent: i.plusValuePercent ?? 0,
    imageUrl: i.imageUrl ?? i.image_url ?? null,
  }));

  const dettes: DettePatrimoine[] = liabilities.map((l) => ({
    id: l.id,
    nom: l.nom,
    type: l.type,
    capitalRestant: l.capitalRestant ?? l.capital_restant ?? 0,
    capitalInitial: l.capitalInitial ?? l.capital_initial ?? 0,
    mensualite: l.mensualite ?? 0,
    prochainPrelevement: new Date(),
    preteur: l.preteur ?? "",
    imageUrl: l.imageUrl ?? l.image_url ?? null,
  }));

  const totalLiquidites = comptes.reduce((acc, c) => acc + c.solde, 0);
  const totalInvestissements = investissements.reduce((acc, i) => acc + i.valeurActuelle, 0);
  const totalDettes = dettes.reduce((acc, d) => acc + d.capitalRestant, 0);
  const totalPlusValue = investissements.reduce((acc, i) => acc + i.plusValue, 0);
  const totalInvestBase = totalInvestissements - totalPlusValue;

  const data: PatrimoineData = {
    profile,
    comptes,
    investissements,
    dettes,
    evolutionPatrimoine: [],
    totaux: {
      totalLiquidites,
      totalInvestissements,
      totalActifs: totalLiquidites + totalInvestissements,
      totalDettes,
      valeurNette: totalLiquidites + totalInvestissements - totalDettes,
      totalPlusValue,
      totalPlusValuePercent: totalInvestBase > 0 ? (totalPlusValue / totalInvestBase) * 100 : 0,
      totalMensualitesDettes: dettes.reduce((acc, d) => acc + d.mensualite, 0),
    },
  };

  return data;
}

// Mettre a jour le solde d'un compte
export async function updateCompteSolde(
  compteId: string,
  nouveauSolde: number,
): Promise<boolean> {
  if (await isDevModeActive()) return true;

  try {
    await api("/api/v1/accounts/" + compteId, {
      method: "PUT",
      body: { solde: nouveauSolde },
    });
    return true;
  } catch {
    return false;
  }
}
