import { createClient } from "@/lib/supabase/server";
import type { Profile, Compte } from "@/types/database.types";

// Types pour les données des dettes
export type TypeDette = "etudiant" | "immobilier" | "conso" | "auto" | "personnel" | "autre";

export interface DetteData {
    id: string;
    nom: string;
    type: TypeDette;
    capitalInitial: number;
    capitalRestant: number;
    tauxAnnuel: number;
    mensualite: number;
    jourPrelevement: number;
    dateDebut: Date | null;
    dateFin: Date | null;
    prochainPrelevement: Date;
    compteId: string | null;
    compteNom: string | null;
    preteur: string;
    imageUrl: string | null;
    notes: string | null;
}

export interface DettesPageData {
    profile: Profile | null;
    dettes: DetteData[];
    comptes: { id: string; nom: string }[];
}

// Calculer la prochaine date de prélèvement
function getProchainPrelevement(jourPrelevement: number): Date {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), jourPrelevement);

    if (thisMonth > today) {
        return thisMonth;
    }
    // Sinon, mois prochain
    return new Date(today.getFullYear(), today.getMonth() + 1, jourPrelevement);
}

// Récupérer toutes les données pour la page dettes
export async function getDettesData(): Promise<DettesPageData> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            profile: null,
            dettes: [],
            comptes: [],
        };
    }

    const [profileResult, dettesResult, comptesResult] = await Promise.all([
        supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single(),

        supabase
            .from("dettes")
            .select("*, comptes(*)")
            .eq("user_id", user.id)
            .order("capital_restant", { ascending: false }),

        supabase
            .from("comptes")
            .select("id, nom")
            .eq("user_id", user.id)
            .eq("est_actif", true)
            .order("ordre"),
    ]);

    const profile = profileResult.data;
    const comptes = (comptesResult.data ?? []).map((c) => ({
        id: c.id,
        nom: c.nom,
    }));

    const dettes: DetteData[] = (dettesResult.data ?? []).map((d) => {
        const compte = d.comptes as Compte | null;
        const jourPrel = d.jour_prelevement ?? 5;

        return {
            id: d.id,
            nom: d.nom,
            type: d.type as TypeDette,
            capitalInitial: d.capital_initial,
            capitalRestant: d.capital_restant,
            tauxAnnuel: d.taux_interet ?? 0,
            mensualite: d.mensualite,
            jourPrelevement: jourPrel,
            dateDebut: d.date_debut ? new Date(d.date_debut) : null,
            dateFin: d.date_fin ? new Date(d.date_fin) : null,
            prochainPrelevement: getProchainPrelevement(jourPrel),
            compteId: d.compte_id,
            compteNom: compte?.nom ?? null,
            preteur: d.preteur ?? "",
            imageUrl: d.image_url,
            notes: d.notes,
        };
    });

    return {
        profile,
        dettes,
        comptes,
    };
}

// Ajouter une nouvelle dette
export async function addDette(data: {
    nom: string;
    type: TypeDette;
    capitalInitial: number;
    capitalRestant: number;
    tauxAnnuel: number;
    mensualite: number;
    jourPrelevement: number;
    dateFin: string;
    preteur: string;
    compteId: string;
    notes?: string;
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Non authentifié" };
    }

    const { error } = await supabase
        .from("dettes")
        .insert({
            user_id: user.id,
            nom: data.nom,
            type: data.type,
            capital_initial: data.capitalInitial,
            capital_restant: data.capitalRestant,
            taux_interet: data.tauxAnnuel,
            mensualite: data.mensualite,
            jour_prelevement: data.jourPrelevement,
            date_debut: new Date().toISOString().split("T")[0],
            date_fin: data.dateFin,
            preteur: data.preteur,
            compte_id: data.compteId || null,
            notes: data.notes || null,
        });

    if (error) {
        console.error("Erreur ajout dette:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Mettre à jour une dette
export async function updateDette(
    detteId: string,
    data: Partial<{
        nom: string;
        capitalRestant: number;
        mensualite: number;
        notes: string;
    }>
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Non authentifié" };
    }

    const updateData: Record<string, unknown> = {};
    if (data.nom !== undefined) updateData.nom = data.nom;
    if (data.capitalRestant !== undefined) updateData.capital_restant = data.capitalRestant;
    if (data.mensualite !== undefined) updateData.mensualite = data.mensualite;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const { error } = await supabase
        .from("dettes")
        .update(updateData)
        .eq("id", detteId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Erreur mise à jour dette:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Supprimer une dette
export async function deleteDette(detteId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Non authentifié" };
    }

    const { error } = await supabase
        .from("dettes")
        .delete()
        .eq("id", detteId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Erreur suppression dette:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
