"use client";

import { useMemo, useState } from "react";
import {
    ChevronDown,
    ChevronRight,
    Download04,
    Edit01,
    FilterLines,
    Plus,
    SearchLg,
    X,
} from "@untitledui/icons";
import { Bar, BarChart, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis } from "recharts";
import { ChartTooltipContent } from "@/components/application/charts/charts-base";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { cx } from "@/utils/cx";
import { formatCurrencySimple, getDayKey } from "@/utils/format";

// ============================================
// TYPES
// ============================================

interface Compte {
    id: string;
    nom: string;
    banque: string;
}

interface CategorieDepense {
    id: string;
    nom: string;
    icone: string;
    couleur: string;
}

interface CategorieRevenu {
    id: string;
    nom: string;
    icone: string;
    couleur: string;
}

interface Transaction {
    id: string;
    description: string;
    montant: number;
    date: Date;
    categorieId: string;
    compteId: string;
    type: "depense" | "revenu" | "fixe";
}

// ============================================
// DONNÉES
// ============================================

const COMPTES: Compte[] = [
    { id: "courant", nom: "Compte courant", banque: "Boursorama" },
    { id: "cash", nom: "Cash", banque: "Espèces" },
    { id: "n26", nom: "N26", banque: "N26" },
];

const CATEGORIES_DEPENSE: CategorieDepense[] = [
    { id: "alim", nom: "Alimentation", icone: "🍔", couleur: "#ef4444" },
    { id: "transport", nom: "Transport", icone: "🚇", couleur: "#f97316" },
    { id: "loisirs", nom: "Loisirs", icone: "🎮", couleur: "#3b82f6" },
    { id: "vetements", nom: "Vêtements", icone: "👕", couleur: "#ec4899" },
    { id: "autre", nom: "Autre", icone: "📦", couleur: "#6b7280" },
];

const CATEGORIES_REVENU: CategorieRevenu[] = [
    { id: "salaire", nom: "Salaire", icone: "💰", couleur: "#10b981" },
    { id: "freelance", nom: "Freelance", icone: "💻", couleur: "#06b6d4" },
    { id: "remboursement", nom: "Remboursement", icone: "🔄", couleur: "#84cc16" },
    { id: "aides", nom: "Aides", icone: "🏛️", couleur: "#6366f1" },
    { id: "autre_revenu", nom: "Autre", icone: "📦", couleur: "#6b7280" },
];

const TRANSACTIONS: Transaction[] = [
    // Semaine 2 (6-12 janv)
    { id: "tr-1", description: "Cinéma UGC", montant: -12.50, date: new Date(2026, 0, 11, 20, 0), categorieId: "loisirs", compteId: "courant", type: "depense" },
    { id: "tr-2", description: "Uber Eats", montant: -18.50, date: new Date(2026, 0, 10, 19, 30), categorieId: "alim", compteId: "courant", type: "depense" },
    { id: "tr-3", description: "Amazon", montant: -19.99, date: new Date(2026, 0, 10, 14, 0), categorieId: "autre", compteId: "courant", type: "depense" },
    { id: "tr-4", description: "Zara", montant: -45.00, date: new Date(2026, 0, 9, 16, 30), categorieId: "vetements", compteId: "courant", type: "depense" },
    { id: "tr-5", description: "Picard", montant: -23.40, date: new Date(2026, 0, 8, 12, 15), categorieId: "alim", compteId: "courant", type: "depense" },
    { id: "tr-6", description: "Cinéma", montant: -11.50, date: new Date(2026, 0, 7, 21, 0), categorieId: "loisirs", compteId: "courant", type: "depense" },
    { id: "tr-7", description: "Carrefour Market", montant: -47.82, date: new Date(2026, 0, 6, 14, 30), categorieId: "alim", compteId: "courant", type: "depense" },
    { id: "tr-8", description: "Uber", montant: -12.50, date: new Date(2026, 0, 6, 9, 0), categorieId: "transport", compteId: "courant", type: "depense" },

    // Semaine 1 (1-5 janv)
    { id: "tr-9", description: "Navigo Janvier", montant: -86.40, date: new Date(2026, 0, 5, 9, 0), categorieId: "transport", compteId: "courant", type: "fixe" },
    { id: "tr-10", description: "Salaire Alternance", montant: 1450.00, date: new Date(2026, 0, 5, 8, 0), categorieId: "salaire", compteId: "courant", type: "revenu" },
    { id: "tr-11", description: "Spotify", montant: -5.99, date: new Date(2026, 0, 4, 10, 0), categorieId: "autre", compteId: "courant", type: "fixe" },
    { id: "tr-12", description: "Boulangerie", montant: -8.50, date: new Date(2026, 0, 4, 12, 45), categorieId: "alim", compteId: "cash", type: "depense" },
    { id: "tr-13", description: "Loyer Janvier", montant: -650.00, date: new Date(2026, 0, 3, 9, 0), categorieId: "autre", compteId: "courant", type: "fixe" },
    { id: "tr-14", description: "Mission Freelance", montant: 350.00, date: new Date(2026, 0, 2, 16, 20), categorieId: "freelance", compteId: "courant", type: "revenu" },
    { id: "tr-15", description: "Carrefour", montant: -32.50, date: new Date(2026, 0, 2, 11, 0), categorieId: "alim", compteId: "courant", type: "depense" },
    { id: "tr-16", description: "Métro tickets", montant: -4.20, date: new Date(2026, 0, 3, 8, 30), categorieId: "transport", compteId: "cash", type: "depense" },
];

