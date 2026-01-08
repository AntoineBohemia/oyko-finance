import { createClient } from "@/lib/supabase/server";
import type {
    Profile,
    ChargeFix as ChargeFixeDB,
    Compte as CompteDB,
    Categorie as CategorieDB,
} from "@/types/database.types";

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

// Helpers pour calculs
function getCoutMensuel(montant: number, frequence: string): number {
    switch (frequence) {
        case "annuel":
            return montant / 12;
        case "trimestriel":
            return montant / 3;
        case "hebdo":
            return montant * 4.33;
        default:
            return montant;
    }
}

function getCoutAnnuel(montant: number, frequence: string): number {
    switch (frequence) {
        case "annuel":
            return montant;
        case "trimestriel":
            return montant * 4;
        case "hebdo":
            return montant * 52;
        default:
            return montant * 12;
    }
}

function getProchainPrelevement(jourPrelevement: number): Date {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();

    // Si le jour de prelevement est passe ce mois-ci, passer au mois suivant
    if (currentDay > jourPrelevement) {
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        const daysInMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
        const day = Math.min(jourPrelevement, daysInMonth);
        return new Date(nextYear, nextMonth, day);
    }

    // Sinon, c'est ce mois-ci
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const day = Math.min(jourPrelevement, daysInMonth);
    return new Date(currentYear, currentMonth, day);
}

// Couleurs par categorie
const CATEGORIE_COLORS: Record<string, string> = {
    "Streaming": "#7c3aed",
    "Transport": "#06b6d4",
    "Telecom": "#10b981",
    "Sport": "#f59e0b",
    "Musique": "#ec4899",
    "Presse": "#6366f1",
    "Cloud": "#14b8a6",
    "Logement": "#ef4444",
    "Assurance": "#8b5cf6",
    "Autre": "#6b7280",
};

