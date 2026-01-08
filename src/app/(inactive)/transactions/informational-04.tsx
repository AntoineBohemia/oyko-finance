"use client";

import { useMemo, useState } from "react";
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Download04,
    Edit01,
    File06,
    HomeLine,
    List,
    Plus,
    RefreshCcw01,
    SearchLg,
    Table as TableIcon,
    Trash01,
    X,
} from "@untitledui/icons";
import { type SortDescriptor } from "react-aria-components";
import { Bar, BarChart, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis } from "recharts";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { ChartTooltipContent } from "@/components/application/charts/charts-base";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { PaginationPageDefault } from "@/components/application/pagination/pagination";
import { Table, TableCard } from "@/components/application/table/table";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { cx } from "@/utils/cx";
import type { CompteStatut, CompteType, MoyenPaiement, TransactionType } from "@/utils/finance";
import { formatCurrency, formatCurrencySimple, getDayKey } from "@/utils/format";

// ============================================
// TYPES LOCAUX
// ============================================

type ViewMode = "table" | "list" | "calendar";

interface TransactionCompte {
    id: string;
    nom: string;
    type: CompteType;
    banque: string;
    solde: number;
    statut: CompteStatut;
}

interface TransactionCategorie {
    id: string;
    nom: string;
    type: "Dépense" | "Revenu";
    icone: string;
    couleur: string;
}

interface TransactionAbonnement {
    id: string;
    nom: string;
    montant: number;
}

interface PageTransaction {
    id: string;
    description: string;
    initials: string;
    avatarUrl?: string;
    montant: number;
    date: number;
    type: TransactionType;
    categorie: TransactionCategorie;
    compte: TransactionCompte;
    compteDestination?: TransactionCompte;
    moyenPaiement: MoyenPaiement;
    abonnement?: TransactionAbonnement;
    notes?: string;
    recu?: string;
}

// ============================================
// DONNÉES - COMPTES
// ============================================

const comptes: TransactionCompte[] = [
    {
        id: "cpt-1",
        nom: "Compte courant",
        type: "Courant",
        banque: "Boursorama",
        solde: 1847.32,
        statut: "Actif",
    },
    {
        id: "cpt-2",
        nom: "Livret A",
        type: "Épargne",
        banque: "Boursorama",
        solde: 5200.0,
        statut: "Actif",
    },
    {
        id: "cpt-3",
        nom: "N26",
        type: "Courant",
        banque: "N26",
        solde: 124.5,
        statut: "Gelé",
    },
    {
        id: "cpt-4",
        nom: "Cash",
        type: "Cash",
        banque: "Cash",
        solde: 85.0,
        statut: "Actif",
    },
    {
        id: "cpt-5",
        nom: "Trade Republic",
        type: "Investissement",
        banque: "Trade Republic",
        solde: 3420.0,
        statut: "Actif",
    },
];

// ============================================
// DONNÉES - CATÉGORIES
// ============================================

const categories: TransactionCategorie[] = [
    { id: "cat-1", nom: "Alimentation", type: "Dépense", icone: "🍔", couleur: "#ef4444" },
    { id: "cat-2", nom: "Transport", type: "Dépense", icone: "🚇", couleur: "#f97316" },
    { id: "cat-3", nom: "Logement", type: "Dépense", icone: "🏠", couleur: "#eab308" },
    { id: "cat-4", nom: "Abonnements", type: "Dépense", icone: "📺", couleur: "#22c55e" },
    { id: "cat-5", nom: "Sorties", type: "Dépense", icone: "🎉", couleur: "#3b82f6" },
    { id: "cat-6", nom: "Santé", type: "Dépense", icone: "💊", couleur: "#8b5cf6" },
    { id: "cat-7", nom: "Vêtements", type: "Dépense", icone: "👕", couleur: "#ec4899" },
    { id: "cat-8", nom: "Investissement", type: "Dépense", icone: "📈", couleur: "#14b8a6" },
    { id: "cat-9", nom: "Courses", type: "Dépense", icone: "🛒", couleur: "#f43f5e" },
    { id: "cat-10", nom: "Salaire", type: "Revenu", icone: "💰", couleur: "#10b981" },
    { id: "cat-11", nom: "Freelance", type: "Revenu", icone: "💻", couleur: "#06b6d4" },
    { id: "cat-12", nom: "Aides", type: "Revenu", icone: "🏛️", couleur: "#6366f1" },
    { id: "cat-13", nom: "Remboursement", type: "Revenu", icone: "🔄", couleur: "#84cc16" },
];

// ============================================
// DONNÉES - ABONNEMENTS
// ============================================

const abonnements: TransactionAbonnement[] = [
    { id: "abo-1", nom: "Spotify", montant: 5.99 },
    { id: "abo-2", nom: "Netflix", montant: 13.49 },
    { id: "abo-3", nom: "Forfait Free", montant: 12.99 },
    { id: "abo-4", nom: "Navigo", montant: 86.4 },
    { id: "abo-5", nom: "Basic Fit", montant: 29.99 },
    { id: "abo-6", nom: "iCloud", montant: 0.99 },
];

