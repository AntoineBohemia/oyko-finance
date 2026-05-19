import { api } from "@/lib/api/client";
import { isDevModeActive } from "@/lib/dev/config";
import { getMockInvestissementsData } from "@/lib/dev/mock-data";
import type { Profile } from "@/types/api";

// Types pour les donnees des investissements
export interface InvestissementsData {
  profile: Profile | null;
  investissements: InvestissementPortfolio[];
  evolutionPortfolio: EvolutionPortfolio[];
  repartitionParType: RepartitionType[];
  totaux: TotauxInvestissements;
  performanceAnnuelle: PerformanceAnnuelle[];
}

export interface InvestissementPortfolio {
  id: string;
  nom: string;
  ticker: string;
  type: string;
  plateforme: string;
  quantite: number;
  prixAchat: number;
  prixActuel: number;
  valeurAchat: number;
  valeurActuelle: number;
  plusValue: number;
  plusValuePercent: number;
  dateAchat: Date | null;
  imageUrl: string | null;
  notes: string | null;
  [key: string]: string | number | Date | null;
}

export interface EvolutionPortfolio {
  date: string;
  valeur: number;
  investi: number;
  [key: string]: string | number;
}

export interface RepartitionType {
  name: string;
  value: number;
  className: string;
  [key: string]: string | number;
}

export interface PerformanceAnnuelle {
  name: string;
  value: number;
  className: string;
  [key: string]: string | number;
}

export interface TotauxInvestissements {
  totalInvesti: number;
  totalActuel: number;
  plusValue: number;
  plusValuePercent: number;
  nombreActifs: number;
}

// Recuperer toutes les donnees des investissements
export async function getInvestissementsData(): Promise<InvestissementsData> {
  if (await isDevModeActive()) return getMockInvestissementsData();

  const data = await api<InvestissementsData>("/api/v1/investments");

  // Convertir les dates string en Date objects
  if (data.investissements) {
    data.investissements = data.investissements.map((inv) => ({
      ...inv,
      dateAchat: inv.dateAchat ? new Date(inv.dateAchat) : null,
    }));
  }

  return data;
}

// Ajouter un investissement
export async function addInvestissement(data: {
  nom: string;
  ticker?: string;
  type: string;
  plateforme?: string;
  quantite: number;
  prix_achat_unitaire: number;
  prix_actuel?: number;
  date_achat?: string;
  notes?: string;
}): Promise<{ success: boolean; id?: string }> {
  if (await isDevModeActive()) return { success: true, id: "mock-id" };

  try {
    const result = await api<{ id: string }>("/api/v1/investments", {
      method: "POST",
      body: data,
    });
    return { success: true, id: result.id };
  } catch {
    return { success: false };
  }
}

// Mettre a jour un investissement
export async function updateInvestissement(
  id: string,
  data: {
    nom?: string;
    ticker?: string;
    type?: string;
    plateforme?: string;
    quantite?: number;
    prix_achat_unitaire?: number;
    prix_actuel?: number;
    notes?: string;
  },
): Promise<boolean> {
  if (await isDevModeActive()) return true;

  try {
    await api("/api/v1/investments/" + id, { method: "PUT", body: data });
    return true;
  } catch {
    return false;
  }
}

// Supprimer un investissement
export async function deleteInvestissement(id: string): Promise<boolean> {
  if (await isDevModeActive()) return true;

  try {
    await api("/api/v1/investments/" + id, { method: "DELETE" });
    return true;
  } catch {
    return false;
  }
}

// Renforcer une position (ajouter a un investissement existant)
export async function addPosition(
  id: string,
  data: { quantite: number; prix: number },
): Promise<boolean> {
  if (await isDevModeActive()) return true;

  try {
    await api("/api/v1/investments/" + id + "/position", {
      method: "POST",
      body: data,
    });
    return true;
  } catch {
    return false;
  }
}

// Mettre a jour le prix actuel d'un investissement
export async function updatePrixActuel(
  id: string,
  prixActuel: number,
): Promise<boolean> {
  if (await isDevModeActive()) return true;

  try {
    await api("/api/v1/investments/" + id, {
      method: "PUT",
      body: { prix_actuel: prixActuel },
    });
    return true;
  } catch {
    return false;
  }
}
