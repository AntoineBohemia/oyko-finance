"use client";

import { useState } from "react";
import {
    AlertTriangle,
    Bank,
    Calendar,
    Check,
    ChevronDown,
    CreditCard01,
    Download01,
    Edit05,
    File06,
    Home02,
    Moon01,
    MusicNote01,
    Phone01,
    PiggyBank01,
    Plus,
    Settings01,
    ShoppingBag01,
    Phone02,
    Sun,
    Trash01,
    Tv03,
    Upload01,
    Wallet03,
    Zap,
} from "@untitledui/icons";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Table, TableRowActionsDropdown } from "@/components/application/table/table";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { cx } from "@/utils/cx";

// ============================================
// TYPES
// ============================================

interface ChargeFix {
    id: string;
    nom: string;
    montant: number;
    jourPrelevement: number;
    categorie: string;
    icon: React.ElementType;
    color: string;
    actif: boolean;
}

interface Compte {
    id: string;
    nom: string;
    banque: string;
    solde: number;
    type: "courant" | "epargne" | "cash";
}

interface Categorie {
    id: string;
    nom: string;
    budget: number;
    icon: string;
    color: string;
}

// ============================================
// DONNÉES
// ============================================

const USER_PROFILE = {
    revenusMensuels: 1800,
    objectifEpargne: 200,
    modeGestion: "semaine" as "semaine" | "mois",
};

const CATEGORIES: Categorie[] = [
    { id: "cat-1", nom: "Alimentation", budget: 400, icon: "🍔", color: "text-orange-500" },
    { id: "cat-2", nom: "Transport", budget: 100, icon: "🚇", color: "text-blue-500" },
    { id: "cat-3", nom: "Loisirs", budget: 150, icon: "🎮", color: "text-purple-500" },
    { id: "cat-4", nom: "Shopping", budget: 100, icon: "🛍️", color: "text-pink-500" },
    { id: "cat-5", nom: "Santé", budget: 50, icon: "💊", color: "text-red-500" },
];

const CHARGES_FIXES: ChargeFix[] = [
    { id: "charge-1", nom: "Loyer", montant: 650, jourPrelevement: 3, categorie: "Logement", icon: Home02, color: "text-brand-600", actif: true },
    { id: "charge-2", nom: "Netflix", montant: 13.49, jourPrelevement: 15, categorie: "Streaming", icon: Tv03, color: "text-red-500", actif: true },
    { id: "charge-3", nom: "Free Mobile", montant: 12.99, jourPrelevement: 20, categorie: "Téléphone", icon: Phone02, color: "text-gray-600", actif: true },
    { id: "charge-4", nom: "Basic Fit", montant: 29.99, jourPrelevement: 1, categorie: "Sport", icon: Zap, color: "text-yellow-500", actif: true },
    { id: "charge-5", nom: "Spotify", montant: 5.99, jourPrelevement: 4, categorie: "Musique", icon: MusicNote01, color: "text-green-500", actif: true },
    { id: "charge-6", nom: "Électricité", montant: 85, jourPrelevement: 10, categorie: "Énergie", icon: Zap, color: "text-amber-500", actif: true },
    { id: "charge-7", nom: "Internet", montant: 29.99, jourPrelevement: 25, categorie: "Internet", icon: Settings01, color: "text-blue-600", actif: true },
];

