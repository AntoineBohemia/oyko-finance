import { createClient } from "@/lib/supabase/server";
import type {
    Profile,
    Compte as CompteDB,
    Investissement as InvestissementDB,
    Dette as DetteDB,
    HistoriqueSolde,
} from "@/types/database.types";

// Types pour les données du patrimoine
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

// Fonction pour calculer la prochaine date de prélèvement dette
function getNextDebtPaymentDate(jourPrelevement: number | null): Date {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const jour = jourPrelevement ?? 1;

    let nextDate = new Date(currentYear, currentMonth, jour);

    if (nextDate < today) {
        nextDate = new Date(currentYear, currentMonth + 1, jour);
    }

    return nextDate;
}

// Récupérer toutes les données du patrimoine
export async function getPatrimoineData(): Promise<PatrimoineData> {
    const supabase = await createClient();

    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            profile: null,
            comptes: [],
            investissements: [],
            dettes: [],
            evolutionPatrimoine: [],
            totaux: {
                totalLiquidites: 0,
                totalInvestissements: 0,
                totalActifs: 0,
                totalDettes: 0,
                valeurNette: 0,
                totalPlusValue: 0,
                totalPlusValuePercent: 0,
                totalMensualitesDettes: 0,
            },
        };
    }

    // Récupérer toutes les données en parallèle
    const [
        profileResult,
        comptesResult,
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

        // Investissements
        supabase
            .from("investissements")
            .select("*")
            .eq("user_id", user.id)
            .order("valeur_actuelle", { ascending: false }),

        // Dettes
        supabase
            .from("dettes")
            .select("*")
            .eq("user_id", user.id)
            .order("capital_restant", { ascending: false }),

        // Historique des 12 derniers mois
        supabase
            .from("historique_soldes")
            .select("*")
            .eq("user_id", user.id)
            .order("date_snapshot", { ascending: true })
            .limit(12),
    ]);

    // Transformer les comptes
    const comptes: ComptePatrimoine[] = (comptesResult.data ?? []).map((c) => ({
        id: c.id,
        nom: c.nom,
        type: c.type as "courant" | "epargne" | "cash" | "investissement",
        banque: c.banque ?? "",
        solde: c.solde ?? 0,
        icone: c.icone ?? "🏦",
        couleur: c.couleur ?? "#6b7280",
    }));

    // Transformer les investissements
    const investissements: InvestissementPatrimoine[] = (investissementsResult.data ?? []).map((inv) => {
        const valeurActuelle = inv.valeur_actuelle ?? 0;
        const prixAchat = (inv.prix_achat_unitaire ?? 0) * (inv.quantite ?? 0);
        const plusValue = inv.plus_value ?? (valeurActuelle - prixAchat);
        const plusValuePercent = prixAchat > 0 ? (plusValue / prixAchat) * 100 : 0;

        return {
            id: inv.id,
            nom: inv.nom,
            ticker: inv.ticker ?? "",
            type: inv.type,
            valeurActuelle,
            plusValue,
            plusValuePercent,
            imageUrl: inv.image_url,
        };
    });

    // Transformer les dettes
    const dettes: DettePatrimoine[] = (dettesResult.data ?? []).map((d) => ({
        id: d.id,
        nom: d.nom,
        type: d.type,
        capitalRestant: d.capital_restant,
        capitalInitial: d.capital_initial,
        mensualite: d.mensualite,
        prochainPrelevement: getNextDebtPaymentDate(d.jour_prelevement),
        preteur: d.preteur ?? "",
        imageUrl: d.image_url,
    }));

    // Transformer l'historique
    const evolutionPatrimoine: EvolutionPatrimoine[] = (historiqueResult.data ?? []).map((h) => ({
        date: h.date_snapshot,
        actifs: (h.total_liquidites ?? 0) + (h.total_investissements ?? 0),
        passifs: h.total_dettes ?? 0,
        net: h.valeur_nette ?? 0,
    }));

    // Calculer les totaux
    const totalLiquidites = comptes
        .filter((c) => c.type !== "investissement")
        .reduce((acc, c) => acc + c.solde, 0);

    const totalInvestissements = investissements.reduce((acc, i) => acc + i.valeurActuelle, 0);
    const totalActifs = totalLiquidites + totalInvestissements;
    const totalDettes = dettes.reduce((acc, d) => acc + d.capitalRestant, 0);
    const valeurNette = totalActifs - totalDettes;

    const totalPlusValue = investissements.reduce((acc, i) => acc + i.plusValue, 0);
    const totalInvestBase = totalInvestissements - totalPlusValue;
    const totalPlusValuePercent = totalInvestBase > 0 ? (totalPlusValue / totalInvestBase) * 100 : 0;

    const totalMensualitesDettes = dettes.reduce((acc, d) => acc + d.mensualite, 0);

    const totaux: TotauxPatrimoine = {
        totalLiquidites,
        totalInvestissements,
        totalActifs,
        totalDettes,
        valeurNette,
        totalPlusValue,
        totalPlusValuePercent,
        totalMensualitesDettes,
    };

    return {
        profile: profileResult.data,
        comptes,
        investissements,
        dettes,
        evolutionPatrimoine,
        totaux,
    };
}

// Mettre à jour le solde d'un compte
export async function updateCompteSolde(compteId: string, nouveauSolde: number): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("comptes")
        .update({ solde: nouveauSolde })
        .eq("id", compteId);

    return !error;
}
