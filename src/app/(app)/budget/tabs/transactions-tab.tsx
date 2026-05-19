"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronDown,
    ChevronRight,
    Download04,
    Edit01,
    FilterLines,
    Plus,
    SearchLg,
    Trash01,
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
import type { CategorieDepense, CompteDepense, TransactionDepense } from "@/lib/data/depenses";
import type { Profile } from "@/types/api";

// Types pour les données sérialisées
interface SerializedDepensesData {
    profile: Profile | null;
    comptes: CompteDepense[];
    categoriesDepense: CategorieDepense[];
    categoriesRevenu: CategorieDepense[];
    transactions: {
        id: string;
        description: string;
        montant: number;
        date: string;
        categorieId: string | null;
        compteId: string | null;
        type: "depense" | "revenu" | "fixe";
        categorieNom: string | null;
        categorieIcone: string | null;
        compteNom: string | null;
    }[];
}

export interface TransactionsTabProps {
    initialData: SerializedDepensesData;
    initialPeriode: string;
}

// ============================================
// HELPERS
// ============================================

const formatDateLabel = (date: Date): string => {
    const today = new Date();
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

const groupTransactionsByDay = (transactions: TransactionDepense[]) => {
    const groups: Record<string, TransactionDepense[]> = {};

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

const getDepensesParJour = (transactions: TransactionDepense[], days: number = 7) => {
    const today = new Date();
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

const getTopCategories = (
    transactions: TransactionDepense[],
    categoriesDepense: CategorieDepense[],
    limit: number = 5
) => {
    const categoriesMap = transactions
        .filter((t) => t.type === "depense" && t.categorieId)
        .reduce((acc, t) => {
            const catId = t.categorieId!;
            acc[catId] = (acc[catId] || 0) + Math.abs(t.montant);
            return acc;
        }, {} as Record<string, number>);

    return Object.entries(categoriesMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([id, montant]) => {
            const categorie = categoriesDepense.find((c) => c.id === id);
            return { id, nom: categorie?.nom || "", icone: categorie?.icone || "", montant };
        });
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function TransactionsTab({ initialData, initialPeriode }: TransactionsTabProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Données
    const profile = initialData.profile;
    const comptes = initialData.comptes;
    const categoriesDepense = initialData.categoriesDepense;
    const categoriesRevenu = initialData.categoriesRevenu;

    // Transactions avec dates reconverties
    const transactions = useMemo(() => {
        return initialData.transactions.map((t) => ({
            ...t,
            date: new Date(t.date),
        }));
    }, [initialData.transactions]);

    // État formulaire dépense
    const [montant, setMontant] = useState("");
    const [categorieId, setCategorieId] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [compteId, setCompteId] = useState(comptes[0]?.id || "");
    const [dateOption, setDateOption] = useState("today");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // État formulaire revenu (modale)
    const [isRevenuModalOpen, setIsRevenuModalOpen] = useState(false);
    const [revenuMontant, setRevenuMontant] = useState("");
    const [revenuCategorieId, setRevenuCategorieId] = useState<string | null>(null);
    const [revenuDescription, setRevenuDescription] = useState("");
    const [revenuCompteId, setRevenuCompteId] = useState(comptes[0]?.id || "");

    // État filtres
    const [showFilters, setShowFilters] = useState(false);
    const [periodeFilter, setPeriodeFilter] = useState(initialPeriode);
    const [categorieFilter, setCategorieFilter] = useState("all");
    const [compteFilter, setCompteFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // État édition transaction
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<TransactionDepense | null>(null);
    const [editCategorieId, setEditCategorieId] = useState<string | null>(null);

    // État création catégorie
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryIcon, setNewCategoryIcon] = useState("📦");
    const [newCategoryBudget, setNewCategoryBudget] = useState("");

    // État sélection multiple
    const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    // Liste de catégories locales (pour ajouts dynamiques)
    const [localCategories, setLocalCategories] = useState<CategorieDepense[]>(categoriesDepense);

    // Filtrage des transactions (local pour catégorie, compte, recherche)
    const filteredTransactions = useMemo(() => {
        let filtered = [...transactions];

        if (categorieFilter !== "all") {
            filtered = filtered.filter((t) => t.categorieId === categorieFilter);
        }

        if (compteFilter !== "all") {
            filtered = filtered.filter((t) => t.compteId === compteFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((t) => t.description.toLowerCase().includes(query));
        }

        return filtered;
    }, [transactions, categorieFilter, compteFilter, searchQuery]);

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

    const topCategories = getTopCategories(filteredTransactions, categoriesDepense);
    const depensesParJour = getDepensesParJour(transactions);

    // Handler changement de période (recharge les données côté serveur)
    const handlePeriodeChange = (newPeriode: string) => {
        setPeriodeFilter(newPeriode);
        startTransition(() => {
            router.push(`/budget?tab=transactions&periode=${newPeriode}`);
        });
    };

    // Handlers
    const handleAddDepense = async () => {
        if (!montant || !categorieId || !compteId) return;

        setIsSubmitting(true);

        try {
            let transactionDate = new Date();
            if (dateOption === "yesterday") {
                transactionDate.setDate(transactionDate.getDate() - 1);
            }

            const { addTransaction } = await import("@/lib/data/depenses");
            const result = await addTransaction({
                montant: parseFloat(montant),
                categorieId,
                compteId,
                description: description || undefined,
                type: "depense",
                date: transactionDate,
            });

            if (!result.success) throw new Error(result.error);

            setMontant("");
            setCategorieId(null);
            setDescription("");
            setDateOption("today");

            router.refresh();
        } catch (error) {
            console.error("Erreur ajout dépense:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddRevenu = async () => {
        if (!revenuMontant || !revenuCategorieId || !revenuCompteId) return;

        setIsSubmitting(true);

        try {
            const { addTransaction } = await import("@/lib/data/depenses");
            const result = await addTransaction({
                montant: parseFloat(revenuMontant),
                categorieId: revenuCategorieId,
                compteId: revenuCompteId,
                description: revenuDescription || undefined,
                type: "revenu",
                date: new Date(),
            });

            if (!result.success) throw new Error(result.error);

            setIsRevenuModalOpen(false);
            setRevenuMontant("");
            setRevenuCategorieId(null);
            setRevenuDescription("");

            router.refresh();
        } catch (error) {
            console.error("Erreur ajout revenu:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTransaction = async (transactionId: string) => {
        try {
            const { deleteTransaction } = await import("@/lib/data/depenses");
            const result = await deleteTransaction(transactionId);

            if (!result.success) throw new Error(result.error);

            router.refresh();
        } catch (error) {
            console.error("Erreur suppression:", error);
        }
    };

    const handleOpenEdit = (transaction: TransactionDepense) => {
        setEditingTransaction(transaction);
        setEditCategorieId(transaction.categorieId);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingTransaction) return;

        setIsSubmitting(true);

        try {
            const { api } = await import("@/lib/api/client");
            await api(`/api/v1/transactions/${editingTransaction.id}`, {
                method: "PATCH",
                body: { categorieId: editCategorieId },
            });

            setIsEditModalOpen(false);
            setEditingTransaction(null);
            router.refresh();
        } catch (error) {
            console.error("Erreur modification:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim() || !profile) return;

        setIsSubmitting(true);

        try {
            const { api } = await import("@/lib/api/client");
            const data = await api<{ id: string; nom: string; icone: string; budgetMensuel: number }>("/api/v1/categories", {
                method: "POST",
                body: {
                    nom: newCategoryName.trim(),
                    icone: newCategoryIcon,
                    couleur: "#1C1917",
                    budgetMensuel: parseFloat(newCategoryBudget) || 0,
                    type: "depense",
                },
            });

            const newCat: CategorieDepense = {
                id: data.id,
                nom: data.nom,
                icone: data.icone ?? "📦",
                couleur: "#1C1917",
            };
            setLocalCategories((prev) => [...prev, newCat]);
            setEditCategorieId(data.id);

            setIsCreatingCategory(false);
            setNewCategoryName("");
            setNewCategoryIcon("📦");
            setNewCategoryBudget("");
        } catch (error) {
            console.error("Erreur création catégorie:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSelectTransaction = (id: string) => {
        setSelectedTransactions((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedTransactions.size === filteredTransactions.length) {
            setSelectedTransactions(new Set());
        } else {
            setSelectedTransactions(new Set(filteredTransactions.map((t) => t.id)));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedTransactions.size === 0) return;

        setIsSubmitting(true);

        try {
            const { api } = await import("@/lib/api/client");
            await api("/api/v1/transactions/bulk-delete", {
                method: "POST",
                body: { ids: Array.from(selectedTransactions) },
            });

            setSelectedTransactions(new Set());
            setIsDeleteConfirmOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Erreur suppression en masse:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExport = () => {
        const csvContent = [
            ["Date", "Description", "Montant", "Catégorie", "Compte"].join(","),
            ...filteredTransactions.map((t) => {
                return [
                    t.date.toLocaleDateString("fr-FR"),
                    t.description,
                    t.montant,
                    t.categorieNom || "",
                    t.compteNom || "",
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

    if (!profile) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-primary">Chargement...</h1>
                    <p className="text-tertiary">Récupération de vos données...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Layout principal avec sidebar */}
            <div className="flex flex-col gap-8 xl:flex-row">
                {/* Contenu principal */}
                <div className="flex min-w-0 flex-1 flex-col gap-8">
                    {/* FORMULAIRE DE SAISIE */}
                    <div className="rounded-xl border border-[#E5E2DC] bg-white p-5 lg:p-6">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-tertiary">
                            Ajouter une dépense
                        </h2>

                        <div className="flex flex-col gap-5">
                            {/* Ligne 1: Montant + Catégories */}
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
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

                                <div className="flex flex-wrap gap-2">
                                    {categoriesDepense.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategorieId(cat.id)}
                                            className={cx(
                                                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                                categorieId === cat.id
                                                    ? "bg-brand-50 text-brand-700 ring-2 ring-brand-500"
                                                    : "bg-gray-50 text-tertiary border border-[#E5E2DC] hover:bg-gray-100"
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
                                    items={comptes.map((c) => ({ id: c.id, label: c.nom }))}
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
                                    ]}
                                    size="md"
                                    placeholder="Date"
                                >
                                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                </Select>

                                <Button
                                    size="md"
                                    onClick={handleAddDepense}
                                    isDisabled={!montant || !categorieId || !compteId || isSubmitting}
                                    className="lg:ml-auto"
                                >
                                    {isSubmitting ? "Enregistrement..." : "Enregistrer"}
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
                                                <div className="flex items-center justify-between border-b border-secondary px-6 py-4">
                                                    <h3 className="text-lg font-semibold text-primary">Ajouter un revenu</h3>
                                                    <ButtonUtility
                                                        size="sm"
                                                        color="tertiary"
                                                        icon={X}
                                                        onClick={() => setIsRevenuModalOpen(false)}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-5 px-6 py-5">
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

                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-sm font-medium text-primary">Catégorie *</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {categoriesRevenu.map((cat) => (
                                                                <button
                                                                    key={cat.id}
                                                                    type="button"
                                                                    onClick={() => setRevenuCategorieId(cat.id)}
                                                                    className={cx(
                                                                        "flex flex-col items-center gap-1 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                                                                        revenuCategorieId === cat.id
                                                                            ? "bg-[#FAFFE4] text-[#608B00] ring-2 ring-[#608B00]"
                                                                            : "bg-secondary text-tertiary hover:bg-secondary_hover"
                                                                    )}
                                                                >
                                                                    <span className="text-xl">{cat.icone}</span>
                                                                    <span className="text-xs">{cat.nom}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <Input
                                                        label="Description (optionnel)"
                                                        placeholder="Salaire janvier..."
                                                        value={revenuDescription}
                                                        onChange={(v) => setRevenuDescription(v)}
                                                        size="md"
                                                    />

                                                    <Select
                                                        label="Compte"
                                                        selectedKey={revenuCompteId}
                                                        onSelectionChange={(key) => setRevenuCompteId(key as string)}
                                                        items={comptes.map((c) => ({ id: c.id, label: c.nom }))}
                                                        size="md"
                                                    >
                                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                                    </Select>
                                                </div>

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
                                                        isDisabled={!revenuMontant || !revenuCategorieId || !revenuCompteId || isSubmitting}
                                                    >
                                                        {isSubmitting ? "Ajout..." : "Ajouter"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Dialog>
                                    </Modal>
                                </ModalOverlay>
                            </DialogTrigger>
                        </div>
                    </div>

                    {/* RÉSUMÉ PÉRIODE — visible uniquement sur mobile/tablette */}
                    <div className="flex gap-4 rounded-xl border border-[#E5E2DC] bg-white p-4 xl:hidden">
                        <div className="flex flex-1 flex-col items-center gap-0.5">
                            <span className="text-xs text-tertiary">Dépenses</span>
                            <span className="text-sm font-semibold text-primary">
                                {formatCurrencySimple(totals.depenses)}
                            </span>
                        </div>
                        <div className="w-px bg-tertiary/20" />
                        <div className="flex flex-1 flex-col items-center gap-0.5">
                            <span className="text-xs text-tertiary">Revenus</span>
                            <span className="text-sm font-semibold text-[#608B00]">
                                {formatCurrencySimple(totals.revenus)}
                            </span>
                        </div>
                        <div className="w-px bg-tertiary/20" />
                        <div className="flex flex-1 flex-col items-center gap-0.5">
                            <span className="text-xs text-tertiary">Balance</span>
                            <span className={cx("text-sm font-bold", totals.balance >= 0 ? "text-[#608B00]" : "text-primary")}>
                                {totals.balance >= 0 ? "+" : ""}{formatCurrencySimple(totals.balance)}
                            </span>
                        </div>
                    </div>

                    {/* HISTORIQUE */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-lg font-semibold text-primary">Historique</h2>

                            <div className="flex items-center gap-2">
                                <Button size="sm" color="secondary" iconLeading={Download04} onClick={handleExport}>
                                    Exporter
                                </Button>
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

                        {/* Filtres */}
                        {showFilters && (
                            <div className="flex flex-col gap-3 rounded-lg border border-[#E5E2DC] bg-white p-4 sm:flex-row sm:items-end">
                                <Select
                                    className="flex-1 sm:max-w-40"
                                    selectedKey={periodeFilter}
                                    onSelectionChange={(key) => handlePeriodeChange(key as string)}
                                    items={[
                                        { id: "this-week", label: "Cette semaine" },
                                        { id: "this-month", label: "Ce mois" },
                                        { id: "last-month", label: "Mois dernier" },
                                        { id: "all", label: "Tout" },
                                    ]}
                                    size="sm"
                                    placeholder="Période"
                                    isDisabled={isPending}
                                >
                                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                </Select>

                                <Select
                                    className="flex-1 sm:max-w-44"
                                    selectedKey={categorieFilter}
                                    onSelectionChange={(key) => setCategorieFilter(key as string)}
                                    items={[
                                        { id: "all", label: "Toutes catégories" },
                                        ...categoriesDepense.map((c) => ({ id: c.id, label: `${c.icone} ${c.nom}` })),
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
                                        ...comptes.map((c) => ({ id: c.id, label: c.nom })),
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

                        {/* Barre d'actions sélection */}
                        {selectedTransactions.size > 0 && (
                            <div className="flex items-center justify-between rounded-lg bg-brand-50 p-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedTransactions.size === filteredTransactions.length}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                    />
                                    <span className="text-sm font-medium text-brand-700">
                                        {selectedTransactions.size} sélectionnée{selectedTransactions.size > 1 ? "s" : ""}
                                    </span>
                                </div>
                                <Button
                                    size="sm"
                                    color="primary-destructive"
                                    iconLeading={Trash01}
                                    onClick={() => setIsDeleteConfirmOpen(true)}
                                >
                                    Supprimer
                                </Button>
                            </div>
                        )}

                        {/* Liste groupée par jour */}
                        <div className="flex flex-col gap-6">
                            {isPending ? (
                                <div className="flex flex-col items-center justify-center gap-4 py-12">
                                    <p className="text-sm text-tertiary">Chargement...</p>
                                </div>
                            ) : transactionsByDay.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-[#E5E2DC] bg-white py-16 px-8">
                                    <p className="font-display text-lg font-semibold text-primary">Aucune transaction</p>
                                    <p className="max-w-sm text-center text-sm text-tertiary">Aucune transaction ne correspond a vos filtres. Essayez de modifier vos criteres de recherche.</p>
                                </div>
                            ) : (
                                transactionsByDay.map((group) => (
                                    <div key={group.label} className="flex flex-col gap-2">
                                        <p className="px-1 text-sm font-semibold text-primary capitalize">
                                            {group.label}
                                        </p>

                                        <div className="flex flex-col divide-y divide-secondary rounded-xl border border-[#E5E2DC] bg-white">
                                            {group.transactions.map((t) => {
                                                const isRevenu = t.type === "revenu";
                                                const isFixe = t.type === "fixe";
                                                const isSelected = selectedTransactions.has(t.id);

                                                return (
                                                    <div
                                                        key={t.id}
                                                        className={cx(
                                                            "group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-secondary/50",
                                                            isFixe && "bg-secondary/30",
                                                            isSelected && "bg-brand-50"
                                                        )}
                                                    >
                                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleSelectTransaction(t.id)}
                                                                className="h-4 w-4 shrink-0 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                                            />
                                                            <span className="text-xl">{t.categorieIcone || "📦"}</span>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-medium text-primary">
                                                                    {t.description || t.categorieNom || "Transaction"}
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
                                                                    isRevenu ? "text-[#608B00]" : "text-primary"
                                                                )}
                                                            >
                                                                {isRevenu ? "+" : ""}{formatCurrencySimple(Math.abs(t.montant))}
                                                            </span>

                                                            <Badge
                                                                type="pill-color"
                                                                size="sm"
                                                                color={isFixe ? "blue" : "gray"}
                                                            >
                                                                {isFixe ? "Fixe" : t.categorieNom || "Autre"}
                                                            </Badge>

                                                            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                                <ButtonUtility
                                                                    size="xs"
                                                                    color="tertiary"
                                                                    icon={Edit01}
                                                                    onClick={() => handleOpenEdit(t)}
                                                                    tooltip="Modifier catégorie"
                                                                />
                                                                <ButtonUtility
                                                                    size="xs"
                                                                    color="tertiary"
                                                                    icon={Trash01}
                                                                    onClick={() => handleDeleteTransaction(t.id)}
                                                                    tooltip="Supprimer"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* SIDEBAR DROITE */}
                <div className="hidden w-72 shrink-0 flex-col gap-6 xl:flex">
                    {/* Résumé période */}
                    <div className="flex flex-col gap-4 rounded-xl border border-[#E5E2DC] bg-white p-5">
                        <p className="text-sm font-semibold text-primary">{getPeriodeLabel()}</p>

                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-tertiary">Dépenses</span>
                                <span className="text-sm font-semibold text-primary">
                                    -{formatCurrencySimple(totals.depenses)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-tertiary">Revenus</span>
                                <span className="text-sm font-semibold text-[#608B00]">
                                    +{formatCurrencySimple(totals.revenus)}
                                </span>
                            </div>
                            <div className="border-t border-tertiary/20 pt-3">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-primary">Balance</span>
                                    <span
                                        className={cx(
                                            "text-sm font-bold",
                                            totals.balance >= 0 ? "text-[#608B00]" : "text-primary"
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
                    <div className="flex flex-col gap-4 rounded-xl border border-[#E5E2DC] bg-white p-5">
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
                    <div className="flex flex-col gap-4 rounded-xl border border-[#E5E2DC] bg-white p-5">
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

            {/* MODALE ÉDITION CATÉGORIE */}
            <DialogTrigger isOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <span className="hidden" />
                <ModalOverlay isDismissable>
                    <Modal className="max-w-md">
                        <Dialog>
                            <div className="w-full rounded-xl bg-primary shadow-xl">
                                <div className="flex items-center justify-between border-b border-secondary px-6 py-4">
                                    <h3 className="text-lg font-semibold text-primary">Modifier la catégorie</h3>
                                    <ButtonUtility
                                        size="sm"
                                        color="tertiary"
                                        icon={X}
                                        onClick={() => {
                                            setIsEditModalOpen(false);
                                            setEditingTransaction(null);
                                            setIsCreatingCategory(false);
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col gap-5 px-6 py-5">
                                    {editingTransaction && (
                                        <div className="rounded-lg bg-secondary p-3">
                                            <p className="text-sm font-medium text-primary">
                                                {editingTransaction.description || "Transaction"}
                                            </p>
                                            <p className="text-xs text-tertiary">
                                                {formatCurrencySimple(Math.abs(editingTransaction.montant))} · {editingTransaction.date.toLocaleDateString("fr-FR")}
                                            </p>
                                        </div>
                                    )}

                                    {!isCreatingCategory ? (
                                        <>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-medium text-primary">Catégorie</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {localCategories.map((cat) => (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            onClick={() => setEditCategorieId(cat.id)}
                                                            className={cx(
                                                                "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-all",
                                                                editCategorieId === cat.id
                                                                    ? "bg-brand-50 text-brand-700 ring-2 ring-brand-500"
                                                                    : "bg-secondary text-tertiary hover:text-primary"
                                                            )}
                                                        >
                                                            <span>{cat.icone}</span>
                                                            <span>{cat.nom}</span>
                                                        </button>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsCreatingCategory(true)}
                                                        className="flex items-center gap-1 rounded-md border-2 border-dashed border-secondary px-3 py-2 text-sm font-medium text-tertiary transition-all hover:border-brand-300 hover:text-brand-600"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        <span>Nouvelle</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex flex-col gap-4">
                                                <p className="text-sm font-medium text-primary">Nouvelle catégorie</p>

                                                <Input
                                                    label="Nom"
                                                    placeholder="Ex: Transport"
                                                    value={newCategoryName}
                                                    onChange={(v) => setNewCategoryName(v)}
                                                    size="md"
                                                    autoFocus
                                                />

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-medium text-primary">Icône</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {["🛒", "🍔", "🚗", "🎮", "👕", "💊", "📱", "🏠", "✈️", "🎁", "💳", "📦"].map((emoji) => (
                                                            <button
                                                                key={emoji}
                                                                type="button"
                                                                onClick={() => setNewCategoryIcon(emoji)}
                                                                className={cx(
                                                                    "flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all",
                                                                    newCategoryIcon === emoji
                                                                        ? "bg-brand-100 ring-2 ring-brand-500"
                                                                        : "bg-secondary hover:bg-secondary_hover"
                                                                )}
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <Input
                                                    label="Budget mensuel (optionnel)"
                                                    placeholder="Ex: 200"
                                                    value={newCategoryBudget}
                                                    onChange={(v) => setNewCategoryBudget(v)}
                                                    type="number"
                                                    size="md"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 border-t border-secondary px-6 py-4">
                                    {isCreatingCategory ? (
                                        <>
                                            <Button size="md" color="secondary" onClick={() => setIsCreatingCategory(false)}>
                                                Retour
                                            </Button>
                                            <Button
                                                size="md"
                                                onClick={handleCreateCategory}
                                                isDisabled={!newCategoryName.trim() || isSubmitting}
                                            >
                                                {isSubmitting ? "Création..." : "Créer catégorie"}
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button size="md" color="secondary" onClick={() => setIsEditModalOpen(false)}>
                                                Annuler
                                            </Button>
                                            <Button size="md" onClick={handleSaveEdit} isDisabled={isSubmitting}>
                                                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Dialog>
                    </Modal>
                </ModalOverlay>
            </DialogTrigger>

            {/* MODALE CONFIRMATION SUPPRESSION */}
            <DialogTrigger isOpen={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <span className="hidden" />
                <ModalOverlay isDismissable>
                    <Modal className="max-w-sm">
                        <Dialog>
                            <div className="w-full rounded-xl bg-primary shadow-xl">
                                <div className="flex items-center justify-between border-b border-secondary px-6 py-4">
                                    <h3 className="text-lg font-semibold text-primary">Confirmer la suppression</h3>
                                    <ButtonUtility
                                        size="sm"
                                        color="tertiary"
                                        icon={X}
                                        onClick={() => setIsDeleteConfirmOpen(false)}
                                    />
                                </div>

                                <div className="px-6 py-5">
                                    <p className="text-sm text-tertiary">
                                        Êtes-vous sûr de vouloir supprimer{" "}
                                        <span className="font-semibold text-primary">
                                            {selectedTransactions.size} transaction{selectedTransactions.size > 1 ? "s" : ""}
                                        </span>
                                        {" "}? Cette action est irréversible.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 border-t border-secondary px-6 py-4">
                                    <Button size="md" color="secondary" onClick={() => setIsDeleteConfirmOpen(false)}>
                                        Annuler
                                    </Button>
                                    <Button
                                        size="md"
                                        color="primary-destructive"
                                        onClick={handleDeleteSelected}
                                        isDisabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Suppression..." : "Supprimer"}
                                    </Button>
                                </div>
                            </div>
                        </Dialog>
                    </Modal>
                </ModalOverlay>
            </DialogTrigger>
        </>
    );
}
