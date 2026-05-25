import { api } from "@/lib/api/client";
import type { Profile } from "@/types/api";

// Types pour les donnees des depenses
export interface DepensesData {
  profile: Profile | null;
  comptes: CompteDepense[];
  categoriesDepense: CategorieDepense[];
  categoriesRevenu: CategorieDepense[];
  transactions: TransactionDepense[];
}

export interface CompteDepense {
  id: string;
  nom: string;
  banque: string;
}

export interface CategorieDepense {
  id: string;
  nom: string;
  icone: string;
  couleur: string;
}

export interface TransactionDepense {
  id: string;
  description: string;
  montant: number;
  date: Date;
  categorieId: string | null;
  compteId: string | null;
  type: "depense" | "revenu" | "fixe";
  categorieNom: string | null;
  categorieIcone: string | null;
  compteNom: string | null;
}

// Map des icones string vers emoji
const ICON_TO_EMOJI: Record<string, string> = {
  "briefcase": "💼", "shopping-cart": "🛒", "trending-up": "📈",
  "home": "🏠", "car": "🚗", "heart": "❤️", "coffee": "☕",
  "film": "🎬", "music": "🎵", "book": "📚", "gift": "🎁",
  "smartphone": "📱", "wifi": "🌐", "zap": "⚡", "shield": "🛡️",
  "activity": "💪", "dollar-sign": "💰", "credit-card": "💳",
  "tv": "📺", "phone": "📞", "tag": "🏷️", "package": "📦",
};

function mapIcone(icone: string | null): string {
  if (!icone) return "📦";
  if (/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/u.test(icone)) return icone;
  return ICON_TO_EMOJI[icone] || "📦";
}

// Recuperer toutes les donnees pour la page depenses
export async function getDepensesData(
  periodeFilter: string = "this-week",
): Promise<DepensesData> {
  // Le backend /transactions ne retourne pas profile/comptes/categories
  // On fetch en parallele
  const [raw, profile, categoriesRaw, comptesRaw] = await Promise.all([
    api<Record<string, unknown>>("/api/v1/transactions", { params: { period: periodeFilter } }),
    api<Profile>("/api/v1/profile").catch(() => null),
    api<Record<string, unknown>>("/api/v1/categories").catch(() => []),
    api<Record<string, unknown>>("/api/v1/accounts").catch(() => []),
  ]);

  const rawTxs = (raw.transactions as Array<Record<string, unknown>>) || [];
  const allCats = Array.isArray(categoriesRaw) ? categoriesRaw : ((categoriesRaw as Record<string, unknown>).categories ?? []) as Array<Record<string, unknown>>;
  const allComptes = Array.isArray(comptesRaw) ? comptesRaw : ((comptesRaw as Record<string, unknown>).comptes ?? []) as Array<Record<string, unknown>>;

  const mapCat = (c: Record<string, unknown>): CategorieDepense => ({
    id: c.id as string,
    nom: (c.nom as string) || "",
    icone: mapIcone((c.icone as string) || null),
    couleur: (c.couleur as string) || "#6b7280",
  });

  return {
    profile,
    comptes: allComptes.map((c) => ({
      id: (c.id as string),
      nom: (c.nom ?? c.name ?? "") as string,
      banque: (c.banque ?? c.bankName ?? c.bank_name ?? "") as string,
    })),
    categoriesDepense: allCats.filter((c) => (c.type as string) === "depense" || !c.type).map(mapCat),
    categoriesRevenu: allCats.filter((c) => (c.type as string) === "revenu").map(mapCat),
    transactions: rawTxs.map((t) => ({
      id: t.id as string,
      description: (t.description as string) || "",
      montant: ((t.montantEuros ?? t.montant ?? 0) as number),
      date: (() => { const d = new Date((t.date ?? t.dateTransaction ?? "") as string); return isNaN(d.getTime()) ? new Date() : d; })(),
      categorieId: ((t.categorieId ?? t.categorie_id ?? null) as string | null),
      compteId: ((t.compteId ?? t.compte_id ?? null) as string | null),
      type: (() => {
        const raw = (t.type as string) || "";
        if (raw === "revenu" || raw === "CREDIT") return "revenu";
        if (raw === "fixe" || raw === "RECURRING") return "fixe";
        return "depense";
      })() as "depense" | "revenu" | "fixe",
      categorieNom: (t.categorieNom ?? null) as string | null,
      categorieIcone: t.categorieIcone ? mapIcone(t.categorieIcone as string) : null,
      compteNom: (t.compteNom ?? null) as string | null,
    })),
  };
}

// Ajouter une nouvelle transaction
export async function addTransaction(data: {
  montant: number;
  categorieId: string;
  compteId: string;
  description?: string;
  type: "depense" | "revenu";
  date: Date;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await api("/api/v1/transactions", {
      method: "POST",
      body: {
        montant: data.type === "depense" ? -Math.abs(data.montant) : Math.abs(data.montant),
        categorieId: data.categorieId,
        compteId: data.compteId,
        description: data.description || null,
        type: data.type === "depense" ? "DEBIT" : data.type === "revenu" ? "CREDIT" : "OTHER",
        dateTransaction: data.date.toISOString(),
      },
    });
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erreur inconnue",
    };
  }
}

// Supprimer une transaction
export async function deleteTransaction(
  transactionId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await api("/api/v1/transactions/" + transactionId, { method: "DELETE" });
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erreur inconnue",
    };
  }
}
