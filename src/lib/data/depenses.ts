import { createClient } from "@/lib/supabase/server";
import type { Profile, Categorie, Compte, Transaction } from "@/types/database.types";

// Types pour les données des dépenses
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

// Récupérer toutes les données pour la page dépenses
export async function getDepensesData(
    periodeFilter: string = "this-week"
): Promise<DepensesData> {
    const supabase = await createClient();

    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            profile: null,
            comptes: [],
            categoriesDepense: [],
            categoriesRevenu: [],
            transactions: [],
        };
    }

    // Calculer les dates en fonction du filtre
    const today = new Date();
    let startDate: Date;
    let endDate: Date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    switch (periodeFilter) {
        case "this-week": {
            const dayOfWeek = today.getDay();
            const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lundi = début de semaine
            startDate = new Date(today);
            startDate.setDate(today.getDate() - diff);
            startDate.setHours(0, 0, 0, 0);
            break;
        }
        case "this-month":
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        case "last-month":
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
            break;
        case "all":
        default:
            startDate = new Date(2000, 0, 1); // Depuis très longtemps
            break;
    }

    // Récupérer toutes les données en parallèle
    const [
        profileResult,
        comptesResult,
        categoriesDepenseResult,
        categoriesRevenuResult,
        transactionsResult,
    ] = await Promise.all([
        // Profile
        supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single(),

        // Comptes
        supabase
            .from("comptes")
            .select("*")
            .eq("user_id", user.id)
            .eq("est_actif", true)
            .order("ordre"),

        // Catégories de dépenses
        supabase
            .from("categories")
            .select("*")
            .eq("user_id", user.id)
            .eq("type", "depense")
            .eq("est_actif", true)
            .order("ordre"),

        // Catégories de revenus
        supabase
            .from("categories")
            .select("*")
            .eq("user_id", user.id)
            .eq("type", "revenu")
            .eq("est_actif", true)
            .order("ordre"),

        // Transactions avec relations
        supabase
            .from("transactions")
            .select("*, categories(*), comptes(*)")
            .eq("user_id", user.id)
            .gte("date_transaction", startDate.toISOString())
            .lte("date_transaction", endDate.toISOString())
            .order("date_transaction", { ascending: false }),
    ]);

    const profile = profileResult.data;

    // Transformer les comptes
    const comptes: CompteDepense[] = (comptesResult.data ?? []).map((c) => ({
        id: c.id,
        nom: c.nom,
        banque: c.banque ?? "",
    }));

    // Transformer les catégories de dépenses
    const categoriesDepense: CategorieDepense[] = (categoriesDepenseResult.data ?? [])
        .filter((c) => !c.est_fixe)
        .map((c) => ({
            id: c.id,
            nom: c.nom,
            icone: c.icone ?? "📦",
            couleur: c.couleur ?? "#6b7280",
        }));

    // Transformer les catégories de revenus
    const categoriesRevenu: CategorieDepense[] = (categoriesRevenuResult.data ?? []).map((c) => ({
        id: c.id,
        nom: c.nom,
        icone: c.icone ?? "📦",
        couleur: c.couleur ?? "#6b7280",
    }));

    // Transformer les transactions
    const transactions: TransactionDepense[] = (transactionsResult.data ?? []).map((t) => {
        const cat = t.categories as Categorie | null;
        const compte = t.comptes as Compte | null;

        let type: "depense" | "revenu" | "fixe" = "depense";
        if (t.type === "revenu") {
            type = "revenu";
        } else if (t.charge_fixe_id || cat?.est_fixe) {
            type = "fixe";
        }

        return {
            id: t.id,
            description: t.description ?? "",
            montant: t.montant,
            date: new Date(t.date_transaction),
            categorieId: t.categorie_id,
            compteId: t.compte_id,
            type,
            categorieNom: cat?.nom ?? null,
            categorieIcone: cat?.icone ?? null,
            compteNom: compte?.nom ?? null,
        };
    });

    return {
        profile,
        comptes,
        categoriesDepense,
        categoriesRevenu,
        transactions,
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
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Non authentifié" };
    }

    // Le montant est négatif pour les dépenses, positif pour les revenus
    const montantFinal = data.type === "depense" ? -Math.abs(data.montant) : Math.abs(data.montant);

    const { error } = await supabase
        .from("transactions")
        .insert({
            user_id: user.id,
            montant: montantFinal,
            categorie_id: data.categorieId,
            compte_id: data.compteId,
            description: data.description || null,
            type: data.type,
            date_transaction: data.date.toISOString(),
        });

    if (error) {
        console.error("Erreur ajout transaction:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Supprimer une transaction
export async function deleteTransaction(transactionId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Non authentifié" };
    }

    const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Erreur suppression transaction:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
