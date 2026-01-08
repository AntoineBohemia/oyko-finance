import { createClient } from "@/lib/supabase/server";
import type {
    Profile,
    Categorie,
    Transaction,
} from "@/types/database.types";

// Types pour les données du budget
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

// Récupérer toutes les données du budget pour un mois donné
export async function getBudgetData(month: number, year: number): Promise<BudgetData> {
    const supabase = await createClient();

    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            profile: null,
            revenusMois: 0,
            enveloppes: [],
            chargesFixes: [],
            transactions: [],
            totalChargesFixes: 0,
        };
    }

    // Dates du mois
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
    const today = new Date();

    // Récupérer toutes les données en parallèle
    const [
        profileResult,
        categoriesResult,
        chargesFixesResult,
        transactionsResult,
    ] = await Promise.all([
        // Profile
        supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single(),

        // Catégories variables (enveloppes)
        supabase
            .from("categories")
            .select("*")
            .eq("user_id", user.id)
            .eq("type", "depense")
            .eq("est_fixe", false)
            .eq("est_actif", true)
            .order("ordre"),

        // Charges fixes
        supabase
            .from("charges_fixes")
            .select("*")
            .eq("user_id", user.id)
            .eq("est_actif", true)
            .order("jour_prelevement"),

        // Transactions du mois
        supabase
            .from("transactions")
            .select("*, categories(*)")
            .eq("user_id", user.id)
            .gte("date_transaction", startOfMonth.toISOString())
            .lte("date_transaction", endOfMonth.toISOString())
            .order("date_transaction", { ascending: false }),
    ]);

    const profile = profileResult.data;
    const revenusMois = profile?.revenus_mensuels ?? 0;

    // Transformer les catégories en enveloppes
    const enveloppes: Enveloppe[] = (categoriesResult.data ?? []).map((cat) => ({
        id: cat.id,
        nom: cat.nom,
        icone: cat.icone ?? "📦",
        couleur: cat.couleur ?? "#6b7280",
        budgetMensuel: cat.budget_mensuel ?? 0,
    }));

    // Déterminer quelles charges ont été prélevées ce mois
    const transactionsChargesFixes = (transactionsResult.data ?? []).filter(
        (t) => t.charge_fixe_id !== null
    );
    const chargesFixesPrelevees = new Set(
        transactionsChargesFixes.map((t) => t.charge_fixe_id)
    );

    // Transformer les charges fixes
    const chargesFixes: ChargeFixBudget[] = (chargesFixesResult.data ?? []).map((charge) => {
        // Vérifier si prélevé ce mois
        const estPreleve = chargesFixesPrelevees.has(charge.id) ||
            // Ou si le jour de prélèvement est passé et qu'il y a une transaction correspondante
            (charge.jour_prelevement !== null &&
             charge.jour_prelevement <= today.getDate() &&
             today.getMonth() === month &&
             today.getFullYear() === year);

        return {
            id: charge.id,
            nom: charge.nom,
            icone: charge.icone ?? "💸",
            montant: charge.montant,
            jourPrelevement: charge.jour_prelevement ?? 1,
            estPreleve,
        };
    });

    const totalChargesFixes = chargesFixes.reduce((acc, c) => acc + c.montant, 0);

    // Transformer les transactions
    const transactions: TransactionBudget[] = (transactionsResult.data ?? []).map((t) => {
        const cat = t.categories as Categorie | null;
        let type: "variable" | "fixe" | "revenu" = "variable";

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
            categorieId: t.categorie_id ?? "",
            type,
        };
    });

    return {
        profile,
        revenusMois,
        enveloppes,
        chargesFixes,
        transactions,
        totalChargesFixes,
    };
}

// Mettre à jour le budget d'une catégorie
export async function updateCategoryBudget(categoryId: string, newBudget: number): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("categories")
        .update({ budget_mensuel: newBudget })
        .eq("id", categoryId);

    return !error;
}
