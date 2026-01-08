"use client";

import { useState } from "react";
import {
    AlertTriangle,
    Bank,
    Calendar,
    Check,
    CreditCard01,
    Download01,
    Edit05,
    File06,
    Home02,
    Moon01,
    MusicNote01,
    Phone02,
    PiggyBank01,
    Plus,
    Settings01,
    Sun,
    Trash01,
    Tv03,
    Upload01,
    Wallet03,
    Zap,
} from "@untitledui/icons";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { TableRowActionsDropdown } from "@/components/application/table/table";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { cx } from "@/utils/cx";
import { createClient } from "@/lib/supabase/client";
import type {
    ParametresData,
    CategorieParametres,
    ChargeFixParametres,
    CompteParametres,
    TotauxParametres,
} from "@/lib/data/parametres";
import type { Profile } from "@/types/database.types";

interface ParametresClientProps {
    initialData: ParametresData;
}

// ============================================
// HELPERS
// ============================================

const formatCurrency = (amount: number): string => amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

const getCompteIcon = (type: string) => {
    switch (type) {
        case "courant":
            return Bank;
        case "epargne":
            return PiggyBank01;
        case "cash":
            return Wallet03;
        default:
            return CreditCard01;
    }
};

const getCompteColor = (type: string) => {
    switch (type) {
        case "courant":
            return "text-brand-600";
        case "epargne":
            return "text-success-600";
        case "cash":
            return "text-warning-600";
        default:
            return "text-gray-600";
    }
};

const getChargeIcon = (categorieNom: string) => {
    const iconMap: Record<string, typeof Home02> = {
        "Logement": Home02,
        "Streaming": Tv03,
        "Téléphone": Phone02,
        "Sport": Zap,
        "Musique": MusicNote01,
        "Énergie": Zap,
        "Internet": Settings01,
    };
    return iconMap[categorieNom] || Settings01;
};

