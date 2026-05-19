import { api } from "@/lib/api/client";
import { isDevModeActive } from "@/lib/dev/config";
import { getMockDashboardData } from "@/lib/dev/mock-data";
import type { Profile, Compte } from "@/types/api";

// Types pour les donnees du dashboard
export interface DashboardData {
  profile: Profile | null;
  comptes: Compte[];
  categories: CategorieVariable[];
  chargesFixes: ChargeFixAvecDate[];
  transactions: TransactionAvecCategorie[];
  patrimoine: PatrimoineData;
}

export interface CategorieVariable {
  id: string;
  nom: string;
  icone: string;
  couleur: string;
  budgetMensuel: number;
}

export interface ChargeFixAvecDate {
  id: string;
  nom: string;
  montant: number;
  icone: string;
  dateProchain: Date;
}

export interface TransactionAvecCategorie {
  id: string;
  description: string;
  montant: number;
  date: Date;
  categorieId: string;
  type: "variable" | "fixe" | "revenu";
}

export interface PatrimoineData {
  valeurNette: number;
  totalLiquidites: number;
  totalInvestissements: number;
  totalDettes: number;
  variationMois: number;
  repartition: PatrimoineRepartition[];
}

export interface PatrimoineRepartition {
  name: string;
  value: number;
  className: string;
  [key: string]: string | number;
}

// Map des icones string vers emoji
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
  // Si c'est deja un emoji, le garder
  if (/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/u.test(icone)) return icone;
  return ICON_TO_EMOJI[icone] || "📦";
}

// Recuperer toutes les donnees du dashboard
export async function getDashboardData(): Promise<DashboardData> {
  if (await isDevModeActive()) return getMockDashboardData();

  // Le backend retourne un format brut, on le mappe vers le format frontend
  const raw = await api<Record<string, unknown>>("/api/v1/dashboard");

  const rawCats = (raw.categories as Array<Record<string, unknown>>) || [];
  const rawTxs = (raw.transactions as Array<Record<string, unknown>>) || [];
  const rawCfs = (raw.chargesFixes as Array<Record<string, unknown>>) || [];
  const rawPatrimoine = (raw.patrimoine as Record<string, unknown>) || {};
  const rawProfile = raw.profile as Profile | null;

  // Filtrer : seules les categories "depense" sont des enveloppes
  const categories: CategorieVariable[] = rawCats
    .filter((c) => c.type === "depense")
    .map((c) => ({
      id: c.id as string,
      nom: c.nom as string,
      icone: mapIcone(c.icone as string | null),
      couleur: (c.couleur as string) || "#6b7280",
      budgetMensuel: ((c.budgetMensuel ?? c.budget_mensuel ?? c.budgetMensuelEuros ?? 0) as number),
    }));

  // Transactions : mapper les champs et convertir dates
  const transactions: TransactionAvecCategorie[] = rawTxs.map((t) => ({
    id: t.id as string,
    description: (t.description as string) || "",
    montant: (t.montantEuros ?? t.montant ?? 0) as number,
    date: (() => { const d = new Date((t.date ?? t.dateTransaction ?? "") as string); return isNaN(d.getTime()) ? new Date() : d; })(),
    categorieId: (t.categorieId ?? t.categorie_id ?? "") as string,
    type: ((t.type as string) === "revenu" ? "revenu" : (t.type as string) === "fixe" ? "fixe" : "variable") as "variable" | "fixe" | "revenu",
  }));

  // Charges fixes
  const chargesFixes: ChargeFixAvecDate[] = rawCfs.map((cf) => ({
    id: cf.id as string,
    nom: (cf.nom as string) || "",
    montant: ((cf.montantEuros ?? cf.montant ?? 0) as number),
    icone: mapIcone(cf.icone as string | null),
    dateProchain: new Date((cf.dateProchain ?? cf.prochainPrelevement ?? new Date()) as string),
  }));

  // Patrimoine
  const patrimoine: PatrimoineData = {
    valeurNette: (rawPatrimoine.valeurNette ?? 0) as number,
    totalLiquidites: (rawPatrimoine.totalLiquidites ?? rawPatrimoine.totalActifs ?? 0) as number,
    totalInvestissements: (rawPatrimoine.totalInvestissements ?? 0) as number,
    totalDettes: (rawPatrimoine.totalDettes ?? 0) as number,
    variationMois: (rawPatrimoine.variationMois ?? 0) as number,
    repartition: (rawPatrimoine.repartition as PatrimoineRepartition[]) || [],
  };

  return {
    profile: rawProfile,
    comptes: (raw.comptes as Compte[]) || [],
    categories,
    chargesFixes,
    transactions,
    patrimoine,
  };
}
