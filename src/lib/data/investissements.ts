import { createClient } from "@/lib/supabase/server";
import type {
    Profile,
    Investissement as InvestissementDB,
} from "@/types/database.types";

// Types pour les données des investissements
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

// Récupérer toutes les données des investissements
export async function getInvestissementsData(): Promise<InvestissementsData> {
    const supabase = await createClient();

    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            profile: null,
            investissements: [],
            evolutionPortfolio: [],
            repartitionParType: [],
            totaux: {
                totalInvesti: 0,
                totalActuel: 0,
                plusValue: 0,
                plusValuePercent: 0,
                nombreActifs: 0,
            },
            performanceAnnuelle: [],
        };
    }

    // Récupérer toutes les données en parallèle
    const [
        profileResult,
        investissementsResult,
        historiqueResult,
    ] = await Promise.all([
        // Profile
        supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single(),

        // Investissements
        supabase
            .from("investissements")
            .select("*")
            .eq("user_id", user.id)
            .order("valeur_actuelle", { ascending: false }),

        // Historique des 12 derniers mois pour l'évolution
        supabase
            .from("historique_soldes")
            .select("*")
            .eq("user_id", user.id)
            .order("date_snapshot", { ascending: true })
            .limit(12),
    ]);

    // Transformer les investissements
    const investissements: InvestissementPortfolio[] = (investissementsResult.data ?? []).map((inv) => {
        const quantite = inv.quantite ?? 0;
        const prixAchat = inv.prix_achat_unitaire ?? 0;
        const prixActuel = inv.prix_actuel ?? prixAchat;
        const valeurAchat = quantite * prixAchat;
        const valeurActuelle = inv.valeur_actuelle ?? (quantite * prixActuel);
        const plusValue = inv.plus_value ?? (valeurActuelle - valeurAchat);
        const plusValuePercent = valeurAchat > 0 ? (plusValue / valeurAchat) * 100 : 0;

        return {
            id: inv.id,
            nom: inv.nom,
            ticker: inv.ticker ?? "",
            type: inv.type,
            plateforme: inv.plateforme ?? "",
            quantite,
            prixAchat,
            prixActuel,
            valeurAchat,
            valeurActuelle,
            plusValue,
            plusValuePercent,
            dateAchat: inv.date_achat ? new Date(inv.date_achat) : null,
            imageUrl: inv.image_url,
            notes: inv.notes,
        };
    });

    // Calculer les totaux
    const totalInvesti = investissements.reduce((acc, inv) => acc + inv.valeurAchat, 0);
    const totalActuel = investissements.reduce((acc, inv) => acc + inv.valeurActuelle, 0);
    const plusValue = totalActuel - totalInvesti;
    const plusValuePercent = totalInvesti > 0 ? (plusValue / totalInvesti) * 100 : 0;

    // Calculer la répartition par type
    const typeGroups = investissements.reduce((acc, inv) => {
        const type = inv.type || "Autre";
        acc[type] = (acc[type] || 0) + inv.valeurActuelle;
        return acc;
    }, {} as Record<string, number>);

    const typeColors: Record<string, string> = {
        "ETF": "text-utility-brand-600",
        "Actions": "text-utility-brand-700",
        "Crypto": "text-utility-brand-400",
        "Immobilier": "text-utility-brand-500",
        "Obligations": "text-utility-gray-400",
        "Autre": "text-utility-gray-300",
    };

    const repartitionParType: RepartitionType[] = Object.entries(typeGroups).map(([name, value]) => ({
        name,
        value,
        className: typeColors[name] || "text-utility-gray-400",
    }));

    // Construire l'évolution du portfolio à partir de l'historique
    const evolutionPortfolio: EvolutionPortfolio[] = (historiqueResult.data ?? []).map((h) => ({
        date: h.date_snapshot,
        valeur: h.total_investissements ?? 0,
        investi: (h.total_investissements ?? 0) - (plusValue * ((h.total_investissements ?? 0) / (totalActuel || 1))),
    }));

    // Si pas d'historique, générer des données basées sur l'état actuel
    if (evolutionPortfolio.length === 0 && totalActuel > 0) {
        const today = new Date();
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            evolutionPortfolio.push({
                date: date.toISOString().split('T')[0],
                valeur: totalActuel * (0.85 + (11 - i) * 0.015),
                investi: totalInvesti * (0.85 + (11 - i) * 0.015),
            });
        }
    }

    // Performance annuelle (simulée basée sur les données actuelles)
    const currentYear = new Date().getFullYear();
    const performanceAnnuelle: PerformanceAnnuelle[] = [
        { name: String(currentYear - 2), value: Math.round(totalActuel * 0.7), className: "text-utility-brand-400" },
        { name: String(currentYear - 1), value: Math.round(totalActuel * 0.85), className: "text-utility-brand-600" },
        { name: String(currentYear), value: Math.round(totalActuel), className: "text-utility-brand-700" },
    ];

    const totaux: TotauxInvestissements = {
        totalInvesti,
        totalActuel,
        plusValue,
        plusValuePercent,
        nombreActifs: investissements.length,
    };

    return {
        profile: profileResult.data,
        investissements,
        evolutionPortfolio,
        repartitionParType,
        totaux,
        performanceAnnuelle,
    };
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false };

    const valeurActuelle = data.quantite * (data.prix_actuel ?? data.prix_achat_unitaire);
    const valeurAchat = data.quantite * data.prix_achat_unitaire;

    const { data: result, error } = await supabase
        .from("investissements")
        .insert({
            user_id: user.id,
            nom: data.nom,
            ticker: data.ticker,
            type: data.type,
            plateforme: data.plateforme,
            quantite: data.quantite,
            prix_achat_unitaire: data.prix_achat_unitaire,
            prix_actuel: data.prix_actuel ?? data.prix_achat_unitaire,
            valeur_actuelle: valeurActuelle,
            plus_value: valeurActuelle - valeurAchat,
            date_achat: data.date_achat,
            notes: data.notes,
        })
        .select("id")
        .single();

    return { success: !error, id: result?.id };
}