// ============================================
// HELPERS
// ============================================

const formatDateLabel = (date: Date): string => {
    const today = new Date(2026, 0, 11); // Simule le 11 janvier 2026
    const todayKey = getDayKey(today);
    const dateKey = getDayKey(date);

    if (dateKey === todayKey) {
        return "Aujourd'hui";
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateKey === getDayKey(yesterday)) {
        return "Hier";
    }

    return date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
};

const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

const groupTransactionsByDay = (transactions: Transaction[]) => {
    const groups: Record<string, Transaction[]> = {};

    transactions.forEach((t) => {
        const dayKey = getDayKey(t.date);
        if (!groups[dayKey]) {
            groups[dayKey] = [];
        }
        groups[dayKey].push(t);
    });

    return Object.entries(groups)
        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
        .map(([, transactions]) => ({
            date: transactions[0].date,
            label: formatDateLabel(transactions[0].date),
            transactions: transactions.sort((a, b) => b.date.getTime() - a.date.getTime()),
        }));
};

const getCategoryInfo = (categorieId: string, type: string) => {
    if (type === "revenu") {
        return CATEGORIES_REVENU.find((c) => c.id === categorieId);
    }
    return CATEGORIES_DEPENSE.find((c) => c.id === categorieId);
};

const getDepensesParJour = (transactions: Transaction[], days: number = 7) => {
    const today = new Date(2026, 0, 11);
    const result: { label: string; depenses: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dayKey = getDayKey(date);
        const dayTransactions = transactions.filter(
            (t) => getDayKey(t.date) === dayKey && (t.type === "depense" || t.type === "fixe") && t.montant < 0
        );
        const total = dayTransactions.reduce((acc, t) => acc + Math.abs(t.montant), 0);

        result.push({
            label: date.toLocaleDateString("fr-FR", { weekday: "short" }),
            depenses: total,
        });
    }

    return result;
};