// ============================================
// DONNÉES - TRANSACTIONS
// ============================================

const transactions: PageTransaction[] = [
    {
        id: "tr-01",
        description: "Carrefour Market",
        initials: "CA",
        montant: -47.82,
        date: new Date(2026, 0, 6, 14, 30).getTime(),
        type: "Dépense",
        categorie: categories[0],
        compte: comptes[0],
        moyenPaiement: "CB",
    },
    {
        id: "tr-02",
        description: "Navigo Janvier",
        initials: "NA",
        montant: -86.4,
        date: new Date(2026, 0, 5, 9, 0).getTime(),
        type: "Dépense",
        categorie: categories[1],
        compte: comptes[0],
        moyenPaiement: "Prélèvement",
        abonnement: abonnements[3],
    },
    {
        id: "tr-03",
        description: "Salaire Alternance",
        initials: "SA",
        avatarUrl: "https://www.untitledui.com/application/stripe.webp",
        montant: 1450.0,
        date: new Date(2026, 0, 5, 8, 0).getTime(),
        type: "Revenu",
        categorie: categories[9],
        compte: comptes[0],
        moyenPaiement: "Virement",
    },
    {
        id: "tr-04",
        description: "Spotify Premium",
        initials: "SP",
        avatarUrl: "https://www.untitledui.com/application/spotify.webp",
        montant: -5.99,
        date: new Date(2026, 0, 4, 10, 0).getTime(),
        type: "Dépense",
        categorie: categories[3],
        compte: comptes[0],
        moyenPaiement: "Prélèvement",
        abonnement: abonnements[0],
    },
    {
        id: "tr-05",
        description: "Boulangerie Paul",
        initials: "BP",
        montant: -8.5,
        date: new Date(2026, 0, 4, 12, 45).getTime(),
        type: "Dépense",
        categorie: categories[0],
        compte: comptes[3],
        moyenPaiement: "Espèces",
    },
    {
        id: "tr-06",
        description: "Loyer Janvier",
        initials: "LO",
        montant: -650.0,
        date: new Date(2026, 0, 3, 9, 0).getTime(),
        type: "Dépense",
        categorie: categories[2],
        compte: comptes[0],
        moyenPaiement: "Prélèvement",
    },
    {
        id: "tr-07",
        description: "Mission Freelance - Client A",
        initials: "FR",
        montant: 350.0,
        date: new Date(2026, 0, 2, 16, 20).getTime(),
        type: "Revenu",
        categorie: categories[10],
        compte: comptes[0],
        moyenPaiement: "Virement",
    },
    {
        id: "tr-08",
        description: "ETF MSCI World",
        initials: "ET",
        montant: -200.0,
        date: new Date(2026, 0, 2, 10, 0).getTime(),
        type: "Investissement",
        categorie: categories[7],
        compte: comptes[4],
        moyenPaiement: "Virement",
    },
    {
        id: "tr-09",
        description: "Uniqlo - T-shirts",
        initials: "UN",
        montant: -45.9,
        date: new Date(2026, 0, 1, 15, 30).getTime(),
        type: "Dépense",
        categorie: categories[6],
        compte: comptes[0],
        moyenPaiement: "CB",
    },
    {
        id: "tr-10",
        description: "APL Janvier",
        initials: "AP",
        montant: 180.0,
        date: new Date(2026, 0, 1, 8, 0).getTime(),
        type: "Revenu",
        categorie: categories[11],
        compte: comptes[0],
        moyenPaiement: "Virement",
    },
    {
        id: "tr-11",
        description: "Netflix",
        initials: "NF",
        avatarUrl: "https://www.untitledui.com/application/netflix.webp",
        montant: -13.49,
        date: new Date(2025, 11, 31, 10, 0).getTime(),
        type: "Dépense",
        categorie: categories[3],
        compte: comptes[0],
        moyenPaiement: "Prélèvement",
        abonnement: abonnements[1],
    },
    {
        id: "tr-12",
        description: "Pharmacie - Doliprane",
        initials: "PH",
        montant: -6.2,
        date: new Date(2025, 11, 30, 14, 15).getTime(),
        type: "Dépense",
        categorie: categories[5],
        compte: comptes[0],
        moyenPaiement: "CB",
    },
    {
        id: "tr-13",
        description: "Bar Le Comptoir",
        initials: "BC",
        montant: -24.0,
        date: new Date(2025, 11, 29, 22, 30).getTime(),
        type: "Dépense",
        categorie: categories[4],
        compte: comptes[0],
        moyenPaiement: "CB",
    },
    {
        id: "tr-14",
        description: "Remboursement Sécu",
        initials: "RS",
        montant: 12.5,
        date: new Date(2025, 11, 28, 9, 0).getTime(),
        type: "Revenu",
        categorie: categories[12],
        compte: comptes[0],
        moyenPaiement: "Virement",
    },
    {
        id: "tr-15",
        description: "Lidl Courses",
        initials: "LI",
        montant: -32.47,
        date: new Date(2025, 11, 28, 11, 20).getTime(),
        type: "Dépense",
        categorie: categories[8],
        compte: comptes[0],
        moyenPaiement: "CB",
    },
    {
        id: "tr-16",
        description: "Transfert → Livret A",
        initials: "TR",
        montant: -200.0,
        date: new Date(2025, 11, 27, 10, 0).getTime(),
        type: "Transfert",
        categorie: categories[7],
        compte: comptes[0],
        compteDestination: comptes[1],
        moyenPaiement: "Virement",
        notes: "Épargne mensuelle",
    },
    {
        id: "tr-17",
        description: "Salle Basic Fit",
        initials: "BF",
        montant: -29.99,
        date: new Date(2025, 11, 26, 9, 0).getTime(),
        type: "Dépense",
        categorie: categories[3],
        compte: comptes[0],
        moyenPaiement: "Prélèvement",
        abonnement: abonnements[4],
    },
    {
        id: "tr-18",
        description: "Uber Eats",
        initials: "UE",
        montant: -18.9,
        date: new Date(2025, 11, 25, 20, 15).getTime(),
        type: "Dépense",
        categorie: categories[0],
        compte: comptes[0],
        moyenPaiement: "CB",
    },
    {
        id: "tr-19",
        description: "Salaire Décembre",
        initials: "SA",
        avatarUrl: "https://www.untitledui.com/application/stripe.webp",
        montant: 1450.0,
        date: new Date(2025, 11, 24, 8, 0).getTime(),
        type: "Revenu",
        categorie: categories[9],
        compte: comptes[0],
        moyenPaiement: "Virement",
    },
    {
        id: "tr-20",
        description: "FNAC - Livre",
        initials: "FN",
        montant: -22.9,
        date: new Date(2025, 11, 23, 16, 45).getTime(),
        type: "Dépense",
        categorie: categories[4],
        compte: comptes[0],
        moyenPaiement: "CB",
    },
];