const getChargeColor = (categorieNom: string) => {
    const colorMap: Record<string, string> = {
        "Logement": "text-brand-600",
        "Streaming": "text-red-500",
        "Téléphone": "text-gray-600",
        "Sport": "text-yellow-500",
        "Musique": "text-green-500",
        "Énergie": "text-amber-500",
        "Internet": "text-blue-600",
    };
    return colorMap[categorieNom] || "text-gray-500";
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function ParametresClient({ initialData }: ParametresClientProps) {
    const profile = initialData.profile;
    const categories = initialData.categories;
    const chargesFixes = initialData.chargesFixes;
    const comptes = initialData.comptes;
    const totaux = initialData.totaux;

    // États profil
    const [revenus, setRevenus] = useState((profile?.revenus_mensuels ?? 0).toString());
    const [objectifEpargne, setObjectifEpargne] = useState((profile?.objectif_epargne ?? 0).toString());
    const [modeGestion, setModeGestion] = useState<"semaine" | "mois">(
        (profile?.mode_gestion as "semaine" | "mois") ?? "semaine"
    );

    // États modales
    const [isEditRevenusOpen, setIsEditRevenusOpen] = useState(false);
    const [isEditEpargneOpen, setIsEditEpargneOpen] = useState(false);
    const [isEditModeOpen, setIsEditModeOpen] = useState(false);
    const [isEditCategoriesOpen, setIsEditCategoriesOpen] = useState(false);
    const [isAddChargeOpen, setIsAddChargeOpen] = useState(false);
    const [isAddCompteOpen, setIsAddCompteOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);

    // États sauvegarde
    const [isSaving, setIsSaving] = useState(false);

    // États formulaires
    const [newCharge, setNewCharge] = useState({
        nom: "",
        montant: "",
        jourPrelevement: "",
        categorie: "",
    });

    const [newCompte, setNewCompte] = useState({
        nom: "",
        banque: "",
        solde: "",
        type: "" as "courant" | "epargne" | "cash" | "",
    });

    // État catégories éditables
    const [editCategories, setEditCategories] = useState(
        categories.map((c) => ({ id: c.id, nom: c.nom, budget: c.budget, icone: c.icone }))
    );

    const [importFile, setImportFile] = useState<File | null>(null);
    const [importFormat, setImportFormat] = useState("");

    // Supabase client
    const supabase = createClient();

    // Handlers
    const handleSaveRevenus = async () => {
        if (!profile) return;
        setIsSaving(true);

        const { error } = await supabase
            .from("profiles")
            .update({ revenus_mensuels: parseFloat(revenus) || 0 })
            .eq("id", profile.id);

        setIsSaving(false);
        if (!error) {
            setIsEditRevenusOpen(false);
            window.location.reload();
        }
    };

    const handleSaveEpargne = async () => {
        if (!profile) return;
        setIsSaving(true);

        const { error } = await supabase
            .from("profiles")
            .update({ objectif_epargne: parseFloat(objectifEpargne) || 0 })
            .eq("id", profile.id);

        setIsSaving(false);
        if (!error) {
            setIsEditEpargneOpen(false);
            window.location.reload();
        }
    };

    const handleSaveMode = async () => {
        if (!profile) return;
        setIsSaving(true);

        const { error } = await supabase
            .from("profiles")
            .update({ mode_gestion: modeGestion })
            .eq("id", profile.id);

        setIsSaving(false);
        if (!error) {
            setIsEditModeOpen(false);
            window.location.reload();
        }
    };

    const handleSaveCategories = async () => {
        if (!profile) return;
        setIsSaving(true);

        for (const cat of editCategories) {
            await supabase
                .from("categories")
                .update({ nom: cat.nom, budget_mensuel: cat.budget, icone: cat.icone })
                .eq("id", cat.id);
        }

        setIsSaving(false);
        setIsEditCategoriesOpen(false);
        window.location.reload();
    };

    const handleAddCharge = async () => {
        if (!profile) return;
        setIsSaving(true);

        const { error } = await supabase.from("charges_fixes").insert({
            user_id: profile.id,
            nom: newCharge.nom,
            montant: parseFloat(newCharge.montant) || 0,
            jour_prelevement: parseInt(newCharge.jourPrelevement) || 1,
            icone: "💸",
        });

        setIsSaving(false);
        if (!error) {
            setIsAddChargeOpen(false);
            setNewCharge({ nom: "", montant: "", jourPrelevement: "", categorie: "" });
            window.location.reload();
        }
    };

    const handleDeleteCharge = async (id: string) => {
        const { error } = await supabase.from("charges_fixes").delete().eq("id", id);
        if (!error) {
            window.location.reload();
        }
    };

    const handleAddCompte = async () => {
        if (!profile) return;
        setIsSaving(true);

        const { error } = await supabase.from("comptes").insert({
            user_id: profile.id,
            nom: newCompte.nom,
            banque: newCompte.banque,
            solde: parseFloat(newCompte.solde) || 0,
            type: newCompte.type,
        });

        setIsSaving(false);
        if (!error) {
            setIsAddCompteOpen(false);
            setNewCompte({ nom: "", banque: "", solde: "", type: "" });
            window.location.reload();
        }
    };

    const handleDeleteCompte = async (id: string) => {
        const { error } = await supabase.from("comptes").delete().eq("id", id);
        if (!error) {
            window.location.reload();
        }
    };

    const handleImport = () => {
        console.log("Import:", importFile, importFormat);
        setIsImportOpen(false);
        setImportFile(null);
        setImportFormat("");
    };

    const handleExport = async () => {
        if (!profile) return;

        const [categoriesRes, chargesRes, comptesRes, transactionsRes] = await Promise.all([
            supabase.from("categories").select("*").eq("user_id", profile.id),
            supabase.from("charges_fixes").select("*").eq("user_id", profile.id),
            supabase.from("comptes").select("*").eq("user_id", profile.id),
            supabase.from("transactions").select("*").eq("user_id", profile.id),
        ]);

        const data = {
            profile: {
                revenus_mensuels: profile.revenus_mensuels,
                objectif_epargne: profile.objectif_epargne,
                mode_gestion: profile.mode_gestion,
            },
            categories: categoriesRes.data,
            chargesFixes: chargesRes.data,
            comptes: comptesRes.data,
            transactions: transactionsRes.data,
            exportDate: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `budget-export-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleReset = async () => {
        if (!profile) return;
        setIsSaving(true);

        // Supprimer toutes les données de l'utilisateur
        await Promise.all([
            supabase.from("transactions").delete().eq("user_id", profile.id),
            supabase.from("charges_fixes").delete().eq("user_id", profile.id),
            supabase.from("comptes").delete().eq("user_id", profile.id),
            supabase.from("categories").delete().eq("user_id", profile.id),
            supabase.from("investissements").delete().eq("user_id", profile.id),
            supabase.from("dettes").delete().eq("user_id", profile.id),
            supabase.from("historique_soldes").delete().eq("user_id", profile.id),
        ]);

        // Réinitialiser le profil
        await supabase
            .from("profiles")
            .update({
                revenus_mensuels: 0,
                objectif_epargne: 0,
                mode_gestion: "semaine",
            })
            .eq("id", profile.id);

        setIsSaving(false);
        setIsResetOpen(false);
        window.location.reload();
    };

    // Message si pas de données
    if (!profile) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-primary">
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-primary">Chargement...</h1>
                    <p className="text-tertiary">Récupération de vos données...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary">
            <div className="mx-auto max-w-container px-4 py-6 lg:px-8 lg:py-8">
                <div className="flex flex-col gap-8">
                    {/* SECTION 1: HEADER */}
                    <div className="flex flex-col gap-4 border-b border-secondary pb-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-xl font-semibold text-primary lg:text-display-xs">Paramètres</h1>
                            <p className="text-sm text-tertiary">Configurez votre application</p>
                        </div>
                    </div>

                    {/* SECTION 2: BUDGET */}
                    <div className="flex flex-col gap-6 rounded-xl bg-primary_alt p-6 shadow-xs ring-1 ring-secondary ring-inset">
                        <div className="flex items-center justify-between border-b border-secondary pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50">
                                    <PiggyBank01 className="h-5 w-5 text-brand-600" />
                                </div>
                                <p className="text-lg font-semibold text-primary">Budget</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5">
                            {/* Revenus mensuels */}
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-medium text-primary">Revenus mensuels</p>
                                    <p className="text-xs text-tertiary">Vos revenus nets mensuels</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-semibold text-primary">{formatCurrency(profile.revenus_mensuels ?? 0)}</span>
                                    <Button size="sm" color="secondary" iconLeading={Edit05} onClick={() => setIsEditRevenusOpen(true)}>
                                        Modifier
                                    </Button>
                                </div>
                            </div>

                            {/* Objectif épargne */}
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-medium text-primary">Objectif épargne</p>
                                    <p className="text-xs text-tertiary">Montant à épargner chaque mois</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-semibold text-finance-gain">{formatCurrency(profile.objectif_epargne ?? 0)}/mois</span>
                                    <Button size="sm" color="secondary" iconLeading={Edit05} onClick={() => setIsEditEpargneOpen(true)}>
                                        Modifier
                                    </Button>
                                </div>
                            </div>

                            {/* Mode de gestion */}
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-medium text-primary">Mode de gestion</p>
                                    <p className="text-xs text-tertiary">Suivez votre budget par semaine ou par mois</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge size="md" type="pill-color" color="brand">
                                        {profile.mode_gestion === "semaine" ? "Semaine" : "Mois"}
                                    </Badge>
                                    <Button size="sm" color="secondary" iconLeading={Edit05} onClick={() => setIsEditModeOpen(true)}>
                                        Modifier
                                    </Button>
                                </div>
                            </div>

                            {/* Catégories de dépenses */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-sm font-medium text-primary">Catégories de dépenses</p>
                                        <p className="text-xs text-tertiary">Vos enveloppes budgétaires</p>
                                    </div>
                                    <Button size="sm" color="secondary" iconLeading={Edit05} onClick={() => setIsEditCategoriesOpen(true)}>
                                        Modifier
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {categories.length > 0 ? (
                                        categories.map((cat) => (
                                            <Badge key={cat.id} size="md" type="pill-color" color="gray">
                                                {cat.icone} {cat.nom} ({formatCurrency(cat.budget)})
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-tertiary">Aucune catégorie configurée</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: CHARGES FIXES */}
                    <div className="flex flex-col gap-6 rounded-xl bg-primary_alt p-6 shadow-xs ring-1 ring-secondary ring-inset">
                        <div className="flex items-center justify-between border-b border-secondary pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-50">
                                    <Calendar className="h-5 w-5 text-error-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-primary">Charges fixes</p>
                                    <p className="text-sm text-tertiary">Total: {formatCurrency(totaux.totalChargesFixes)}/mois</p>
                                </div>
                            </div>
                        </div>

                        {/* Liste des charges fixes */}
                        <div className="flex flex-col gap-3">
                            {chargesFixes.length > 0 ? (
                                chargesFixes.map((charge) => {
                                    const Icon = charge.icone ? Settings01 : getChargeIcon(charge.categorieNom);
                                    const color = getChargeColor(charge.categorieNom);
                                    return (
                                        <div
                                            key={charge.id}
                                            className="flex items-center justify-between rounded-lg border border-secondary bg-primary p-3 transition-colors hover:bg-secondary"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                                                    {charge.icone ? (
                                                        <span className="text-lg">{charge.icone}</span>
                                                    ) : (
                                                        <Icon className={cx("h-4 w-4", color)} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-primary">{charge.nom}</p>
                                                    <p className="text-xs text-tertiary">{charge.categorieNom}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-primary">{formatCurrency(charge.montant)}</p>
                                                    <p className="text-xs text-tertiary">Jour {charge.jourPrelevement}</p>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    <ButtonUtility size="xs" color="tertiary" tooltip="Supprimer" icon={Trash01} onClick={() => handleDeleteCharge(charge.id)} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-tertiary">Aucune charge fixe configurée</p>
                            )}
                        </div>

                        <Button size="md" color="secondary" iconLeading={Plus} onClick={() => setIsAddChargeOpen(true)} className="self-start">
                            Ajouter une charge fixe
                        </Button>
                    </div>

                    {/* SECTION 4: COMPTES */}
                    <div className="flex flex-col gap-6 rounded-xl bg-primary_alt p-6 shadow-xs ring-1 ring-secondary ring-inset">
                        <div className="flex items-center justify-between border-b border-secondary pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-50">
                                    <Bank className="h-5 w-5 text-success-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-primary">Comptes</p>
                                    <p className="text-sm text-tertiary">Solde total: {formatCurrency(totaux.totalComptes)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Liste des comptes */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {comptes.length > 0 ? (
                                comptes.map((compte) => {
                                    const Icon = getCompteIcon(compte.type);
                                    const color = getCompteColor(compte.type);
                                    return (
                                        <div key={compte.id} className="flex flex-col gap-3 rounded-lg border border-secondary bg-primary p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                                        <Icon className={cx("h-5 w-5", color)} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-primary">{compte.nom}</p>
                                                        <p className="text-xs text-tertiary">{compte.banque}</p>
                                                    </div>
                                                </div>
                                                <ButtonUtility size="xs" color="tertiary" icon={Trash01} tooltip="Supprimer" onClick={() => handleDeleteCompte(compte.id)} />
                                            </div>
                                            <div className="flex items-end justify-between">
                                                <p className="text-lg font-semibold text-primary">{formatCurrency(compte.solde)}</p>
                                                <Badge
                                                    size="sm"
                                                    type="pill-color"
                                                    color={compte.type === "epargne" ? "success" : compte.type === "courant" ? "brand" : "warning"}
                                                >
                                                    {compte.type === "courant" ? "Courant" : compte.type === "epargne" ? "Épargne" : "Cash"}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="col-span-3 text-sm text-tertiary">Aucun compte configuré</p>
                            )}
                        </div>

                        <Button size="md" color="secondary" iconLeading={Plus} onClick={() => setIsAddCompteOpen(true)} className="self-start">
                            Ajouter un compte
                        </Button>
                    </div>

                    {/* SECTION 5: DONNÉES */}
                    <div className="flex flex-col gap-6 rounded-xl bg-primary_alt p-6 shadow-xs ring-1 ring-secondary ring-inset">
                        <div className="flex items-center justify-between border-b border-secondary pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                    <Download01 className="h-5 w-5 text-gray-600" />
                                </div>
                                <p className="text-lg font-semibold text-primary">Données</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-medium text-primary">Exporter mes données</p>
                                    <p className="text-xs text-tertiary">Téléchargez toutes vos données au format JSON</p>
                                </div>
                                <Button size="sm" color="secondary" iconLeading={Download01} onClick={handleExport}>
                                    Exporter (JSON)
                                </Button>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-medium text-primary">Importer des transactions</p>
                                    <p className="text-xs text-tertiary">Importez depuis Boursorama, BNP, N26...</p>
                                </div>
                                <Button size="sm" color="secondary" iconLeading={Upload01} onClick={() => setIsImportOpen(true)}>
                                    Importer (CSV)
                                </Button>
                            </div>

                            <div className="my-2 border-t border-secondary" />

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-medium text-error-600">Réinitialiser l'application</p>
                                    <p className="text-xs text-tertiary">Supprime toutes vos données. Action irréversible.</p>
                                </div>
                                <Button size="sm" color="primary-destructive" iconLeading={Trash01} onClick={() => setIsResetOpen(true)}>
                                    Réinitialiser
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 6: APPARENCE */}
                    <div className="flex flex-col gap-6 rounded-xl bg-primary_alt p-6 shadow-xs ring-1 ring-secondary ring-inset">
                        <div className="flex items-center justify-between border-b border-secondary pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
                                    <Sun className="h-5 w-5 text-purple-600" />
                                </div>
                                <p className="text-lg font-semibold text-primary">Apparence</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-medium text-primary">Thème</p>
                                    <p className="text-xs text-tertiary">Choisissez l'apparence de l'application</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" color="secondary" iconLeading={Sun}>
                                        Clair
                                    </Button>
                                    <Button size="sm" color="secondary" iconLeading={Moon01}>
                                        Sombre
                                    </Button>
                                    <Button size="sm" color="primary" iconLeading={Settings01}>
                                        Système
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALE: Modifier revenus */}
            <ModalOverlay isOpen={isEditRevenusOpen} onOpenChange={setIsEditRevenusOpen} isDismissable>
                <Modal className="max-w-sm">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-primary">Modifier les revenus</h2>
                                    <p className="text-sm text-tertiary">Entrez vos revenus nets mensuels</p>
                                </div>

                                <Input
                                    label="Revenus mensuels (€)"
                                    type="number"
                                    placeholder="0.00"
                                    value={revenus}
                                    onChange={(value) => setRevenus(value)}
                                    isRequired
                                />

                                <div className="flex justify-end gap-3 border-t border-secondary pt-6">
                                    <Button color="secondary" onClick={close}>
                                        Annuler
                                    </Button>
                                    <Button color="primary" onClick={handleSaveRevenus} isDisabled={isSaving}>
                                        {isSaving ? "..." : "Enregistrer"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>

            {/* MODALE: Modifier objectif épargne */}
            <ModalOverlay isOpen={isEditEpargneOpen} onOpenChange={setIsEditEpargneOpen} isDismissable>
                <Modal className="max-w-sm">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-primary">Objectif d'épargne</h2>
                                    <p className="text-sm text-tertiary">Combien souhaitez-vous épargner par mois ?</p>
                                </div>

                                <Input
                                    label="Montant mensuel (€)"
                                    type="number"
                                    placeholder="0.00"
                                    value={objectifEpargne}
                                    onChange={(value) => setObjectifEpargne(value)}
                                    isRequired
                                />

                                <div className="flex justify-end gap-3 border-t border-secondary pt-6">
                                    <Button color="secondary" onClick={close}>
                                        Annuler
                                    </Button>
                                    <Button color="primary" onClick={handleSaveEpargne} isDisabled={isSaving}>
                                        {isSaving ? "..." : "Enregistrer"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>

            {/* MODALE: Modifier mode gestion */}
            <ModalOverlay isOpen={isEditModeOpen} onOpenChange={setIsEditModeOpen} isDismissable>
                <Modal className="max-w-sm">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-primary">Mode de gestion</h2>
                                    <p className="text-sm text-tertiary">Comment voulez-vous suivre votre budget ?</p>
                                </div>

                                <Select
                                    label="Mode"
                                    selectedKey={modeGestion}
                                    onSelectionChange={(v) => setModeGestion(v as "semaine" | "mois")}
                                    items={[
                                        { id: "semaine", label: "Par semaine" },
                                        { id: "mois", label: "Par mois" },
                                    ]}
                                >
                                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                </Select>

                                <div className="flex justify-end gap-3 border-t border-secondary pt-6">
                                    <Button color="secondary" onClick={close}>
                                        Annuler
                                    </Button>
                                    <Button color="primary" onClick={handleSaveMode} isDisabled={isSaving}>
                                        {isSaving ? "..." : "Enregistrer"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>

            {/* MODALE: Modifier catégories */}
            <ModalOverlay isOpen={isEditCategoriesOpen} onOpenChange={setIsEditCategoriesOpen} isDismissable>
                <Modal className="max-w-md">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-primary">Catégories de dépenses</h2>
                                    <p className="text-sm text-tertiary">Modifiez vos enveloppes budgétaires</p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {editCategories.map((cat, index) => (
                                        <div key={cat.id} className="flex items-center gap-3">
                                            <span className="text-lg">{cat.icone}</span>
                                            <Input
                                                className="flex-1"
                                                placeholder="Nom"
                                                value={cat.nom}
                                                onChange={(v) => {
                                                    const newCats = [...editCategories];
                                                    newCats[index].nom = v;
                                                    setEditCategories(newCats);
                                                }}
                                            />
                                            <Input
                                                className="w-24"
                                                type="number"
                                                placeholder="Budget"
                                                value={cat.budget.toString()}
                                                onChange={(v) => {
                                                    const newCats = [...editCategories];
                                                    newCats[index].budget = parseFloat(v) || 0;
                                                    setEditCategories(newCats);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end gap-3 border-t border-secondary pt-6">
                                    <Button color="secondary" onClick={close}>
                                        Annuler
                                    </Button>
                                    <Button color="primary" onClick={handleSaveCategories} isDisabled={isSaving}>
                                        {isSaving ? "..." : "Enregistrer"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>

            {/* MODALE: Ajouter charge fixe */}
            <ModalOverlay isOpen={isAddChargeOpen} onOpenChange={setIsAddChargeOpen} isDismissable>
                <Modal className="max-w-md">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-primary">Ajouter une charge fixe</h2>
                                    <p className="text-sm text-tertiary">Abonnement ou prélèvement récurrent</p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <Input
                                        label="Nom"
                                        placeholder="Ex: Netflix, Électricité..."
                                        value={newCharge.nom}
                                        onChange={(value) => setNewCharge({ ...newCharge, nom: value })}
                                        isRequired
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Montant (€)"
                                            type="number"
                                            placeholder="0.00"
                                            value={newCharge.montant}
                                            onChange={(value) => setNewCharge({ ...newCharge, montant: value })}
                                            isRequired
                                        />
                                        <Input
                                            label="Jour de prélèvement"
                                            type="number"
                                            placeholder="1-31"
                                            value={newCharge.jourPrelevement}
                                            onChange={(value) => setNewCharge({ ...newCharge, jourPrelevement: value })}
                                            isRequired
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 border-t border-secondary pt-6">
                                    <Button color="secondary" onClick={close}>
                                        Annuler
                                    </Button>
                                    <Button
                                        color="primary"
                                        onClick={handleAddCharge}
                                        isDisabled={!newCharge.nom || !newCharge.montant || !newCharge.jourPrelevement || isSaving}
                                    >
                                        {isSaving ? "..." : "Ajouter"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>

            {/* MODALE: Ajouter compte */}
            <ModalOverlay isOpen={isAddCompteOpen} onOpenChange={setIsAddCompteOpen} isDismissable>
                <Modal className="max-w-md">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-primary">Ajouter un compte</h2>
                                    <p className="text-sm text-tertiary">Ajoutez un nouveau compte bancaire</p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <Input
                                        label="Nom du compte"
                                        placeholder="Ex: Compte courant principal"
                                        value={newCompte.nom}
                                        onChange={(value) => setNewCompte({ ...newCompte, nom: value })}
                                        isRequired
                                    />

                                    <Input
                                        label="Banque"
                                        placeholder="Ex: Boursorama, BNP..."
                                        value={newCompte.banque}
                                        onChange={(value) => setNewCompte({ ...newCompte, banque: value })}
                                        isRequired
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Solde initial (€)"
                                            type="number"
                                            placeholder="0.00"
                                            value={newCompte.solde}
                                            onChange={(value) => setNewCompte({ ...newCompte, solde: value })}
                                            isRequired
                                        />
                                        <Select
                                            label="Type de compte"
                                            selectedKey={newCompte.type}
                                            onSelectionChange={(v) => setNewCompte({ ...newCompte, type: v as "courant" | "epargne" | "cash" })}
                                            items={[
                                                { id: "courant", label: "Compte courant" },
                                                { id: "epargne", label: "Compte épargne" },
                                                { id: "cash", label: "Cash / Espèces" },
                                            ]}
                                            isRequired
                                        >
                                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 border-t border-secondary pt-6">
                                    <Button color="secondary" onClick={close}>
                                        Annuler
                                    </Button>
                                    <Button
                                        color="primary"
                                        onClick={handleAddCompte}
                                        isDisabled={!newCompte.nom || !newCompte.banque || !newCompte.solde || !newCompte.type || isSaving}
                                    >
                                        {isSaving ? "..." : "Créer le compte"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>

            {/* MODALE: Import CSV */}
            <ModalOverlay isOpen={isImportOpen} onOpenChange={setIsImportOpen} isDismissable>
                <Modal className="max-w-lg">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-primary">Importer des transactions</h2>
                                    <p className="text-sm text-tertiary">Importez vos relevés bancaires au format CSV</p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <Select
                                        label="Format de fichier"
                                        selectedKey={importFormat}
                                        onSelectionChange={(v) => setImportFormat(v as string)}
                                        items={[
                                            { id: "boursorama", label: "Boursorama" },
                                            { id: "bnp", label: "BNP Paribas" },
                                            { id: "n26", label: "N26" },
                                            { id: "revolut", label: "Revolut" },
                                            { id: "ca", label: "Crédit Agricole" },
                                            { id: "sg", label: "Société Générale" },
                                            { id: "autre", label: "Autre (CSV standard)" },
                                        ]}
                                        isRequired
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-primary">Fichier CSV</label>
                                        <div className="relative flex items-center justify-center rounded-lg border-2 border-dashed border-secondary bg-secondary p-8 transition-colors hover:border-brand">
                                            <div className="flex flex-col items-center gap-2 text-center">
                                                <File06 className="h-8 w-8 text-tertiary" />
                                                <p className="text-sm text-tertiary">
                                                    {importFile ? importFile.name : "Glissez votre fichier ici ou cliquez pour parcourir"}
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                accept=".csv"
                                                className="absolute inset-0 cursor-pointer opacity-0"
                                                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                            />
                                        </div>
                                    </div>

                                    {importFile && (
                                        <div className="rounded-lg bg-success-50 p-4">
                                            <div className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-success-600" />
                                                <span className="text-sm font-medium text-success-700">Fichier prêt à importer</span>
                                            </div>
                                            <p className="mt-1 text-xs text-success-600">{importFile.name}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 border-t border-secondary pt-6">
                                    <Button color="secondary" onClick={close}>
                                        Annuler
                                    </Button>
                                    <Button color="primary" onClick={handleImport} isDisabled={!importFile || !importFormat}>
                                        Importer
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>

            {/* MODALE: Réinitialiser */}
            <ModalOverlay isOpen={isResetOpen} onOpenChange={setIsResetOpen} isDismissable>
                <Modal className="max-w-sm">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-100">
                                        <AlertTriangle className="h-6 w-6 text-error-600" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-lg font-semibold text-primary">Réinitialiser l'application ?</h2>
                                        <p className="text-sm text-tertiary">
                                            Cette action supprimera toutes vos données : comptes, transactions, budgets et paramètres. Cette action est irréversible.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button color="secondary" onClick={close} className="flex-1">
                                        Annuler
                                    </Button>
                                    <Button color="primary-destructive" onClick={handleReset} className="flex-1" isDisabled={isSaving}>
                                        {isSaving ? "..." : "Réinitialiser"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </div>
    );
}
