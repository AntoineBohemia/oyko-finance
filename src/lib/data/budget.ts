import { api } from "@/lib/api/client";
import { isDevModeActive } from "@/lib/dev/config";
import { getMockBudgetData } from "@/lib/dev/mock-data";
import type { Profile } from "@/types/api";

// Types pour les donnees du budget
export interface BudgetData {
  profile: Profile | null;
  revenusMois: number;
  enveloppes: Enveloppe[];
  chargesFixes: ChargeFixBudget[];
  transactions: TransactionBudget[];
  totalChargesFixes: number;
}

export interface Enveloppe {
  id: string;
  nom: string;
  icone: string;
  couleur: string;
  budgetMensuel: number;
}

export interface ChargeFixBudget {
  id: string;
  nom: string;
  icone: string;
  montant: number;
  jourPrelevement: number;
  estPreleve: boolean;
}

export interface TransactionBudget {
  id: string;
  description: string;
  montant: number;
  date: Date;
  categorieId: string;
  type: "variable" | "fixe" | "revenu";
}

// Map des icones string vers emoji (meme map que dashboard)
const ICON_TO_EMOJI: Record<string, string> = {
  "briefcase": "💼", "shopping-cart": "🛒", "trending-up": "📈",
  "home": "🏠", "car": "🚗", "heart": "❤️", "coffee": "☕",
  "film": "🎬", "music": "🎵", "book": "📚", "gift": "🎁",
  "smartphone": "📱", "wifi": "🌐", "zap": "⚡", "shield": "🛡️",
  "activity": "💪", "dollar-sign": "💰", "credit-card": "💳",
  "tv": "📺", "truck": "🚚", "plane": "✈️", "scissors": "✂️",
  "shirt": "👕", "tool": "🔧", "umbrella": "☂️", "users": "👥",
  "phone": "📞", "mail": "📧", "map-pin": "📍", "tag": "🏷️",
  "percent": "💸", "package": "📦", "star": "⭐", "award": "🏆",
};

function mapIcone(icone: string | null): string {
  if (!icone) return "📦";
  if (/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/u.test(icone)) return icone;
  return ICON_TO_EMOJI[icone] || "📦";
}

// Recuperer toutes les donnees du budget pour un mois donne
export async function getBudgetData(
  month: number,
  year: number,
): Promise<BudgetData> {
  if (await isDevModeActive()) return getMockBudgetData();

  const raw = await api<Record<string, unknown>>("/api/v1/budget", {
    params: { month, year },
  });

  const rawEnvs = (raw.enveloppes as Array<Record<string, unknown>>) || [];
  const rawCfs = (raw.chargesFixes as Array<Record<string, unknown>>) || [];
  const rawTxs = (raw.transactions as Array<Record<string, unknown>>) || [];

  const enveloppes: Enveloppe[] = rawEnvs.map((e) => ({
    id: e.id as string,
    nom: e.nom as string,
    icone: mapIcone(e.icone as string | null),
    couleur: (e.couleur as string) || "#6b7280",
    budgetMensuel: ((e.budgetMensuel ?? e.budget_mensuel ?? e.budget ?? e.budgetMensuelEuros ?? 0) as number),
  }));

  const chargesFixes: ChargeFixBudget[] = rawCfs.map((cf) => ({
    id: cf.id as string,
    nom: (cf.nom as string) || "",
    icone: mapIcone(cf.icone as string | null),
    montant: ((cf.montantEuros ?? cf.montant ?? 0) as number),
    jourPrelevement: ((cf.jourPrelevement ?? cf.jour_prelevement ?? 1) as number),
    estPreleve: (cf.estPreleve ?? cf.est_preleve ?? false) as boolean,
  }));

  const transactions: TransactionBudget[] = rawTxs.map((t) => ({
    id: t.id as string,
    description: (t.description as string) || "",
    montant: ((t.montantEuros ?? t.montant ?? 0) as number),
    date: (() => { const d = new Date((t.date ?? t.dateTransaction ?? "") as string); return isNaN(d.getTime()) ? new Date() : d; })(),
    categorieId: ((t.categorieId ?? t.categorie_id ?? "") as string),
    type: (() => {
      const raw = (t.type as string) || "";
      if (raw === "revenu" || raw === "CREDIT") return "revenu";
      if (raw === "fixe" || raw === "RECURRING") return "fixe";
      return "variable";
    })() as "variable" | "fixe" | "revenu",
  }));

  return {
    profile: raw.profile as Profile | null,
    revenusMois: (raw.revenusMois ?? 0) as number,
    enveloppes,
    chargesFixes,
    transactions,
    totalChargesFixes: (raw.totalChargesFixes ?? 0) as number,
  };
}

// Mettre a jour le budget d'une categorie
export async function updateCategoryBudget(
  categoryId: string,
  newBudget: number,
): Promise<boolean> {
  if (await isDevModeActive()) return true;

  try {
    await api("/api/v1/categories/" + categoryId, {
      method: "PUT",
      body: { budgetMensuel: newBudget },
    });
    return true;
  } catch {
    return false;
  }
}