// ============================================
// HELPERS LOCAUX (timestamp-based)
// ============================================

const formatDate = (timestamp: number): string =>
    new Date(timestamp).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

const formatDateTime = (timestamp: number): string =>
    new Date(timestamp).toLocaleString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });

const formatTime = (timestamp: number): string =>
    new Date(timestamp).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });

const getDayKeyFromTimestamp = (timestamp: number): string => getDayKey(new Date(timestamp));

// ============================================
// CALCULS
// ============================================

const calculateTotals = (items: PageTransaction[]) => {
    const revenus = items.filter((t) => t.type === "Revenu").reduce((acc, t) => acc + t.montant, 0);
    const depenses = items.filter((t) => t.type === "Dépense" || t.type === "Investissement").reduce((acc, t) => acc + Math.abs(t.montant), 0);
    return { revenus, depenses, balance: revenus - depenses };
};

const getDepensesParJour = (items: PageTransaction[], days: number = 7) => {
    const now = new Date();
    const result: { date: string; label: string; depenses: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayKey = getDayKeyFromTimestamp(date.getTime());
        const dayTransactions = items.filter((t) => getDayKeyFromTimestamp(t.date) === dayKey && t.type === "Dépense");
        const total = dayTransactions.reduce((acc, t) => acc + Math.abs(t.montant), 0);

        result.push({
            date: dayKey,
            label: date.toLocaleDateString("fr-FR", { weekday: "short" }),
            depenses: total,
        });
    }

    return result;
};

const getTopCategories = (items: PageTransaction[], limit: number = 5) => {
    const categoriesMap = items
        .filter((t) => t.type === "Dépense")
        .reduce(
            (acc, t) => {
                const cat = t.categorie.nom;
                acc[cat] = (acc[cat] || 0) + Math.abs(t.montant);
                return acc;
            },
            {} as Record<string, number>,
        );

    return Object.entries(categoriesMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([nom, montant]) => {
            const categorie = categories.find((c) => c.nom === nom);
            return { nom, montant, icone: categorie?.icone, couleur: categorie?.couleur };
        });
};