const COMPTES: Compte[] = [
    { id: "cpt-1", nom: "Compte courant", banque: "Boursorama", solde: 1847.32, type: "courant" },
    { id: "cpt-2", nom: "Livret A", banque: "Boursorama", solde: 5200.0, type: "epargne" },
    { id: "cpt-3", nom: "Cash", banque: "Espèces", solde: 85.0, type: "cash" },
];

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

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function ParametresPage() {
    // États profil
    const [revenus, setRevenus] = useState(USER_PROFILE.revenusMensuels.toString());
    const [objectifEpargne, setObjectifEpargne] = useState(USER_PROFILE.objectifEpargne.toString());
    const [modeGestion, setModeGestion] = useState<"semaine" | "mois">(USER_PROFILE.modeGestion);

    // États modales
    const [isEditRevenusOpen, setIsEditRevenusOpen] = useState(false);
    const [isEditEpargneOpen, setIsEditEpargneOpen] = useState(false);
    const [isEditModeOpen, setIsEditModeOpen] = useState(false);
    const [isEditCategoriesOpen, setIsEditCategoriesOpen] = useState(false);
    const [isAddChargeOpen, setIsAddChargeOpen] = useState(false);
    const [isAddCompteOpen, setIsAddCompteOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);

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

    const [importFile, setImportFile] = useState<File | null>(null);
    const [importFormat, setImportFormat] = useState("");

    // Calculs
    const totalChargesFixes = CHARGES_FIXES.filter((c) => c.actif).reduce((acc, c) => acc + c.montant, 0);
    const totalComptes = COMPTES.reduce((acc, c) => acc + c.solde, 0);

    // Handlers
    const handleSaveRevenus = () => {
        console.log("Revenus mis à jour:", revenus);
        setIsEditRevenusOpen(false);
    };

    const handleSaveEpargne = () => {
        console.log("Objectif épargne mis à jour:", objectifEpargne);
        setIsEditEpargneOpen(false);
    };

    const handleSaveMode = () => {
        console.log("Mode gestion mis à jour:", modeGestion);
        setIsEditModeOpen(false);
    };

    const handleAddCharge = () => {
        console.log("Nouvelle charge:", newCharge);
        setIsAddChargeOpen(false);
        setNewCharge({ nom: "", montant: "", jourPrelevement: "", categorie: "" });
    };

    const handleAddCompte = () => {
        console.log("Nouveau compte:", newCompte);
        setIsAddCompteOpen(false);
        setNewCompte({ nom: "", banque: "", solde: "", type: "" });
    };

    const handleImport = () => {
        console.log("Import:", importFile, importFormat);
        setIsImportOpen(false);
        setImportFile(null);
        setImportFormat("");
    };

    const handleExport = () => {
        const data = {
            profile: USER_PROFILE,
            categories: CATEGORIES,
            chargesFixes: CHARGES_FIXES,
            comptes: COMPTES,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "budget-data.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        console.log("Réinitialisation de l'application");
        setIsResetOpen(false);
    };

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
                                    <span className="text-lg font-semibold text-primary">{formatCurrency(parseFloat(revenus))}</span>
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
                                    <span className="text-lg font-semibold text-finance-gain">{formatCurrency(parseFloat(objectifEpargne))}/mois</span>
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
                                        {modeGestion === "semaine" ? "Semaine" : "Mois"}
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
                                    {CATEGORIES.map((cat) => (
                                        <Badge key={cat.id} size="md" type="pill-color" color="gray">
                                            {cat.icon} {cat.nom} ({formatCurrency(cat.budget)})
                                        </Badge>
                                    ))}
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
                                    <p className="text-sm text-tertiary">Total: {formatCurrency(totalChargesFixes)}/mois</p>
                                </div>
                            </div>
                        </div>

                        {/* Liste des charges fixes */}
                        <div className="flex flex-col gap-3">
                            {CHARGES_FIXES.map((charge) => {
                                const Icon = charge.icon;
                                return (
                                    <div
                                        key={charge.id}
                                        className="flex items-center justify-between rounded-lg border border-secondary bg-primary p-3 transition-colors hover:bg-secondary"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cx("flex h-9 w-9 items-center justify-center rounded-full bg-gray-100")}>
                                                <Icon className={cx("h-4 w-4", charge.color)} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-primary">{charge.nom}</p>
                                                <p className="text-xs text-tertiary">{charge.categorie}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-primary">{formatCurrency(charge.montant)}</p>
                                                <p className="text-xs text-tertiary">Jour {charge.jourPrelevement}</p>
                                            </div>
                                            <div className="flex gap-0.5">
                                                <ButtonUtility size="xs" color="tertiary" tooltip="Modifier" icon={Edit05} />
                                                <ButtonUtility size="xs" color="tertiary" tooltip="Supprimer" icon={Trash01} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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
                                    <p className="text-sm text-tertiary">Solde total: {formatCurrency(totalComptes)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Liste des comptes */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {COMPTES.map((compte) => {
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
                                            <TableRowActionsDropdown />
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
                            })}
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
                                    <Button color="primary" onClick={handleSaveRevenus}>
                                        Enregistrer
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
                                    <Button color="primary" onClick={handleSaveEpargne}>
                                        Enregistrer
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
                                    <Button color="primary" onClick={handleSaveMode}>
                                        Enregistrer
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
                                    {CATEGORIES.map((cat) => (
                                        <div key={cat.id} className="flex items-center gap-3">
                                            <span className="text-lg">{cat.icon}</span>
                                            <Input
                                                className="flex-1"
                                                placeholder="Nom"
                                                value={cat.nom}
                                                onChange={() => {}}
                                            />
                                            <Input
                                                className="w-24"
                                                type="number"
                                                placeholder="Budget"
                                                value={cat.budget.toString()}
                                                onChange={() => {}}
                                            />
                                            <ButtonUtility size="sm" color="tertiary" icon={Trash01} tooltip="Supprimer" />
                                        </div>
                                    ))}
                                </div>

                                <Button size="sm" color="link-color" iconLeading={Plus} className="self-start">
                                    Ajouter une catégorie
                                </Button>

                                <div className="flex justify-end gap-3 border-t border-secondary pt-6">
                                    <Button color="secondary" onClick={close}>
                                        Annuler
                                    </Button>
                                    <Button color="primary" onClick={close}>
                                        Enregistrer
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

                                    <Select
                                        label="Catégorie"
                                        selectedKey={newCharge.categorie}
                                        onSelectionChange={(v) => setNewCharge({ ...newCharge, categorie: v as string })}
                                        items={[
                                            { id: "Logement", label: "Logement" },
                                            { id: "Streaming", label: "Streaming" },
                                            { id: "Téléphone", label: "Téléphone" },
                                            { id: "Sport", label: "Sport" },
                                            { id: "Musique", label: "Musique" },
                                            { id: "Énergie", label: "Énergie" },
                                            { id: "Internet", label: "Internet" },
                                            { id: "Assurance", label: "Assurance" },
                                            { id: "Autre", label: "Autre" },
                                        ]}
                                        isRequired
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select>
                                </div>

                                <div className="flex justify-end gap-3 border-t border-secondary pt-6">
                                    <Button color="secondary" onClick={close}>
                                        Annuler
                                    </Button>
                                    <Button
                                        color="primary"
                                        onClick={handleAddCharge}
                                        isDisabled={!newCharge.nom || !newCharge.montant || !newCharge.jourPrelevement || !newCharge.categorie}
                                    >
                                        Ajouter
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
                                        isDisabled={!newCompte.nom || !newCompte.banque || !newCompte.solde || !newCompte.type}
                                    >
                                        Créer le compte
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
                                        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-secondary bg-secondary p-8 transition-colors hover:border-brand">
                                            <div className="flex flex-col items-center gap-2 text-center">
                                                <File06 className="h-8 w-8 text-tertiary" />
                                                <p className="text-sm text-tertiary">
                                                    {importFile ? importFile.name : "Glissez votre fichier ici ou cliquez pour parcourir"}
                                                </p>
                                                <input
                                                    type="file"
                                                    accept=".csv"
                                                    className="absolute inset-0 cursor-pointer opacity-0"
                                                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                                />
                                            </div>
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
                                    <Button color="primary-destructive" onClick={handleReset} className="flex-1">
                                        Réinitialiser
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