// Recuperer toutes les donnees des charges fixes
export async function getChargesFixesData(): Promise<ChargesFixesData> {
    const supabase = await createClient();

    // Recuperer l'utilisateur connecte
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            profile: null,
            chargesFixes: [],
            comptes: [],
            categories: [],
            timeline: [],
            repartitionCategories: [],
            totaux: {
                nombreActifs: 0,
                nombreInactifs: 0,
                totalMensuel: 0,
                totalAnnuel: 0,
                prochainPrelevement: null,
            },
        };
    }

    // Recuperer toutes les donnees en parallele
    const [
        profileResult,
        chargesFixesResult,
        comptesResult,
        categoriesResult,
    ] = await Promise.all([
        // Profile
        supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single(),

        // Charges fixes avec categories et comptes
        supabase
            .from("charges_fixes")
            .select(`
                *,
                categories (id, nom, icone, couleur),
                comptes (id, nom)
            `)
            .eq("user_id", user.id)
            .order("jour_prelevement", { ascending: true }),

        // Comptes
        supabase
            .from("comptes")
            .select("*")
            .eq("user_id", user.id)
            .eq("est_actif", true)
            .order("ordre", { ascending: true }),

        // Categories de type depense
        supabase
            .from("categories")
            .select("*")
            .eq("user_id", user.id)
            .eq("est_actif", true)
            .order("ordre", { ascending: true }),
    ]);

    // Transformer les charges fixes
    const chargesFixes: ChargeFixePortfolio[] = (chargesFixesResult.data ?? []).map((cf) => {
        const jourPrelevement = cf.jour_prelevement ?? 1;
        const frequence = ((cf.frequence ?? "mensuel") as "hebdo" | "mensuel" | "trimestriel" | "annuel");
        const montant = cf.montant ?? 0;
        const categories = cf.categories as { id: string; nom: string; icone: string | null; couleur: string | null } | null;
        const comptes = cf.comptes as { id: string; nom: string } | null;

        return {
            id: cf.id,
            nom: cf.nom,
            montant,
            frequence,
            jourPrelevement,
            prochainPrelevement: getProchainPrelevement(jourPrelevement),
            categorieId: cf.categorie_id,
            categorieNom: categories?.nom ?? "Autre",
            compteId: cf.compte_id,
            compteNom: comptes?.nom ?? "",
            estActif: cf.est_actif ?? true,
            dateDebut: cf.date_debut ? new Date(cf.date_debut) : null,
            dateFin: cf.date_fin ? new Date(cf.date_fin) : null,
            notes: cf.notes,
            icone: cf.icone ?? categories?.icone ?? null,
            couleur: cf.couleur ?? categories?.couleur ?? null,
            coutMensuel: getCoutMensuel(montant, frequence),
            coutAnnuel: getCoutAnnuel(montant, frequence),
        };
    });

    // Filtrer les charges actives
    const chargesActives = chargesFixes.filter((cf) => cf.estActif);

    // Calculer les totaux
    const totalMensuel = chargesActives.reduce((acc, cf) => acc + cf.coutMensuel, 0);
    const totalAnnuel = chargesActives.reduce((acc, cf) => acc + cf.coutAnnuel, 0);

    // Timeline des 10 prochains prelevements
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const timeline = chargesActives
        .filter((cf) => cf.prochainPrelevement >= today)
        .sort((a, b) => a.prochainPrelevement.getTime() - b.prochainPrelevement.getTime())
        .slice(0, 10);

    // Prochain prelevement
    const prochainPrelevement = timeline[0] || null;

    // Repartition par categorie
    const categorieGroups = chargesActives.reduce((acc, cf) => {
        const cat = cf.categorieNom || "Autre";
        acc[cat] = (acc[cat] || 0) + cf.coutMensuel;
        return acc;
    }, {} as Record<string, number>);

    const repartitionCategories: RepartitionCategorie[] = Object.entries(categorieGroups)
        .map(([name, value]) => ({
            name,
            value,
            color: CATEGORIE_COLORS[name] || CATEGORIE_COLORS["Autre"],
        }))
        .sort((a, b) => b.value - a.value);

    const totaux: TotauxChargesFixes = {
        nombreActifs: chargesActives.length,
        nombreInactifs: chargesFixes.filter((cf) => !cf.estActif).length,
        totalMensuel,
        totalAnnuel,
        prochainPrelevement,
    };

    return {
        profile: profileResult.data,
        chargesFixes,
        comptes: comptesResult.data ?? [],
        categories: categoriesResult.data ?? [],
        timeline,
        repartitionCategories,
        totaux,
    };
}

// Ajouter une charge fixe
export async function addChargeFix(data: {
    nom: string;
    montant: number;
    frequence: string;
    jour_prelevement: number;
    categorie_id?: string;
    compte_id?: string;
    notes?: string;
}): Promise<{ success: boolean; id?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false };

    const { data: result, error } = await supabase
        .from("charges_fixes")
        .insert({
            user_id: user.id,
            nom: data.nom,
            montant: data.montant,
            frequence: data.frequence,
            jour_prelevement: data.jour_prelevement,
            categorie_id: data.categorie_id || null,
            compte_id: data.compte_id || null,
            notes: data.notes || null,
            est_actif: true,
        })
        .select("id")
        .single();

    return { success: !error, id: result?.id };
}

// Mettre a jour une charge fixe
export async function updateChargeFix(id: string, data: {
    nom?: string;
    montant?: number;
    frequence?: string;
    jour_prelevement?: number;
    categorie_id?: string;
    compte_id?: string;
    est_actif?: boolean;
    notes?: string;
}): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("charges_fixes")
        .update(data)
        .eq("id", id);

    return !error;
}

// Supprimer une charge fixe
export async function deleteChargeFix(id: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("charges_fixes")
        .delete()
        .eq("id", id);

    return !error;
}

// Activer/Desactiver une charge fixe
export async function toggleChargeFixActive(id: string, estActif: boolean): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("charges_fixes")
        .update({ est_actif: estActif })
        .eq("id", id);

    return !error;
}