const groupTransactionsByDay = (items: PageTransaction[]) => {
    const groups: Record<string, PageTransaction[]> = {};

    items.forEach((t) => {
        const dayKey = getDayKeyFromTimestamp(t.date);
        if (!groups[dayKey]) {
            groups[dayKey] = [];
        }
        groups[dayKey].push(t);
    });

    return Object.entries(groups)
        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
        .map(([date, transactions]) => ({
            date,
            label: new Date(transactions[0].date).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
            }),
            transactions,
            total: transactions.reduce((acc, t) => acc + t.montant, 0),
        }));
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const TransactionsPage = () => {
    // États filtres
    const [periode, setPeriode] = useState<string>("30-days");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [categorieFilter, setCategorieFilter] = useState<string>("all");
    const [compteFilter, setCompteFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // État vue
    const [viewMode, setViewMode] = useState<ViewMode>("table");

    // État tri
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "date",
        direction: "descending",
    });

    // État calendrier
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    // État modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTransaction, setNewTransaction] = useState({
        type: "Dépense" as TransactionType,
        description: "",
        montant: "",
        categorieId: "",
        compteId: comptes[0].id,
    });

    // Filtrage des transactions
    const filteredTransactions = useMemo(() => {
        let filtered = [...transactions];

        // Filtre période
        const now = new Date();
        if (periode === "7-days") {
            const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter((t) => t.date >= cutoff.getTime());
        } else if (periode === "30-days") {
            const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter((t) => t.date >= cutoff.getTime());
        } else if (periode === "this-month") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            filtered = filtered.filter((t) => t.date >= startOfMonth.getTime());
        } else if (periode === "3-months") {
            const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter((t) => t.date >= cutoff.getTime());
        } else if (periode === "this-year") {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            filtered = filtered.filter((t) => t.date >= startOfYear.getTime());
        }

        // Filtre type
        if (typeFilter !== "all") {
            filtered = filtered.filter((t) => t.type === typeFilter);
        }

        // Filtre catégorie
        if (categorieFilter !== "all") {
            filtered = filtered.filter((t) => t.categorie.id === categorieFilter);
        }

        // Filtre compte
        if (compteFilter !== "all") {
            filtered = filtered.filter((t) => t.compte.id === compteFilter);
        }

        // Filtre recherche
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (t) =>
                    t.description.toLowerCase().includes(query) ||
                    t.categorie.nom.toLowerCase().includes(query) ||
                    t.compte.nom.toLowerCase().includes(query) ||
                    Math.abs(t.montant).toString().includes(query),
            );
        }

        return filtered;
    }, [periode, typeFilter, categorieFilter, compteFilter, searchQuery]);

    // Tri des transactions
    const sortedTransactions = useMemo(() => {
        if (!sortDescriptor) return filteredTransactions;

        return [...filteredTransactions].sort((a, b) => {
            let first: any;
            let second: any;

            switch (sortDescriptor.column) {
                case "description":
                    first = a.description;
                    second = b.description;
                    break;
                case "montant":
                    first = a.montant;
                    second = b.montant;
                    break;
                case "date":
                    first = a.date;
                    second = b.date;
                    break;
                case "categorie":
                    first = a.categorie.nom;
                    second = b.categorie.nom;
                    break;
                case "compte":
                    first = a.compte.nom;
                    second = b.compte.nom;
                    break;
                default:
                    return 0;
            }

            if (typeof first === "number" && typeof second === "number") {
                return sortDescriptor.direction === "ascending" ? first - second : second - first;
            }

            if (typeof first === "string" && typeof second === "string") {
                const result = first.localeCompare(second);
                return sortDescriptor.direction === "ascending" ? result : -result;
            }

            return 0;
        });
    }, [filteredTransactions, sortDescriptor]);

    // Calculs
    const totals = calculateTotals(filteredTransactions);
    const topCategories = getTopCategories(filteredTransactions);
    const depensesParJour = getDepensesParJour(filteredTransactions, 7);
    const transactionsByDay = groupTransactionsByDay(sortedTransactions);

    // Calendrier
    const calendarDays = useMemo(() => {
        const year = calendarMonth.getFullYear();
        const month = calendarMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        const days: { date: Date; transactions: PageTransaction[]; isCurrentMonth: boolean }[] = [];

        // Jours du mois précédent
        for (let i = startPadding - 1; i >= 0; i--) {
            const date = new Date(year, month, -i);
            days.push({
                date,
                transactions: filteredTransactions.filter((t) => getDayKeyFromTimestamp(t.date) === getDayKeyFromTimestamp(date.getTime())),
                isCurrentMonth: false,
            });
        }

        // Jours du mois courant
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            days.push({
                date,
                transactions: filteredTransactions.filter((t) => getDayKeyFromTimestamp(t.date) === getDayKeyFromTimestamp(date.getTime())),
                isCurrentMonth: true,
            });
        }

        // Jours du mois suivant pour compléter la grille
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            const date = new Date(year, month + 1, i);
            days.push({
                date,
                transactions: filteredTransactions.filter((t) => getDayKeyFromTimestamp(t.date) === getDayKeyFromTimestamp(date.getTime())),
                isCurrentMonth: false,
            });
        }

        return days;
    }, [calendarMonth, filteredTransactions]);

    // Handlers
    const handleResetFilters = () => {
        setPeriode("30-days");
        setTypeFilter("all");
        setCategorieFilter("all");
        setCompteFilter("all");
        setSearchQuery("");
    };

    const handleExport = () => {
        // Logique d'export CSV/PDF
        const csvContent = [
            ["Date", "Description", "Montant", "Type", "Catégorie", "Compte"].join(","),
            ...sortedTransactions.map((t) => [formatDate(t.date), t.description, t.montant, t.type, t.categorie.nom, t.compte.nom].join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
    };

    // Rendu état vide
    const renderEmptyState = () => {
        const hasFilters = periode !== "all" || typeFilter !== "all" || categorieFilter !== "all" || compteFilter !== "all" || searchQuery;

        if (transactions.length === 0) {
            // Aucune transaction du tout
            return (
                <div className="flex flex-col items-center justify-center gap-6 py-16">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                        <FeaturedIcon size="lg" color="gray" theme="modern" icon={File06} />
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <p className="text-lg font-semibold text-primary">Aucune transaction enregistrée</p>
                        <p className="max-w-sm text-sm text-tertiary">Commencez à suivre vos finances en ajoutant votre première transaction.</p>
                    </div>
                    <Button iconLeading={Plus} color="primary" size="lg" onClick={() => setIsModalOpen(true)}>
                        Ajouter une transaction
                    </Button>
                </div>
            );
        }

        if (sortedTransactions.length === 0 && hasFilters) {
            // Aucun résultat avec filtres
            return (
                <div className="flex flex-col items-center justify-center gap-6 py-16">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                        <FeaturedIcon size="lg" color="gray" theme="modern" icon={SearchLg} />
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <p className="text-lg font-semibold text-primary">Aucune transaction trouvée</p>
                        <p className="max-w-sm text-sm text-tertiary">
                            Aucune transaction ne correspond à vos critères de recherche. Essayez de modifier vos filtres.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button iconLeading={RefreshCcw01} color="secondary" size="md" onClick={handleResetFilters}>
                            Réinitialiser les filtres
                        </Button>
                        <Button iconLeading={Plus} color="primary" size="md" onClick={() => setIsModalOpen(true)}>
                            Nouvelle transaction
                        </Button>
                    </div>
                </div>
            );
        }

        return null;
    };

    // Rendu vue Table
    const renderTableView = () => (
        <TableCard.Root className="-mx-4 rounded-none lg:mx-0 lg:rounded-xl">
            <Table aria-label="Transactions" selectionMode="multiple" sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor} className="bg-primary">
                <Table.Header>
                    <Table.Head id="description" isRowHeader allowsSorting label="Transaction" className="w-full" />
                    <Table.Head id="montant" label="Montant" allowsSorting />
                    <Table.Head id="date" label="Date" allowsSorting className="max-lg:hidden" />
                    <Table.Head id="categorie" label="Catégorie" allowsSorting className="max-lg:hidden" />
                    <Table.Head id="compte" label="Compte" className="max-lg:hidden" />
                    <Table.Head id="actions" label="" />
                </Table.Header>

                <Table.Body items={sortedTransactions}>
                    {(transaction) => (
                        <Table.Row id={transaction.id}>
                            <Table.Cell>
                                <div className="flex items-center gap-3">
                                    <Avatar src={transaction.avatarUrl} alt={transaction.description} size="sm" initials={transaction.initials} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-primary">{transaction.description}</p>
                                        <p className="text-sm text-tertiary lg:hidden">
                                            {transaction.categorie.icone} {transaction.categorie.nom} · {formatDateTime(transaction.date)}
                                        </p>
                                    </div>
                                </div>
                            </Table.Cell>

                            <Table.Cell>
                                <span
                                    className={cx(
                                        "text-sm font-semibold whitespace-nowrap",
                                        transaction.montant > 0
                                            ? "text-finance-gain"
                                            : transaction.type === "Transfert"
                                              ? "text-warning-primary"
                                              : "text-primary",
                                    )}
                                >
                                    {formatCurrency(transaction.montant)}
                                </span>
                            </Table.Cell>

                            <Table.Cell className="whitespace-nowrap max-lg:hidden">
                                <div className="flex flex-col">
                                    <span className="text-sm text-primary">{formatDate(transaction.date)}</span>
                                    <span className="text-sm text-tertiary">{formatTime(transaction.date)}</span>
                                </div>
                            </Table.Cell>

                            <Table.Cell className="max-lg:hidden">
                                <Badge type="pill-color" size="sm" color="gray">
                                    {transaction.categorie.icone} {transaction.categorie.nom}
                                </Badge>
                            </Table.Cell>

                            <Table.Cell className="max-lg:hidden">
                                <div className="flex flex-col">
                                    <p className="text-sm font-medium text-primary">{transaction.compte.nom}</p>
                                    <p className="text-sm text-tertiary">{transaction.compte.banque}</p>
                                </div>
                            </Table.Cell>

                            <Table.Cell>
                                <div className="flex gap-1">
                                    <Button size="sm" color="link-gray" iconLeading={Edit01} aria-label="Modifier" />
                                    <Button size="sm" color="link-gray" iconLeading={Trash01} aria-label="Supprimer" />
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        </TableCard.Root>
    );

    // Rendu vue Liste condensée
    const renderListView = () => (
        <div className="flex flex-col gap-6">
            {transactionsByDay.map((group) => (
                <div key={group.date} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                        <p className="text-sm font-semibold text-primary capitalize">{group.label}</p>
                        <p className={cx("text-sm font-medium", group.total >= 0 ? "text-finance-gain" : "text-finance-loss")}>
                            {group.total >= 0 ? "+" : ""}
                            {formatCurrencySimple(group.total)}
                        </p>
                    </div>
                    <div className="flex flex-col divide-y divide-secondary rounded-xl ring-1 ring-secondary">
                        {group.transactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between gap-4 px-4 py-3">
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <Avatar src={t.avatarUrl} alt={t.description} size="sm" initials={t.initials} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-primary">{t.description}</p>
                                        <p className="text-xs text-tertiary">
                                            {t.categorie.icone} {t.categorie.nom} · {formatTime(t.date)}
                                        </p>
                                    </div>
                                </div>
                                <span className={cx("text-sm font-semibold whitespace-nowrap", t.montant > 0 ? "text-finance-gain" : "text-primary")}>
                                    {formatCurrency(t.montant)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    // Rendu vue Calendrier
    const renderCalendarView = () => (
        <div className="flex flex-col gap-4 rounded-xl p-4 ring-1 ring-secondary lg:p-6">
            {/* Header calendrier */}
            <div className="flex items-center justify-between">
                <Button
                    size="sm"
                    color="secondary"
                    iconLeading={ChevronLeft}
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                    aria-label="Mois précédent"
                />
                <p className="text-lg font-semibold text-primary capitalize">{calendarMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>
                <Button
                    size="sm"
                    color="secondary"
                    iconLeading={ChevronRight}
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                    aria-label="Mois suivant"
                />
            </div>

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                    <div key={day} className="py-2 text-center text-xs font-medium text-tertiary">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grille des jours */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                    const dayTotal = day.transactions.reduce((acc, t) => acc + t.montant, 0);
                    const hasTransactions = day.transactions.length > 0;

                    return (
                        <div
                            key={index}
                            className={cx(
                                "flex min-h-20 flex-col gap-1 rounded-lg p-2 transition-colors lg:min-h-24",
                                day.isCurrentMonth ? "bg-primary" : "bg-secondary",
                                hasTransactions && "cursor-pointer hover:bg-secondary",
                            )}
                        >
                            <span className={cx("text-xs font-medium", day.isCurrentMonth ? "text-primary" : "text-quaternary")}>{day.date.getDate()}</span>
                            {hasTransactions && (
                                <>
                                    <span className={cx("text-xs font-semibold", dayTotal >= 0 ? "text-finance-gain" : "text-finance-loss")}>
                                        {dayTotal >= 0 ? "+" : ""}
                                        {Math.abs(dayTotal).toFixed(0)}€
                                    </span>
                                    <span className="text-xs text-tertiary">{day.transactions.length} tr.</span>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // Handler création transaction
    const handleCreateTransaction = () => {
        // Logique de création (à connecter à un backend/state global)
        console.log("Nouvelle transaction:", newTransaction);
        setIsModalOpen(false);
        setNewTransaction({
            type: "Dépense",
            description: "",
            montant: "",
            categorieId: "",
            compteId: comptes[0].id,
        });
    };

    // Rendu principal
    return (
        <div className="flex min-h-screen flex-col">
            {/* Modal création transaction */}
            <ModalOverlay isOpen={isModalOpen} onOpenChange={setIsModalOpen} isDismissable>
                <Modal className="max-w-lg">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-lg font-semibold text-primary">Nouvelle transaction</h2>
                                        <p className="text-sm text-tertiary">Ajoutez une entrée ou sortie d'argent</p>
                                    </div>
                                    <Button size="sm" color="tertiary" iconLeading={X} onClick={close} aria-label="Fermer" />
                                </div>

                                {/* Type de transaction */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-secondary">Type</label>
                                    <ButtonGroup
                                        selectedKeys={[newTransaction.type]}
                                        onSelectionChange={(keys) =>
                                            setNewTransaction((prev) => ({ ...prev, type: Array.from(keys)[0] as TransactionType }))
                                        }
                                        selectionMode="single"
                                    >
                                        <ButtonGroupItem id="Dépense">Dépense</ButtonGroupItem>
                                        <ButtonGroupItem id="Revenu">Revenu</ButtonGroupItem>
                                        <ButtonGroupItem id="Transfert">Transfert</ButtonGroupItem>
                                    </ButtonGroup>
                                </div>

                                {/* Description */}
                                <Input
                                    label="Description"
                                    placeholder="Ex: Carrefour, Salaire..."
                                    value={newTransaction.description}
                                    onChange={(value) => setNewTransaction((prev) => ({ ...prev, description: value }))}
                                />

                                {/* Montant */}
                                <Input
                                    label="Montant (€)"
                                    type="number"
                                    placeholder="0.00"
                                    value={newTransaction.montant}
                                    onChange={(value) => setNewTransaction((prev) => ({ ...prev, montant: value }))}
                                />

                                {/* Catégorie */}
                                <Select
                                    label="Catégorie"
                                    selectedKey={newTransaction.categorieId}
                                    onSelectionChange={(value) => setNewTransaction((prev) => ({ ...prev, categorieId: value as string }))}
                                    items={categories
                                        .filter((c) => (newTransaction.type === "Revenu" ? c.type === "Revenu" : c.type === "Dépense"))
                                        .map((c) => ({ id: c.id, label: `${c.icone} ${c.nom}` }))}
                                >
                                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                </Select>

                                {/* Compte */}
                                <Select
                                    label="Compte"
                                    selectedKey={newTransaction.compteId}
                                    onSelectionChange={(value) => setNewTransaction((prev) => ({ ...prev, compteId: value as string }))}
                                    items={comptes
                                        .filter((c) => c.statut === "Actif")
                                        .map((c) => ({ id: c.id, label: `${c.nom} (${c.banque})` }))}
                                >
                                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                </Select>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 border-t border-secondary pt-6">
                                    <Button color="secondary" onClick={close}>
                                        Annuler
                                    </Button>
                                    <Button
                                        color="primary"
                                        onClick={handleCreateTransaction}
                                        isDisabled={!newTransaction.description || !newTransaction.montant}
                                    >
                                        Créer la transaction
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>

            <main className="flex w-full flex-1 flex-col gap-4 bg-secondary_subtle pt-6 pb-12 lg:gap-8 lg:bg-primary lg:pt-8 lg:pb-24">
                {/* Header */}
                <div className="mx-auto flex w-full max-w-container flex-col gap-5 px-4 lg:px-8">
                    <div className="relative flex flex-col gap-4 border-b border-secondary pb-5">
                        {/* Breadcrumbs desktop */}
                        <div className="max-lg:hidden">
                            <Breadcrumbs type="button">
                                <Breadcrumbs.Item href="#" icon={HomeLine} />
                                <Breadcrumbs.Item href="/">Dashboard</Breadcrumbs.Item>
                                <Breadcrumbs.Item href="/transactions">Transactions</Breadcrumbs.Item>
                            </Breadcrumbs>
                        </div>

                        {/* Bouton retour mobile */}
                        <div className="flex lg:hidden">
                            <Button href="/" color="link-gray" size="md" iconLeading={ArrowLeft}>
                                Retour
                            </Button>
                        </div>

                        {/* Titre et actions */}
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-xl font-semibold text-primary lg:text-display-xs">Transactions</h1>
                                    <Badge type="modern" size="md">
                                        {filteredTransactions.length} résultat{filteredTransactions.length > 1 ? "s" : ""}
                                    </Badge>
                                </div>
                                <p className="text-sm text-tertiary">Gérez et suivez toutes vos entrées et sorties d'argent</p>
                            </div>

                            <div className="flex gap-3">
                                <Button iconLeading={Download04} color="secondary" size="md" onClick={handleExport}>
                                    <span className="max-sm:hidden">Exporter</span>
                                </Button>
                                <Button iconLeading={Plus} color="primary" size="md" onClick={() => setIsModalOpen(true)}>
                                    <span className="max-sm:hidden">Nouvelle transaction</span>
                                    <span className="sm:hidden">Ajouter</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenu */}
                <div className="mx-auto flex w-full max-w-container flex-col gap-6 px-4 lg:flex-row lg:gap-8 lg:px-8">
                    {/* Contenu principal */}
                    <div className="flex min-w-0 flex-1 flex-col gap-6">
                        {/* Barre de filtres */}
                        <div className="flex flex-col gap-4">
                            {/* Ligne 1 : Période et Type (ButtonGroups) */}
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
                                <div className="flex-1 overflow-x-auto">
                                    <ButtonGroup
                                        selectedKeys={[periode]}
                                        onSelectionChange={(keys) => setPeriode(Array.from(keys)[0] as string)}
                                        selectionMode="single"
                                    >
                                        <ButtonGroupItem id="7-days">7 jours</ButtonGroupItem>
                                        <ButtonGroupItem id="30-days">30 jours</ButtonGroupItem>
                                        <ButtonGroupItem id="this-month">Ce mois</ButtonGroupItem>
                                        <ButtonGroupItem id="3-months">3 mois</ButtonGroupItem>
                                        <ButtonGroupItem id="this-year">Cette année</ButtonGroupItem>
                                        <ButtonGroupItem id="all">Tout</ButtonGroupItem>
                                    </ButtonGroup>
                                </div>
                                <div className="shrink-0 overflow-x-auto">
                                    <ButtonGroup
                                        selectedKeys={[typeFilter]}
                                        onSelectionChange={(keys) => setTypeFilter(Array.from(keys)[0] as string)}
                                        selectionMode="single"
                                    >
                                        <ButtonGroupItem id="all">Tout</ButtonGroupItem>
                                        <ButtonGroupItem id="Dépense">Dépenses</ButtonGroupItem>
                                        <ButtonGroupItem id="Revenu">Revenus</ButtonGroupItem>
                                        <ButtonGroupItem id="Transfert">Transferts</ButtonGroupItem>
                                    </ButtonGroup>
                                </div>
                            </div>

                            {/* Ligne 2 : Recherche, Catégorie, Compte, Vue */}
                            <div className="flex flex-col gap-3 rounded-xl bg-secondary p-4 ring-1 ring-secondary ring-inset lg:flex-row lg:items-end lg:p-5">
                                <Input
                                    className="flex-1 lg:max-w-80"
                                    size="sm"
                                    aria-label="Rechercher"
                                    placeholder="Rechercher une transaction..."
                                    icon={SearchLg}
                                    value={searchQuery}
                                    onChange={(value) => setSearchQuery(value)}
                                />

                                <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                                    <Select
                                        className="flex-1"
                                        label="Catégorie"
                                        size="sm"
                                        selectedKey={categorieFilter}
                                        onSelectionChange={(value) => setCategorieFilter(value as string)}
                                        items={[
                                            { id: "all", label: "Toutes les catégories" },
                                            ...categories.map((c) => ({
                                                id: c.id,
                                                label: `${c.icone} ${c.nom}`,
                                            })),
                                        ]}
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select>

                                    <Select
                                        className="flex-1"
                                        label="Compte"
                                        size="sm"
                                        selectedKey={compteFilter}
                                        onSelectionChange={(value) => setCompteFilter(value as string)}
                                        items={[
                                            { id: "all", label: "Tous les comptes" },
                                            ...comptes
                                                .filter((c) => c.statut !== "Fermé")
                                                .map((c) => ({
                                                    id: c.id,
                                                    label: `${c.nom} (${c.banque})`,
                                                })),
                                        ]}
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select>
                                </div>

                                {/* Toggle vue */}
                                <div className="flex gap-1 rounded-lg bg-primary p-1 ring-1 ring-secondary">
                                    <Button
                                        size="sm"
                                        color={viewMode === "table" ? "secondary" : "tertiary"}
                                        iconLeading={TableIcon}
                                        onClick={() => setViewMode("table")}
                                        aria-label="Vue tableau"
                                    />
                                    <Button
                                        size="sm"
                                        color={viewMode === "list" ? "secondary" : "tertiary"}
                                        iconLeading={List}
                                        onClick={() => setViewMode("list")}
                                        aria-label="Vue liste"
                                    />
                                    <Button
                                        size="sm"
                                        color={viewMode === "calendar" ? "secondary" : "tertiary"}
                                        iconLeading={CalendarIcon}
                                        onClick={() => setViewMode("calendar")}
                                        aria-label="Vue calendrier"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contenu principal ou état vide */}
                        {sortedTransactions.length === 0 ? (
                            renderEmptyState()
                        ) : (
                            <>
                                {viewMode === "table" && renderTableView()}
                                {viewMode === "list" && renderListView()}
                                {viewMode === "calendar" && renderCalendarView()}

                                {/* Pagination (sauf calendrier) */}
                                {viewMode !== "calendar" && (
                                    <PaginationPageDefault page={1} total={Math.ceil(sortedTransactions.length / 10)} className="border-t-0 pt-4" />
                                )}
                            </>
                        )}
                    </div>

                    {/* Sidebar droite */}
                    <div className="hidden w-72 shrink-0 flex-col gap-6 xl:flex">
                        {/* Résumé période */}
                        <div className="flex flex-col gap-4 rounded-xl bg-secondary p-5 ring-1 ring-secondary ring-inset">
                            <p className="text-sm font-semibold text-primary">Résumé période</p>

                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-tertiary">Revenus</span>
                                    <span className="text-sm font-semibold text-finance-gain">+{formatCurrencySimple(totals.revenus)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-tertiary">Dépenses</span>
                                    <span className="text-sm font-semibold text-finance-loss">-{formatCurrencySimple(totals.depenses)}</span>
                                </div>
                                <div className="border-t border-secondary pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-primary">Balance</span>
                                        <span className={cx("text-sm font-bold", totals.balance >= 0 ? "text-finance-gain" : "text-finance-loss")}>
                                            {totals.balance >= 0 ? "+" : ""}
                                            {formatCurrencySimple(totals.balance)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top catégories */}
                        <div className="flex flex-col gap-4 rounded-xl bg-secondary p-5 ring-1 ring-secondary ring-inset">
                            <p className="text-sm font-semibold text-primary">Top 5 dépenses</p>

                            <div className="flex flex-col gap-3">
                                {topCategories.length > 0 ? (
                                    topCategories.map((cat, index) => (
                                        <div key={cat.nom} className="flex items-center gap-3">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-tertiary ring-1 ring-secondary">
                                                {index + 1}
                                            </span>
                                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                                <span>{cat.icone}</span>
                                                <span className="truncate text-sm text-tertiary">{cat.nom}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-primary">{formatCurrencySimple(cat.montant)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-tertiary">Aucune dépense sur cette période</p>
                                )}
                            </div>
                        </div>

                        {/* Graphique mini */}
                        <div className="flex flex-col gap-4 rounded-xl bg-secondary p-5 ring-1 ring-secondary ring-inset">
                            <p className="text-sm font-semibold text-primary">Dépenses 7 derniers jours</p>

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
            </main>
        </div>
    );
};

export default TransactionsPage;
