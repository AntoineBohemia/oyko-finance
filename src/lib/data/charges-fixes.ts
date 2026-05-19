import { api } from "@/lib/api/client";
import { isDevModeActive } from "@/lib/dev/config";
import { getMockChargesFixesData } from "@/lib/dev/mock-data";
import type {
  Profile,
  Compte as CompteDB,
  CategoryResponse as CategorieDB,
} from "@/types/api";

// Types pour les donnees des charges fixes
export interface ChargesFixesData {
  profile: Profile | null;
  chargesFixes: ChargeFixePortfolio[];
  comptes: CompteDB[];
  categories: CategorieDB[];
  timeline: ChargeFixePortfolio[];
  repartitionCategories: RepartitionCategorie[];
  totaux: TotauxChargesFixes;
}

export interface ChargeFixePortfolio {
  id: string;
  nom: string;
  montant: number;
  frequence: "hebdo" | "mensuel" | "trimestriel" | "annuel";
  jourPrelevement: number;
  prochainPrelevement: Date;
  categorieId: string | null;
  categorieNom: string;
  compteId: string | null;
  compteNom: string;
  estActif: boolean;
  dateDebut: Date | null;
  dateFin: Date | null;
  notes: string | null;
  icone: string | null;
  couleur: string | null;
  coutMensuel: number;
  coutAnnuel: number;
}

export interface RepartitionCategorie {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

export interface TotauxChargesFixes {
  nombreActifs: number;
  nombreInactifs: number;
  totalMensuel: number;
  totalAnnuel: number;
  prochainPrelevement: ChargeFixePortfolio | null;
}

// Recuperer toutes les donnees des charges fixes
export async function getChargesFixesData(): Promise<ChargesFixesData> {
  if (await isDevModeActive()) return getMockChargesFixesData();

  const raw = await api<Record<string, unknown>>("/api/v1/recurring-charges");

  // Convertir les dates string en Date objects
  const safeDate = (v: unknown): Date => {
    const d = new Date(v as string);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const convertDates = (cf: ChargeFixePortfolio) => ({
    ...cf,
    prochainPrelevement: safeDate(cf.prochainPrelevement),
    dateDebut: cf.dateDebut ? safeDate(cf.dateDebut) : null,
    dateFin: cf.dateFin ? safeDate(cf.dateFin) : null,
  });

  const chargesFixes = ((raw.chargesFixes ?? []) as ChargeFixePortfolio[]).map(convertDates);
  const timeline = ((raw.timeline ?? []) as ChargeFixePortfolio[]).map(convertDates);
  const repartitionCategories = (raw.repartitionCategories ?? []) as RepartitionCategorie[];
  const rawTotaux = (raw.totaux ?? {}) as Record<string, unknown>;

  const data: ChargesFixesData = {
    profile: (raw.profile ?? null) as Profile | null,
    chargesFixes,
    comptes: (raw.comptes ?? []) as CompteDB[],
    categories: (raw.categories ?? []) as CategorieDB[],
    timeline,
    repartitionCategories,
    totaux: {
      nombreActifs: (rawTotaux.nombreActifs ?? chargesFixes.filter((cf) => cf.estActif).length) as number,
      nombreInactifs: (rawTotaux.nombreInactifs ?? chargesFixes.filter((cf) => !cf.estActif).length) as number,
      totalMensuel: (rawTotaux.totalMensuel ?? 0) as number,
      totalAnnuel: (rawTotaux.totalAnnuel ?? 0) as number,
      prochainPrelevement: rawTotaux.prochainPrelevement
        ? convertDates(rawTotaux.prochainPrelevement as ChargeFixePortfolio)
        : (chargesFixes[0] ?? null),
    },
  };

  return data;
}

// Ajouter une charge fixe
export async function addChargeFix(data: {
  nom: string;
  montant: number;
  frequence: string;
  jourDuMois: number;
  categorieId?: string;
  compteId?: string;
  notes?: string;
}): Promise<{ success: boolean; id?: string }> {
  if (await isDevModeActive()) return { success: true, id: "mock-id" };

  try {
    const result = await api<{ id: string }>("/api/v1/recurring-charges", {
      method: "POST",
      body: data,
    });
    return { success: true, id: result.id };
  } catch {
    return { success: false };
  }
}

// Mettre a jour une charge fixe
export async function updateChargeFix(
  id: string,
  data: {
    nom?: string;
    montant?: number;
    frequence?: string;
    jourDuMois?: number;
    categorieId?: string;
    compteId?: string;
    estActif?: boolean;
    notes?: string;
  },
): Promise<boolean> {
  if (await isDevModeActive()) return true;

  try {
    await api("/api/v1/recurring-charges/" + id, { method: "PUT", body: data });
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

// Activer/Desactiver une charge fixe
export async function toggleChargeFixActive(
  id: string,
  estActif: boolean,
): Promise<boolean> {
  if (await isDevModeActive()) return true;

  try {
    await api("/api/v1/recurring-charges/" + id + "/toggle", {
      method: "PATCH",
      body: { estActif },
    });
    return true;
  } catch {
    return false;
  }
}