const getTopCategories = (transactions: Transaction[], limit: number = 5) => {
    const categoriesMap = transactions
        .filter((t) => t.type === "depense")
        .reduce((acc, t) => {
            const cat = getCategoryInfo(t.categorieId, t.type);
            if (cat) {
                acc[cat.id] = (acc[cat.id] || 0) + Math.abs(t.montant);
            }
            return acc;
        }, {} as Record<string, number>);

    return Object.entries(categoriesMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([id, montant]) => {
            const categorie = CATEGORIES_DEPENSE.find((c) => c.id === id);
            return { id, nom: categorie?.nom || "", icone: categorie?.icone || "", montant };
        });
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function DepensesPage() {
    // État formulaire dépense
    const [montant, setMontant] = useState("");
    const [categorieId, setCategorieId] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [compteId, setCompteId] = useState("courant");
    const [dateOption, setDateOption] = useState("today");

    // État formulaire revenu (modale)
    const [isRevenuModalOpen, setIsRevenuModalOpen] = useState(false);
    const [revenuMontant, setRevenuMontant] = useState("");
    const [revenuCategorieId, setRevenuCategorieId] = useState<string | null>(null);
    const [revenuDescription, setRevenuDescription] = useState("");
    const [revenuCompteId, setRevenuCompteId] = useState("courant");

    // État filtres
    const [showFilters, setShowFilters] = useState(false);
    const [periodeFilter, setPeriodeFilter] = useState("this-week");
    const [categorieFilter, setCategorieFilter] = useState("all");
    const [compteFilter, setCompteFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Filtrage des transactions
    const filteredTransactions = useMemo(() => {
        let filtered = [...TRANSACTIONS];
        const today = new Date(2026, 0, 11);

        // Filtre période
        if (periodeFilter === "this-week") {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay() + 1);
            filtered = filtered.filter((t) => t.date >= startOfWeek);
        } else if (periodeFilter === "this-month") {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            filtered = filtered.filter((t) => t.date >= startOfMonth);
        } else if (periodeFilter === "last-month") {
            const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            filtered = filtered.filter((t) => t.date >= startOfLastMonth && t.date <= endOfLastMonth);
        }

        // Filtre catégorie
        if (categorieFilter !== "all") {
            filtered = filtered.filter((t) => t.categorieId === categorieFilter);
        }

        // Filtre compte
        if (compteFilter !== "all") {
            filtered = filtered.filter((t) => t.compteId === compteFilter);
        }

        // Filtre recherche
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((t) => t.description.toLowerCase().includes(query));
        }

        return filtered;
    }, [periodeFilter, categorieFilter, compteFilter, searchQuery]);

    // Groupement par jour
    const transactionsByDay = groupTransactionsByDay(filteredTransactions);

    // Calculs pour la sidebar
    const totals = useMemo(() => {
        const depenses = filteredTransactions
            .filter((t) => t.type === "depense" || t.type === "fixe")
            .reduce((acc, t) => acc + Math.abs(t.montant), 0);
        const revenus = filteredTransactions
            .filter((t) => t.type === "revenu")
            .reduce((acc, t) => acc + t.montant, 0);
        return { depenses, revenus, balance: revenus - depenses };
    }, [filteredTransactions]);

    const topCategories = getTopCategories(filteredTransactions);
    const depensesParJour = getDepensesParJour(TRANSACTIONS);

    // Handlers
    const handleAddDepense = () => {
        if (!montant || !categorieId) return;
        console.log("Nouvelle dépense:", { montant, categorieId, description, compteId, dateOption });
        // Reset form
        setMontant("");
        setCategorieId(null);
        setDescription("");
        setCompteId("courant");
        setDateOption("today");
    };

    const handleAddRevenu = () => {
        if (!revenuMontant || !revenuCategorieId) return;
        console.log("Nouveau revenu:", { revenuMontant, revenuCategorieId, revenuDescription, revenuCompteId });
        setIsRevenuModalOpen(false);
        // Reset form
        setRevenuMontant("");
        setRevenuCategorieId(null);
        setRevenuDescription("");
        setRevenuCompteId("courant");
    };

    const handleExport = () => {
        const csvContent = [
            ["Date", "Description", "Montant", "Catégorie", "Compte"].join(","),
            ...filteredTransactions.map((t) => {
                const cat = getCategoryInfo(t.categorieId, t.type);
                const compte = COMPTES.find((c) => c.id === t.compteId);
                return [
                    t.date.toLocaleDateString("fr-FR"),
                    t.description,
                    t.montant,
                    cat?.nom || "",
                    compte?.nom || "",
                ].join(",");
            }),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `depenses_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
    };

    const getPeriodeLabel = () => {
        switch (periodeFilter) {
            case "this-week": return "Cette semaine";
            case "this-month": return "Ce mois";
            case "last-month": return "Mois dernier";
            case "all": return "Tout";
            default: return "Cette semaine";
        }
    };

    return (
        <div className="min-h-screen bg-primary">
            <div className="mx-auto max-w-container px-4 py-6 lg:px-8 lg:py-8">
                {/* ============================================ */}
                {/* SECTION 1: HEADER SIMPLIFIÉ */}
                {/* ============================================ */}
                <div className="mb-6 flex flex-col gap-4 border-b border-secondary pb-5 lg:mb-8 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl font-semibold text-primary lg:text-display-xs">Dépenses</h1>
                        <p className="text-sm text-tertiary">Enregistrez et suivez vos dépenses</p>
                    </div>
                    <Button size="md" color="secondary" iconLeading={Download04} onClick={handleExport}>
                        Exporter
                    </Button>
                </div>

                {/* Layout principal avec sidebar */}
                <div className="flex flex-col gap-8 xl:flex-row">
                    {/* Contenu principal */}
                    <div className="flex min-w-0 flex-1 flex-col gap-8">
                        {/* ============================================ */}
                        {/* SECTION 2: FORMULAIRE DE SAISIE */}
                        {/* ============================================ */}
                        <div className="rounded-xl bg-secondary p-5 ring-1 ring-secondary ring-inset lg:p-6">
                            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-tertiary">
                                Ajouter une dépense
                            </h2>

                            <div className="flex flex-col gap-5">
                                {/* Ligne 1: Montant + Catégories */}
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
                                    {/* Montant */}
                                    <div className="flex items-center gap-2">
                                        <div className="relative w-32">
                                            <Input
                                                type="number"
                                                placeholder="0,00"
                                                value={montant}
                                                onChange={(v) => setMontant(v)}
                                                inputClassName="text-xl font-bold text-right pr-8"
                                                size="md"
                                                autoFocus
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg font-medium text-tertiary">
                                                €
                                            </span>
                                        </div>
                                    </div>

                                    {/* Catégories toggle */}
                                    <div className="flex flex-wrap gap-2">
                                        {CATEGORIES_DEPENSE.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setCategorieId(cat.id)}
                                                className={cx(
                                                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                                    categorieId === cat.id
                                                        ? "bg-brand-50 text-brand-700 ring-2 ring-brand-500"
                                                        : "bg-primary text-tertiary ring-1 ring-secondary hover:bg-primary_hover"
                                                )}
                                            >
                                                <span className="text-lg">{cat.icone}</span>
                                                <span className="max-sm:sr-only">{cat.nom}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Ligne 2: Description + Compte + Date + Bouton */}
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-4">
                                    <Input
                                        className="flex-1 lg:max-w-xs"
                                        placeholder="Description (optionnel)"
                                        value={description}
                                        onChange={(v) => setDescription(v)}
                                        size="md"
                                    />

                                    <Select
                                        className="lg:w-40"
                                        selectedKey={compteId}
                                        onSelectionChange={(key) => setCompteId(key as string)}
                                        items={COMPTES.map((c) => ({ id: c.id, label: c.nom }))}
                                        size="md"
                                        placeholder="Compte"
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select>

                                    <Select
                                        className="lg:w-40"
                                        selectedKey={dateOption}
                                        onSelectionChange={(key) => setDateOption(key as string)}
                                        items={[
                                            { id: "today", label: "Aujourd'hui" },
                                            { id: "yesterday", label: "Hier" },
                                            { id: "other", label: "Autre..." },
                                        ]}
                                        size="md"
                                        placeholder="Date"
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select>

                                    <Button
                                        size="md"
                                        onClick={handleAddDepense}
                                        isDisabled={!montant || !categorieId}
                                        className="lg:ml-auto"
                                    >
                                        Enregistrer
                                    </Button>
                                </div>

                                {/* Séparateur + Bouton revenu */}
                                <div className="flex items-center gap-4 pt-2">
                                    <div className="h-px flex-1 bg-tertiary/20" />
                                    <span className="text-xs text-quaternary">ou ajouter un revenu</span>
                                    <div className="h-px flex-1 bg-tertiary/20" />
                                </div>

                                <DialogTrigger isOpen={isRevenuModalOpen} onOpenChange={setIsRevenuModalOpen}>
                                    <Button size="sm" color="link-color" iconLeading={Plus}>
                                        Revenu
                                    </Button>

                                    <ModalOverlay isDismissable>
                                        <Modal className="max-w-md">
                                            <Dialog>
                                                <div className="w-full rounded-xl bg-primary shadow-xl">
                                                    {/* Modal Header */}
                                                    <div className="flex items-center justify-between border-b border-secondary px-6 py-4">
                                                        <h3 className="text-lg font-semibold text-primary">Ajouter un revenu</h3>
                                                        <ButtonUtility
                                                            size="sm"
                                                            color="tertiary"
                                                            icon={X}
                                                            onClick={() => setIsRevenuModalOpen(false)}
                                                        />
                                                    </div>

                                                    {/* Modal Body */}
                                                    <div className="flex flex-col gap-5 px-6 py-5">
                                                        {/* Montant */}
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-sm font-medium text-primary">Montant *</label>
                                                            <div className="relative">
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0,00"
                                                                    value={revenuMontant}
                                                                    onChange={(v) => setRevenuMontant(v)}
                                                                    inputClassName="text-display-sm font-bold text-center pr-12"
                                                                    size="md"
                                                                />
                                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-medium text-tertiary">€</span>
                                                            </div>
                                                        </div>

                                                        {/* Catégorie */}
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-sm font-medium text-primary">Catégorie *</label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {CATEGORIES_REVENU.map((cat) => (
                                                                    <button
                                                                        key={cat.id}
                                                                        type="button"
                                                                        onClick={() => setRevenuCategorieId(cat.id)}
                                                                        className={cx(
                                                                            "flex flex-col items-center gap-1 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                                                                            revenuCategorieId === cat.id
                                                                                ? "bg-success-50 text-success-700 ring-2 ring-success-500"
                                                                                : "bg-secondary text-tertiary hover:bg-secondary_hover"
                                                                        )}
                                                                    >
                                                                        <span className="text-xl">{cat.icone}</span>
                                                                        <span className="text-xs">{cat.nom}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Description */}
                                                        <Input
                                                            label="Description (optionnel)"
                                                            placeholder="Salaire janvier..."
                                                            value={revenuDescription}
                                                            onChange={(v) => setRevenuDescription(v)}
                                                            size="md"
                                                        />

                                                        {/* Compte */}
                                                        <Select
                                                            label="Compte"
                                                            selectedKey={revenuCompteId}
                                                            onSelectionChange={(key) => setRevenuCompteId(key as string)}
                                                            items={COMPTES.map((c) => ({ id: c.id, label: c.nom }))}
                                                            size="md"
                                                        >
                                                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                                        </Select>
                                                    </div>

                                                    {/* Modal Footer */}
                                                    <div className="flex justify-end gap-3 border-t border-secondary px-6 py-4">
                                                        <Button
                                                            size="md"
                                                            color="secondary"
                                                            onClick={() => setIsRevenuModalOpen(false)}
                                                        >
                                                            Annuler
                                                        </Button>
                                                        <Button
                                                            size="md"
                                                            onClick={handleAddRevenu}
                                                            isDisabled={!revenuMontant || !revenuCategorieId}
                                                        >
                                                            Ajouter
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Dialog>
                                        </Modal>
                                    </ModalOverlay>
                                </DialogTrigger>
                            </div>
                        </div>

                        {/* ============================================ */}
                        {/* SECTION 3: HISTORIQUE */}
                        {/* ============================================ */}
                        <div className="flex flex-col gap-4">
                            {/* Header historique */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <h2 className="text-lg font-semibold text-primary">Historique</h2>

                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        color="secondary"
                                        iconLeading={FilterLines}
                                        iconTrailing={ChevronDown}
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        Filtres
                                    </Button>
                                </div>
                            </div>

                            {/* Filtres (conditionnels) */}
                            {showFilters && (
                                <div className="flex flex-col gap-3 rounded-lg bg-secondary p-4 sm:flex-row sm:items-end">
                                    <Select
                                        className="flex-1 sm:max-w-40"
                                        selectedKey={periodeFilter}
                                        onSelectionChange={(key) => setPeriodeFilter(key as string)}
                                        items={[
                                            { id: "this-week", label: "Cette semaine" },
                                            { id: "this-month", label: "Ce mois" },
                                            { id: "last-month", label: "Mois dernier" },
                                            { id: "all", label: "Tout" },
                                        ]}
                                        size="sm"
                                        placeholder="Période"
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select>

                                    <Select
                                        className="flex-1 sm:max-w-44"
                                        selectedKey={categorieFilter}
                                        onSelectionChange={(key) => setCategorieFilter(key as string)}
                                        items={[
                                            { id: "all", label: "Toutes catégories" },
                                            ...CATEGORIES_DEPENSE.map((c) => ({ id: c.id, label: `${c.icone} ${c.nom}` })),
                                        ]}
                                        size="sm"
                                        placeholder="Catégorie"
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select>

                                    <Select
                                        className="flex-1 sm:max-w-40"
                                        selectedKey={compteFilter}
                                        onSelectionChange={(key) => setCompteFilter(key as string)}
                                        items={[
                                            { id: "all", label: "Tous comptes" },
                                            ...COMPTES.map((c) => ({ id: c.id, label: c.nom })),
                                        ]}
                                        size="sm"
                                        placeholder="Compte"
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select>

                                    <Input
                                        className="flex-1 sm:max-w-48"
                                        placeholder="Rechercher..."
                                        icon={SearchLg}
                                        value={searchQuery}
                                        onChange={(v) => setSearchQuery(v)}
                                        size="sm"
                                    />
                                </div>
                            )}

                            {/* Liste groupée par jour */}
                            <div className="flex flex-col gap-6">
                                {transactionsByDay.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                                        <p className="text-sm text-tertiary">Aucune transaction trouvée</p>
                                    </div>
                                ) : (
                                    transactionsByDay.map((group) => (
                                        <div key={group.label} className="flex flex-col gap-2">
                                            <p className="px-1 text-sm font-semibold text-primary capitalize">
                                                {group.label}
                                            </p>

                                            <div className="flex flex-col divide-y divide-secondary rounded-xl ring-1 ring-secondary">
                                                {group.transactions.map((t) => {
                                                    const categorie = getCategoryInfo(t.categorieId, t.type);
                                                    const isRevenu = t.type === "revenu";
                                                    const isFixe = t.type === "fixe";

                                                    return (
                                                        <div
                                                            key={t.id}
                                                            className={cx(
                                                                "group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-secondary/50",
                                                                isFixe && "bg-secondary/30"
                                                            )}
                                                        >
                                                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                                                <span className="text-xl">{categorie?.icone}</span>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate text-sm font-medium text-primary">
                                                                        {t.description}
                                                                    </p>
                                                                    <p className="text-xs text-tertiary">
                                                                        {formatTime(t.date)}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                <span
                                                                    className={cx(
                                                                        "text-sm font-semibold whitespace-nowrap",
                                                                        isRevenu ? "text-finance-gain" : "text-primary"
                                                                    )}
                                                                >
                                                                    {isRevenu ? "+" : ""}{formatCurrencySimple(Math.abs(t.montant))}
                                                                </span>

                                                                <Badge
                                                                    type="pill-color"
                                                                    size="sm"
                                                                    color={isFixe ? "blue" : "gray"}
                                                                >
                                                                    {isFixe ? "Fixe" : categorie?.nom}
                                                                </Badge>

                                                                <ButtonUtility
                                                                    size="xs"
                                                                    color="tertiary"
                                                                    icon={Edit01}
                                                                    className="opacity-0 transition-opacity group-hover:opacity-100"
                                                                    tooltip="Modifier"
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Charger plus */}
                            {transactionsByDay.length > 0 && (
                                <div className="flex justify-center pt-4">
                                    <Button size="sm" color="secondary" iconTrailing={ChevronRight}>
                                        Charger plus
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ============================================ */}
                    {/* SIDEBAR DROITE */}
                    {/* ============================================ */}
                    <div className="hidden w-72 shrink-0 flex-col gap-6 xl:flex">
                        {/* Résumé période */}
                        <div className="flex flex-col gap-4 rounded-xl bg-secondary p-5 ring-1 ring-secondary ring-inset">
                            <p className="text-sm font-semibold text-primary">{getPeriodeLabel()}</p>

                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-tertiary">Dépenses</span>
                                    <span className="text-sm font-semibold text-finance-loss">
                                        -{formatCurrencySimple(totals.depenses)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-tertiary">Revenus</span>
                                    <span className="text-sm font-semibold text-finance-gain">
                                        +{formatCurrencySimple(totals.revenus)}
                                    </span>
                                </div>
                                <div className="border-t border-tertiary/20 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-primary">Balance</span>
                                        <span
                                            className={cx(
                                                "text-sm font-bold",
                                                totals.balance >= 0 ? "text-finance-gain" : "text-finance-loss"
                                            )}
                                        >
                                            {totals.balance >= 0 ? "+" : ""}
                                            {formatCurrencySimple(totals.balance)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top catégories */}
                        <div className="flex flex-col gap-4 rounded-xl bg-secondary p-5 ring-1 ring-secondary ring-inset">
                            <p className="text-sm font-semibold text-primary">Top catégories</p>

                            <div className="flex flex-col gap-3">
                                {topCategories.length > 0 ? (
                                    topCategories.map((cat) => (
                                        <div key={cat.id} className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{cat.icone}</span>
                                                <span className="text-sm text-tertiary">{cat.nom}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-primary">
                                                {formatCurrencySimple(cat.montant)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-tertiary">Aucune dépense</p>
                                )}
                            </div>
                        </div>

                        {/* Graphique mini */}
                        <div className="flex flex-col gap-4 rounded-xl bg-secondary p-5 ring-1 ring-secondary ring-inset">
                            <p className="text-sm font-semibold text-primary">7 derniers jours</p>

                            <ResponsiveContainer width="100%" height={120}>
                                <BarChart data={depensesParJour} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: "currentColor" }}
                                        className="text-tertiary"
                                    />
                                    <RechartsTooltip
                                        content={<ChartTooltipContent />}
                                        formatter={(value) => formatCurrencySimple(value as number)}
                                        labelFormatter={(label) => label}
                                        cursor={{ className: "fill-utility-gray-200/20" }}
                                    />
                                    <Bar dataKey="depenses" fill="currentColor" className="text-utility-brand-500" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
