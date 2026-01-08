import { createClient } from "@/lib/supabase/server";
import type {
    Profile,
    Compte,
    Categorie,
    ChargeFix,
    Transaction,
    Tables
} from "@/types/database.types";

// Types pour les données du dashboard
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

// Fonction pour calculer la prochaine date de prélèvement
function getNextPaymentDate(jourPrelevement: number | null): Date {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const jour = jourPrelevement ?? 1;

    // Créer la date du prélèvement ce mois
    let nextDate = new Date(currentYear, currentMonth, jour);

    // Si la date est passée, prendre le mois prochain
    if (nextDate < today) {
        nextDate = new Date(currentYear, currentMonth + 1, jour);
    }

    return nextDate;
}

// Récupérer toutes les données du dashboard
export async function getDashboardData(): Promise<DashboardData> {
    const supabase = await createClient();

    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            profile: null,
            comptes: [],
            categories: [],
            chargesFixes: [],
            transactions: [],
            patrimoine: {
                valeurNette: 0,
                totalLiquidites: 0,
                totalInvestissements: 0,
                totalDettes: 0,
                variationMois: 0,
                repartition: [],
            },
        };
    }

    // Récupérer toutes les données en parallèle
    const [
        profileResult,
        comptesResult,
        categoriesResult,
        chargesFixesResult,
        transactionsResult,
        patrimoineResult,
        investissementsResult,
        dettesResult,
        historiqueResult,
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

        // Transactions du mois en cours
        supabase
            .from("transactions")
            .select("*, categories(*)")
            .eq("user_id", user.id)
            .gte("date_transaction", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
            .order("date_transaction", { ascending: false }),

        // Vue patrimoine total
        supabase
            .from("v_patrimoine_total")
            .select("*")
            .eq("user_id", user.id)
            .single(),

        // Investissements pour la répartition
        supabase
            .from("investissements")
            .select("type, valeur_actuelle")
            .eq("user_id", user.id),

        // Dettes
        supabase
            .from("dettes")
            .select("capital_restant")
            .eq("user_id", user.id),

        // Historique pour calculer la variation
        supabase
            .from("historique_soldes")
            .select("valeur_nette, date_snapshot")
            .eq("user_id", user.id)
            .order("date_snapshot", { ascending: false })
            .limit(2),
    ]);

    // Transformer les catégories
    const categories: CategorieVariable[] = (categoriesResult.data ?? []).map((cat) => ({
        id: cat.id,
        nom: cat.nom,
        icone: cat.icone ?? "📦",
        couleur: cat.couleur ?? "#6b7280",
        budgetMensuel: cat.budget_mensuel ?? 0,
    }));

    // Transformer les charges fixes avec dates
    const chargesFixes: ChargeFixAvecDate[] = (chargesFixesResult.data ?? []).map((charge) => ({
        id: charge.id,
        nom: charge.nom,
        montant: charge.montant,
        icone: charge.icone ?? "💸",
        dateProchain: getNextPaymentDate(charge.jour_prelevement),
    }));

    // Transformer les transactions
    const transactions: TransactionAvecCategorie[] = (transactionsResult.data ?? []).map((t) => {
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

    // Calculer la répartition du patrimoine
    const totalLiquidites = patrimoineResult.data?.total_liquidites ?? 0;
    const totalInvestissements = patrimoineResult.data?.total_investissements ?? 0;
    const totalDettes = patrimoineResult.data?.total_dettes ?? 0;
    const valeurNette = patrimoineResult.data?.valeur_nette ?? 0;

    // Grouper les investissements par type
    const investissementsParType = new Map<string, number>();
    (investissementsResult.data ?? []).forEach((inv) => {
        const current = investissementsParType.get(inv.type) ?? 0;
        investissementsParType.set(inv.type, current + (inv.valeur_actuelle ?? 0));
    });

    // Calculer la variation mensuelle
    let variationMois = 0;
    if (historiqueResult.data && historiqueResult.data.length >= 2) {
        const current = historiqueResult.data[0].valeur_nette ?? 0;
        const previous = historiqueResult.data[1].valeur_nette ?? 0;
        if (previous > 0) {
            variationMois = ((current - previous) / previous) * 100;
        }
    }

    // Créer la répartition du patrimoine
    const repartition: PatrimoineRepartition[] = [];

    if (totalLiquidites > 0) {
        repartition.push({
            name: "Liquidités",
            value: totalLiquidites,
            className: "text-asset-liquidity",
        });
    }

    // Ajouter les investissements par type
    const typeClassMap: Record<string, string> = {
        "ETF": "text-asset-stocks",
        "Actions": "text-asset-stocks",
        "Crypto": "text-asset-crypto",
        "Obligations": "text-asset-savings",
        "Immobilier": "text-asset-real-estate",
        "Assurance-vie": "text-asset-savings",
        "PEA": "text-asset-stocks",
        "Autre": "text-asset-other",
    };

    investissementsParType.forEach((value, type) => {
        if (value > 0) {
            repartition.push({
                name: type,
                value,
                className: typeClassMap[type] ?? "text-asset-other",
            });
        }
    });

    // Comptes épargne séparément
    const comptesEpargne = (comptesResult.data ?? []).filter(c => c.type === "epargne");
    const totalEpargne = comptesEpargne.reduce((acc, c) => acc + (c.solde ?? 0), 0);
    if (totalEpargne > 0) {
        repartition.push({
            name: "Épargne",
            value: totalEpargne,
            className: "text-asset-savings",
        });
    }

    const patrimoine: PatrimoineData = {
        valeurNette,
        totalLiquidites,
        totalInvestissements,
        totalDettes,
        variationMois,
        repartition: repartition.length > 0 ? repartition : [
            { name: "Liquidités", value: totalLiquidites || 0, className: "text-asset-liquidity" },
        ],
    };

    return {
        profile: profileResult.data,
        comptes: comptesResult.data ?? [],
        categories,
        chargesFixes,
        transactions,
        patrimoine,
    };
}
