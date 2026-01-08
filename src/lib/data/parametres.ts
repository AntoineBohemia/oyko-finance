import { createClient } from "@/lib/supabase/server";
import type {
    Profile,
    Compte as CompteDB,
    Categorie as CategorieDB,
} from "@/types/database.types";

// Types pour les données des paramètres
export interface ParametresData {
    profile: Profile | null;
    categories: CategorieParametres[];
    chargesFixes: ChargeFixParametres[];
    comptes: CompteParametres[];
    totaux: TotauxParametres;
}

export interface CategorieParametres {
    id: string;
    nom: string;
    budget: number;
    icone: string;
    couleur: string;
}

export interface ChargeFixParametres {
    id: string;
    nom: string;
    montant: number;
    jourPrelevement: number;
    icone: string;
    couleur: string;
    categorieNom: string;
    actif: boolean;
}

export interface CompteParametres {
    id: string;
    nom: string;
    banque: string;
    solde: number;
    type: "courant" | "epargne" | "cash" | "investissement";
}

export interface TotauxParametres {
    totalChargesFixes: number;
    totalComptes: number;
}

// Récupérer toutes les données des paramètres
export async function getParametresData(): Promise<ParametresData> {
    const supabase = await createClient();

    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            profile: null,
            categories: [],
            chargesFixes: [],
            comptes: [],
            totaux: {
                totalChargesFixes: 0,
                totalComptes: 0,
            },
        };
    }

    // Récupérer toutes les données en parallèle
    const [
        profileResult,
        categoriesResult,
        chargesFixesResult,
        comptesResult,
    ] = await Promise.all([
        // Profile
        supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single(),

        // Catégories variables (dépenses, non fixes)
        supabase
            .from("categories")
            .select("*")
            .eq("user_id", user.id)
            .eq("type", "depense")
            .eq("est_fixe", false)
            .eq("est_actif", true)
            .order("ordre"),

        // Charges fixes avec catégorie
        supabase
            .from("charges_fixes")
            .select("*, categories(nom)")
            .eq("user_id", user.id)
            .order("jour_prelevement"),

        // Comptes
        supabase
            .from("comptes")
            .select("*")
            .eq("user_id", user.id)
            .eq("est_actif", true)
            .order("ordre"),
    ]);

    // Transformer les catégories
    const categories: CategorieParametres[] = (categoriesResult.data ?? []).map((cat) => ({
        id: cat.id,
        nom: cat.nom,
        budget: cat.budget_mensuel ?? 0,
        icone: cat.icone ?? "📦",
        couleur: cat.couleur ?? "#6b7280",
    }));

    // Transformer les charges fixes
    const chargesFixes: ChargeFixParametres[] = (chargesFixesResult.data ?? []).map((charge) => {
        const categorieData = charge.categories as { nom: string } | null;
        return {
            id: charge.id,
            nom: charge.nom,
            montant: charge.montant,
            jourPrelevement: charge.jour_prelevement ?? 1,
            icone: charge.icone ?? "💸",
            couleur: charge.couleur ?? "#6b7280",
            categorieNom: categorieData?.nom ?? "Autre",
            actif: charge.est_actif ?? true,
        };
    });

    // Transformer les comptes
    const comptes: CompteParametres[] = (comptesResult.data ?? []).map((c) => ({
        id: c.id,
        nom: c.nom,
        banque: c.banque ?? "",
        solde: c.solde ?? 0,
        type: c.type as "courant" | "epargne" | "cash" | "investissement",
    }));

    // Calculer les totaux
    const totalChargesFixes = chargesFixes
        .filter((c) => c.actif)
        .reduce((acc, c) => acc + c.montant, 0);

    const totalComptes = comptes.reduce((acc, c) => acc + c.solde, 0);

    return {
        profile: profileResult.data,
        categories,
        chargesFixes,
        comptes,
        totaux: {
            totalChargesFixes,
            totalComptes,
        },
    };
}

// Mettre à jour le profil
export async function updateProfile(data: {
    revenus_mensuels?: number;
    objectif_epargne?: number;
    mode_gestion?: "semaine" | "mois";
}): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", user.id);

    return !error;
}

// Ajouter une charge fixe
export async function addChargeFix(data: {
    nom: string;
    montant: number;
    jour_prelevement: number;
    categorie_id?: string;
    icone?: string;
}): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase.from("charges_fixes").insert({
        user_id: user.id,
        ...data,
    });

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

// Ajouter un compte
export async function addCompte(data: {
    nom: string;
    banque: string;
    solde: number;
    type: "courant" | "epargne" | "cash";
}): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase.from("comptes").insert({
        user_id: user.id,
        ...data,
    });

    return !error;
}

// Supprimer un compte
export async function deleteCompte(id: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("comptes")
        .delete()
        .eq("id", id);

    return !error;
}

// Mettre à jour une catégorie
export async function updateCategorie(id: string, data: {
    nom?: string;
    budget_mensuel?: number;
    icone?: string;
}): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("categories")
        .update(data)
        .eq("id", id);

    return !error;
}

// Ajouter une catégorie
export async function addCategorie(data: {
    nom: string;
    budget_mensuel: number;
    icone: string;
}): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase.from("categories").insert({
        user_id: user.id,
        type: "depense",
        est_fixe: false,
        ...data,
    });

    return !error;
}

// Supprimer une catégorie
export async function deleteCategorie(id: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

    return !error;
}