// Mettre à jour un investissement
export async function updateInvestissement(id: string, data: {
    nom?: string;
    ticker?: string;
    type?: string;
    plateforme?: string;
    quantite?: number;
    prix_achat_unitaire?: number;
    prix_actuel?: number;
    notes?: string;
}): Promise<boolean> {
    const supabase = await createClient();

    // Recalculer les valeurs si quantité ou prix changent
    const updateData: Record<string, unknown> = { ...data };

    if (data.quantite !== undefined || data.prix_actuel !== undefined || data.prix_achat_unitaire !== undefined) {
        // Récupérer les données actuelles pour calculer
        const { data: current } = await supabase
            .from("investissements")
            .select("quantite, prix_achat_unitaire, prix_actuel")
            .eq("id", id)
            .single();

        if (current) {
            const quantite = data.quantite ?? current.quantite ?? 0;
            const prixAchat = data.prix_achat_unitaire ?? current.prix_achat_unitaire ?? 0;
            const prixActuel = data.prix_actuel ?? current.prix_actuel ?? prixAchat;

            updateData.valeur_actuelle = quantite * prixActuel;
            updateData.plus_value = (quantite * prixActuel) - (quantite * prixAchat);
        }
    }

    const { error } = await supabase
        .from("investissements")
        .update(updateData)
        .eq("id", id);

    return !error;
}

// Supprimer un investissement
export async function deleteInvestissement(id: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("investissements")
        .delete()
        .eq("id", id);

    return !error;
}

// Renforcer une position (ajouter à un investissement existant)
export async function addPosition(id: string, data: {
    quantite: number;
    prix: number;
}): Promise<boolean> {
    const supabase = await createClient();

    // Récupérer l'investissement actuel
    const { data: current } = await supabase
        .from("investissements")
        .select("quantite, prix_achat_unitaire, prix_actuel")
        .eq("id", id)
        .single();

    if (!current) return false;

    const oldQuantite = current.quantite ?? 0;
    const oldPrixAchat = current.prix_achat_unitaire ?? 0;
    const newQuantite = oldQuantite + data.quantite;

    // Calcul du nouveau prix moyen pondéré
    const newPrixMoyen = ((oldQuantite * oldPrixAchat) + (data.quantite * data.prix)) / newQuantite;
    const prixActuel = current.prix_actuel ?? newPrixMoyen;

    const valeurActuelle = newQuantite * prixActuel;
    const valeurAchat = newQuantite * newPrixMoyen;

    const { error } = await supabase
        .from("investissements")
        .update({
            quantite: newQuantite,
            prix_achat_unitaire: newPrixMoyen,
            valeur_actuelle: valeurActuelle,
            plus_value: valeurActuelle - valeurAchat,
        })
        .eq("id", id);

    return !error;
}

// Mettre à jour le prix actuel d'un investissement
export async function updatePrixActuel(id: string, prixActuel: number): Promise<boolean> {
    const supabase = await createClient();

    // Récupérer les données actuelles
    const { data: current } = await supabase
        .from("investissements")
        .select("quantite, prix_achat_unitaire")
        .eq("id", id)
        .single();

    if (!current) return false;

    const quantite = current.quantite ?? 0;
    const prixAchat = current.prix_achat_unitaire ?? 0;
    const valeurActuelle = quantite * prixActuel;
    const valeurAchat = quantite * prixAchat;

    const { error } = await supabase
        .from("investissements")
        .update({
            prix_actuel: prixActuel,
            valeur_actuelle: valeurActuelle,
            plus_value: valeurActuelle - valeurAchat,
        })
        .eq("id", id);

    return !error;
}
