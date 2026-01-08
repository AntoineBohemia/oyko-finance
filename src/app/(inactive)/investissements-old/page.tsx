"use client";

import { Fragment, useMemo, useState } from "react";
import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
    BarChartSquare02,
    CheckDone01,
    ChevronDown,
    CurrencyBitcoin,
    CurrencyDollarCircle,
    DownloadCloud02,
    Edit01,
    FilterLines,
    HomeLine,
    LineChartUp01,
    MessageChatCircle,
    PieChart03,
    Plus,
    Rows01,
    SearchLg,
    Settings01,
    Trash01,
    TrendDown01,
    TrendUp01,
    Users01,
    X,
    Zap,
} from "@untitledui/icons";
import type { SortDescriptor } from "react-aria-components";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    Pie,
    PieChart,
    PolarAngleAxis,
    RadialBar,
    RadialBarChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";
import { FeedItem } from "@/components/application/activity-feed/activity-feed";
import { SidebarNavigationSlim } from "@/components/application/app-navigation/sidebar-navigation/sidebar-slim";
import { ChartLegendContent, ChartTooltipContent } from "@/components/application/charts/charts-base";
import { MetricChangeIndicator, MetricsSimple } from "@/components/application/metrics/metrics";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { PaginationCardMinimal } from "@/components/application/pagination/pagination";
import { Table, TableCard, TableRowActionsDropdown } from "@/components/application/table/table";
import { TabList, Tabs } from "@/components/application/tabs/tabs";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { Select } from "@/components/base/select/select";
import { TextArea } from "@/components/base/textarea/textarea";
import { Dot } from "@/components/foundations/dot-icon";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { cx } from "@/utils/cx";

// ============================================
// TYPES
// ============================================

type InvestissementType = "ETF" | "Actions" | "Crypto" | "Immobilier" | "Obligations";
type Strategie = "Long terme" | "Court terme" | "DCA";

interface Investissement {
    id: string;
    nom: string;
    ticker: string;
    type: InvestissementType;
    plateforme: string;
    quantite: number;
    prixAchat: number;
    prixActuel: number;
    dateAchat: Date;
    strategie: Strategie;
    couleur: string;
    imageUrl?: string;
    sparkline: number[];
}

interface Transaction {
    id: string;
    type: "Achat" | "Vente" | "Dividende";
    actif: string;
    ticker: string;
    quantite: number;
    prix: number;
    date: Date;
    avatarUrl?: string;
}

// ============================================
// DONNÉES - INVESTISSEMENTS
// ============================================

const investissements: Investissement[] = [
    {
        id: "inv-1",
        nom: "MSCI World",
        ticker: "IWDA",
        type: "ETF",
        plateforme: "Trade Republic",
        quantite: 12,
        prixAchat: 78.5,
        prixActuel: 82.3,
        dateAchat: new Date(2024, 2, 15),
        strategie: "Long terme",
        couleur: "#7c3aed",
        imageUrl: "https://www.untitledui.com/logos/images/Ephemeral.jpg",
        sparkline: [78, 79, 77, 80, 79, 81, 80, 82, 81, 83, 82, 82.3],
    },
    {
        id: "inv-2",
        nom: "S&P 500",
        ticker: "VUAA",
        type: "ETF",
        plateforme: "Trade Republic",
        quantite: 8,
        prixAchat: 85.2,
        prixActuel: 91.4,
        dateAchat: new Date(2024, 5, 1),
        strategie: "Long terme",
        couleur: "#06b6d4",
        imageUrl: "https://www.untitledui.com/logos/images/Warpspeed.jpg",
        sparkline: [85, 84, 86, 87, 88, 87, 89, 90, 89, 91, 90, 91.4],
    },
    {
        id: "inv-3",
        nom: "Bitcoin",
        ticker: "BTC",
        type: "Crypto",
        plateforme: "Trade Republic",
        quantite: 0.015,
        prixAchat: 42000,
        prixActuel: 44500,
        dateAchat: new Date(2024, 8, 10),
        strategie: "Long terme",
        couleur: "#f59e0b",
        imageUrl: "https://www.untitledui.com/logos/images/CloudWatch.jpg",
        sparkline: [42000, 41000, 43000, 44000, 42500, 43500, 45000, 44000, 43000, 44500, 45000, 44500],
    },
    {
        id: "inv-4",
        nom: "Euro Stoxx 50",
        ticker: "SX5E",
        type: "ETF",
        plateforme: "Boursorama",
        quantite: 15,
        prixAchat: 45.8,
        prixActuel: 44.2,
        dateAchat: new Date(2024, 10, 5),
        strategie: "Long terme",
        couleur: "#ef4444",
        imageUrl: "https://www.untitledui.com/logos/images/ContrastAI.jpg",
        sparkline: [46, 47, 46, 45, 46, 45, 44, 45, 44, 43, 44, 44.2],
    },
    {
        id: "inv-5",
        nom: "Ethereum",
        ticker: "ETH",
        type: "Crypto",
        plateforme: "Trade Republic",
        quantite: 0.25,
        prixAchat: 2200,
        prixActuel: 2450,
        dateAchat: new Date(2024, 9, 20),
        strategie: "Court terme",
        couleur: "#6366f1",
        imageUrl: "https://www.untitledui.com/logos/images/Stack3d Lab.jpg",
        sparkline: [2200, 2100, 2300, 2250, 2400, 2350, 2500, 2450, 2400, 2500, 2480, 2450],
    },
    {
        id: "inv-6",
        nom: "Nasdaq 100",
        ticker: "QQQ",
        type: "ETF",
        plateforme: "Trade Republic",
        quantite: 5,
        prixAchat: 420,
        prixActuel: 445,
        dateAchat: new Date(2024, 7, 12),
        strategie: "DCA",
        couleur: "#10b981",
        imageUrl: "https://www.untitledui.com/logos/images/Convergence.jpg",
        sparkline: [420, 425, 430, 428, 435, 440, 438, 442, 445, 443, 448, 445],
    },
    {
        id: "inv-7",
        nom: "Emerging Markets",
        ticker: "IEMG",
        type: "ETF",
        plateforme: "Trade Republic",
        quantite: 20,
        prixAchat: 52.3,
        prixActuel: 49.8,
        dateAchat: new Date(2024, 11, 1),
        strategie: "Long terme",
        couleur: "#ec4899",
        imageUrl: "https://www.untitledui.com/logos/images/Sisyphus.jpg",
        sparkline: [52, 51, 50, 51, 50, 49, 50, 49, 48, 50, 49, 49.8],
    },
];

// ============================================
// DONNÉES - TRANSACTIONS RÉCENTES
// ============================================

const transactionsRecentes: Transaction[] = [
    {
        id: "tx-1",
        type: "Achat",
        actif: "MSCI World",
        ticker: "IWDA",
        quantite: 2,
        prix: 82.3,
        date: new Date(2026, 0, 2),
        avatarUrl: "https://www.untitledui.com/images/avatars/demi-wilkinson?fm=webp&q=80",
    },
    {
        id: "tx-2",
        type: "Achat",
        actif: "Bitcoin",
        ticker: "BTC",
        quantite: 0.005,
        prix: 44500,
        date: new Date(2025, 11, 28),
        avatarUrl: "https://www.untitledui.com/images/avatars/aliah-lane?fm=webp&q=80",
    },
    {
        id: "tx-3",
        type: "Dividende",
        actif: "S&P 500",
        ticker: "VUAA",
        quantite: 0,
        prix: 12.5,
        date: new Date(2025, 11, 15),
        avatarUrl: "https://www.untitledui.com/images/avatars/lana-steiner?fm=webp&q=80",
    },
    {
        id: "tx-4",
        type: "Achat",
        actif: "Nasdaq 100",
        ticker: "QQQ",
        quantite: 1,
        prix: 442,
        date: new Date(2025, 11, 10),
        avatarUrl: "https://www.untitledui.com/images/avatars/candice-wu?fm=webp&q=80",
    },
    {
        id: "tx-5",
        type: "Vente",
        actif: "Euro Stoxx 50",
        ticker: "SX5E",
        quantite: 5,
        prix: 44.8,
        date: new Date(2025, 11, 5),
        avatarUrl: "https://www.untitledui.com/images/avatars/ava-wright?fm=webp&q=80",
    },
    {
        id: "tx-6",
        type: "Achat",
        actif: "Ethereum",
        ticker: "ETH",
        quantite: 0.1,
        prix: 2380,
        date: new Date(2025, 10, 28),
        avatarUrl: "https://www.untitledui.com/images/avatars/koray-okumus?fm=webp&q=80",
    },
    {
        id: "tx-7",
        type: "Achat",
        actif: "MSCI World",
        ticker: "IWDA",
        quantite: 3,
        prix: 79.5,
        date: new Date(2025, 10, 15),
        avatarUrl: "https://www.untitledui.com/images/avatars/andi-lane?fm=webp&q=80",
    },
    {
        id: "tx-8",
        type: "Dividende",
        actif: "Nasdaq 100",
        ticker: "QQQ",
        quantite: 0,
        prix: 8.2,
        date: new Date(2025, 10, 1),
        avatarUrl: "https://www.untitledui.com/images/avatars/drew-cano?fm=webp&q=80",
    },
    {
        id: "tx-9",
        type: "Achat",
        actif: "S&P 500",
        ticker: "VUAA",
        quantite: 2,
        prix: 88.5,
        date: new Date(2025, 9, 20),
        avatarUrl: "https://www.untitledui.com/images/avatars/zahir-mays?fm=webp&q=80",
    },
    {
        id: "tx-10",
        type: "Achat",
        actif: "Emerging Markets",
        ticker: "IEMG",
        quantite: 10,
        prix: 51.2,
        date: new Date(2025, 9, 5),
        avatarUrl: "https://www.untitledui.com/images/avatars/rene-wells?fm=webp&q=80",
    },
];

// ============================================
// DONNÉES - ÉVOLUTION PORTFOLIO
// ============================================

const evolutionPortfolio = [
    { date: "2025-01-01", valeur: 2800, investi: 2500 },
    { date: "2025-02-01", valeur: 2950, investi: 2700 },
    { date: "2025-03-01", valeur: 3100, investi: 2900 },
    { date: "2025-04-01", valeur: 3050, investi: 3100 },
    { date: "2025-05-01", valeur: 3300, investi: 3300 },
    { date: "2025-06-01", valeur: 3450, investi: 3500 },
    { date: "2025-07-01", valeur: 3600, investi: 3700 },
    { date: "2025-08-01", valeur: 3750, investi: 3900 },
    { date: "2025-09-01", valeur: 3650, investi: 4100 },
    { date: "2025-10-01", valeur: 3900, investi: 4300 },
    { date: "2025-11-01", valeur: 4100, investi: 4500 },
    { date: "2025-12-01", valeur: 4350, investi: 4500 },
];

// ============================================
// DONNÉES - RADIAL CHART (Performance par année)
// ============================================

const radialData = [
    { name: "2024", value: 680, className: "text-utility-brand-400" },
    { name: "2025", value: 820, className: "text-utility-brand-600" },
    { name: "2026", value: 920, className: "text-utility-brand-700" },
];

// ============================================
// HELPERS
// ============================================

const formatCurrency = (amount: number): string => amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

const formatCurrencyCompact = (amount: number): string => {
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k €`;
    return `${amount.toFixed(0)} €`;
};

const formatPercent = (value: number): string => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
};

const formatDate = (date: Date): string => date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

const getInitials = (name: string): string => {
    const words = name.split(" ");
    return words
        .map((w) => w.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();
};

// ============================================
// CALCULS (statiques)
// ============================================

const totalInvesti = investissements.reduce((acc, inv) => acc + inv.quantite * inv.prixAchat, 0);
const totalActuel = investissements.reduce((acc, inv) => acc + inv.quantite * inv.prixActuel, 0);
const plusValue = totalActuel - totalInvesti;
const plusValuePercent = (plusValue / totalInvesti) * 100;

const performances = investissements.map((inv) => {
    const valeurAchat = inv.quantite * inv.prixAchat;
    const valeurActuelle = inv.quantite * inv.prixActuel;
    const pv = valeurActuelle - valeurAchat;
    const pvPercent = (pv / valeurAchat) * 100;
    return { ...inv, valeurAchat, valeurActuelle, plusValue: pv, plusValuePercent: pvPercent };
});

const topPerformers = [...performances].sort((a, b) => b.plusValuePercent - a.plusValuePercent).slice(0, 5);
const worstPerformers = [...performances].sort((a, b) => a.plusValuePercent - b.plusValuePercent).slice(0, 5);
const bestPerformer = topPerformers[0];
const worstPerformer = worstPerformers[0];

// ============================================
// RÉPARTITION PAR TYPE
// ============================================

const repartitionParType = [
    {
        name: "ETF",
        value: investissements.filter((i) => i.type === "ETF").reduce((acc, i) => acc + i.quantite * i.prixActuel, 0),
        className: "text-utility-brand-600",
    },
    {
        name: "Crypto",
        value: investissements.filter((i) => i.type === "Crypto").reduce((acc, i) => acc + i.quantite * i.prixActuel, 0),
        className: "text-utility-brand-400",
    },
    {
        name: "Actions",
        value: investissements.filter((i) => i.type === "Actions").reduce((acc, i) => acc + i.quantite * i.prixActuel, 0),
        className: "text-utility-brand-700",
    },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function InvestissementsPage() {
    const isDesktop = useBreakpoint("lg");
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();
    const [selectedActif, setSelectedActif] = useState<(typeof performances)[0] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddPositionOpen, setIsAddPositionOpen] = useState(false);

    const [newInvestissement, setNewInvestissement] = useState({
        nom: "",
        type: "" as InvestissementType | "",
        ticker: "",
        plateforme: "",
        quantite: "",
        prixAchat: "",
        prixActuel: "",
        dateAchat: "",
        strategie: "" as Strategie | "",
        notes: "",
    });

    const [addPosition, setAddPosition] = useState({
        quantite: "",
        prix: "",
        date: "",
    });

    const sortedItems = useMemo(() => {
        if (!sortDescriptor) return performances;

        return performances.toSorted((a, b) => {
            const first = a[sortDescriptor.column as keyof typeof a];
            const second = b[sortDescriptor.column as keyof typeof b];

            if (typeof first === "number" && typeof second === "number") {
                return sortDescriptor.direction === "ascending" ? first - second : second - first;
            }
            if (typeof first === "string" && typeof second === "string") {
                const result = first.localeCompare(second);
                return sortDescriptor.direction === "ascending" ? result : -result;
            }
            return 0;
        });
    }, [sortDescriptor, performances]);

    const handleCreateInvestissement = () => {
        console.log("Nouvel investissement:", newInvestissement);
        setIsModalOpen(false);
        setNewInvestissement({
            nom: "",
            type: "",
            ticker: "",
            plateforme: "",
            quantite: "",
            prixAchat: "",
            prixActuel: "",
            dateAchat: "",
            strategie: "",
            notes: "",
        });
    };

    const handleAddPosition = () => {
        console.log("Ajouter position:", addPosition, "à", selectedActif?.nom);
        setIsAddPositionOpen(false);
        setAddPosition({ quantite: "", prix: "", date: "" });
    };

    return (
        <div className="flex flex-col bg-primary lg:flex-row">
            <SidebarNavigationSlim
                activeUrl="/investissements"
                items={[
                    { label: "Accueil", href: "/", icon: HomeLine },
                    { label: "Dashboard", href: "/dashboard", icon: BarChartSquare02 },
                    { label: "Transactions", href: "/transactions", icon: Rows01 },
                    { label: "Comptes", href: "/comptes", icon: CurrencyDollarCircle },
                    { label: "Investissements", href: "/investissements", icon: LineChartUp01 },
                    { label: "Budget", href: "/budget", icon: PieChart03 },
                ]}
                footerItems={[
                    { label: "Paramètres", href: "/settings", icon: Settings01 },
                    { label: "Support", href: "/support", icon: MessageChatCircle },
                ]}
            />

            <main className="flex min-w-0 flex-1 flex-col gap-8 pt-8 pb-12">
                {/* Page header */}
                <div className="flex flex-col gap-5 px-4 lg:px-8">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row">
                        <div className="flex flex-col gap-0.5 lg:gap-1">
                            <p className="text-xl font-semibold text-primary lg:text-display-xs">Investissements</p>
                            <p className="text-md text-tertiary">Suivez la performance de votre portfolio.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button size="md" color="secondary" iconLeading={DownloadCloud02}>
                                Exporter
                            </Button>
                            <Button size="md" iconLeading={Plus} onClick={() => setIsModalOpen(true)}>
                                Nouvel investissement
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between gap-4 lg:flex-row">
                        <ButtonGroup defaultSelectedKeys={["12-months"]}>
                            <ButtonGroupItem id="1-month">
                                <span className="max-lg:hidden">1 mois</span>
                                <span className="lg:hidden">1m</span>
                            </ButtonGroupItem>
                            <ButtonGroupItem id="3-months">
                                <span className="max-lg:hidden">3 mois</span>
                                <span className="lg:hidden">3m</span>
                            </ButtonGroupItem>
                            <ButtonGroupItem id="6-months">
                                <span className="max-lg:hidden">6 mois</span>
                                <span className="lg:hidden">6m</span>
                            </ButtonGroupItem>
                            <ButtonGroupItem id="12-months">
                                <span className="max-lg:hidden">1 an</span>
                                <span className="lg:hidden">1a</span>
                            </ButtonGroupItem>
                            <ButtonGroupItem id="max">Max</ButtonGroupItem>
                        </ButtonGroup>

                        <div className="flex gap-3">
                            <Button size="md" color="secondary" iconLeading={FilterLines}>
                                Filtres
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Métriques principales */}
                <div className="-my-2 flex w-full max-w-full flex-col gap-4 overflow-x-auto px-4 py-2 md:flex-row md:flex-wrap lg:gap-5 lg:px-8">
                    <MetricsSimple
                        title={formatCurrency(totalActuel)}
                        subtitle="Valeur actuelle"
                        type="modern"
                        trend={plusValuePercent >= 0 ? "positive" : "negative"}
                        change={`${plusValuePercent >= 0 ? "+" : ""}${plusValuePercent.toFixed(1)}%`}
                        className="flex-1 ring-2 ring-brand md:min-w-[280px]"
                    />
                    <MetricsSimple title={formatCurrency(totalInvesti)} subtitle="Valeur investie" type="modern" trend="positive" className="flex-1 md:min-w-[280px]" />
                    <MetricsSimple
                        title={formatCurrency(plusValue)}
                        subtitle="Plus-value totale"
                        type="modern"
                        trend={plusValue >= 0 ? "positive" : "negative"}
                        change={formatPercent(plusValuePercent)}
                        className="flex-1 md:min-w-[280px]"
                    />
                </div>

                {/* Graphiques section */}
                <div className="flex flex-col gap-8 px-4 lg:flex-row lg:gap-6 lg:px-8">
                    {/* Répartition Radial */}
                    <div className="flex flex-col gap-6 lg:w-60">
                        <div className="flex items-start justify-between border-b border-secondary pb-5">
                            <p className="text-lg font-semibold text-primary">Performance</p>
                            <TableRowActionsDropdown />
                        </div>
                        <div className="h-60 w-60">
                            <ResponsiveContainer>
                                <RadialBarChart
                                    data={radialData}
                                    accessibilityLayer
                                    innerRadius={64}
                                    outerRadius={122}
                                    startAngle={90}
                                    endAngle={360 + 90}
                                    className="font-medium text-tertiary [&_.recharts-polar-grid]:text-utility-gray-100 [&_.recharts-text]:text-sm"
                                >
                                    <PolarAngleAxis tick={false} domain={[0, 1000]} type="number" reversed />
                                    <RechartsTooltip content={<ChartTooltipContent isRadialChart />} />
                                    <RadialBar
                                        isAnimationActive={false}
                                        dataKey="value"
                                        cornerRadius={99}
                                        fill="currentColor"
                                        background={{ className: "fill-utility-gray-100" }}
                                    />
                                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                                        <tspan x="50%" dy="1%" className="fill-current text-display-sm font-semibold text-primary">
                                            {formatPercent(plusValuePercent).replace("+", "")}
                                        </tspan>
                                    </text>
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Légende */}
                        <div className="flex flex-col gap-2">
                            {radialData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={cx("h-2 w-2 rounded-full", item.className.replace("text-", "bg-"))} />
                                        <span className="text-sm text-tertiary">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-medium text-primary">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Évolution Portfolio */}
                    <div className="flex flex-1 flex-col gap-6">
                        <div className="flex items-start justify-between border-b border-secondary pb-5">
                            <div className="flex flex-col gap-2">
                                <p className="text-lg font-semibold text-primary">Évolution du portfolio</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-display-sm font-semibold text-primary">{formatCurrency(totalActuel)}</span>
                                    <MetricChangeIndicator
                                        type="trend"
                                        trend={plusValuePercent >= 0 ? "positive" : "negative"}
                                        value={formatPercent(plusValuePercent)}
                                    />
                                </div>
                            </div>
                            <TableRowActionsDropdown />
                        </div>
                        <div className="flex h-60 w-full flex-col gap-2">
                            <ResponsiveContainer className="h-full">
                                <AreaChart data={evolutionPortfolio} className="text-tertiary [&_.recharts-text]:text-xs">
                                    <defs>
                                        <linearGradient id="gradientValeur" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="currentColor" className="text-utility-brand-700" stopOpacity="0.7" />
                                            <stop offset="95%" stopColor="currentColor" className="text-utility-brand-700" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid vertical={false} stroke="currentColor" className="text-utility-gray-100" />

                                    <Legend verticalAlign="top" align="right" layout="horizontal" content={<ChartLegendContent className="-translate-y-2" />} />

                                    <XAxis
                                        fill="currentColor"
                                        axisLine={false}
                                        tickLine={false}
                                        tickMargin={10}
                                        padding={{ left: 10, right: 10 }}
                                        interval="preserveStartEnd"
                                        dataKey="date"
                                        tickFormatter={(value) => new Date(value).toLocaleDateString("fr-FR", { month: "short" })}
                                    />

                                    <RechartsTooltip
                                        content={<ChartTooltipContent />}
                                        formatter={(value) => formatCurrency(value as number)}
                                        labelFormatter={(value) => new Date(value).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                                        cursor={{ className: "stroke-utility-brand-600 stroke-2" }}
                                    />

                                    <Area
                                        isAnimationActive={false}
                                        className="text-utility-brand-600 [&_.recharts-area-area]:translate-y-[6px] [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]"
                                        dataKey="valeur"
                                        name="Valeur actuelle"
                                        type="linear"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        fill="url(#gradientValeur)"
                                        fillOpacity={0.1}
                                        activeDot={{ className: "fill-bg-primary stroke-utility-brand-600 stroke-2" }}
                                    />

                                    <Area
                                        isAnimationActive={false}
                                        className="text-utility-brand-400 [&_.recharts-area-area]:translate-y-[6px] [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]"
                                        dataKey="investi"
                                        name="Valeur investie"
                                        type="linear"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        fill="none"
                                        strokeDasharray="0.1 8"
                                        strokeLinecap="round"
                                        activeDot={{ className: "fill-bg-primary stroke-utility-brand-400 stroke-2" }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Top & Worst Performers (style Dashboard 19) */}
                <div className="flex flex-col gap-8 px-4 md:flex-row md:flex-wrap lg:px-8">
                    {/* Top Performers */}
                    <div className="flex flex-1 flex-col gap-2 md:min-w-[320px]">
                        <div className="flex items-start justify-between border-b border-secondary pb-5">
                            <div className="flex items-center gap-2">
                                <TrendUp01 className="h-5 w-5 text-finance-gain-subtle" />
                                <p className="text-lg font-semibold text-primary">Top performers</p>
                            </div>
                            <TableRowActionsDropdown />
                        </div>
                        <div className="flex flex-col gap-4">
                            <Table aria-label="Top performers">
                                <Table.Header className="hidden">
                                    <Table.Head id="actif" isRowHeader className="w-full" />
                                    <Table.Head id="perf" />
                                    <Table.Head id="action" />
                                </Table.Header>
                                <Table.Body items={topPerformers} className="border-b border-secondary">
                                    {(item) => (
                                        <Table.Row id={item.id}>
                                            <Table.Cell className="w-full px-0">
                                                <div className="flex cursor-pointer gap-3" onClick={() => setSelectedActif(item)}>
                                                    <Avatar size="md" src={item.imageUrl} alt={item.nom} initials={getInitials(item.nom)} />
                                                    <div>
                                                        <p className="text-sm font-medium text-primary">{item.nom}</p>
                                                        <p className="text-sm text-tertiary">{item.ticker}</p>
                                                    </div>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell className="text-sm font-medium text-nowrap text-finance-gain">
                                                {formatPercent(item.plusValuePercent)}
                                            </Table.Cell>
                                            <Table.Cell className="pr-0 pl-4">
                                                <ButtonUtility size="xs" color="tertiary" tooltip="Modifier" icon={Edit01} />
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table>
                            <div className="flex justify-end">
                                <Button size="md" color="link-color">
                                    Voir tout
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Worst Performers */}
                    <div className="flex flex-1 flex-col gap-2 md:min-w-[320px]">
                        <div className="flex items-start justify-between border-b border-secondary pb-5">
                            <div className="flex items-center gap-2">
                                <TrendDown01 className="h-5 w-5 text-finance-loss-subtle" />
                                <p className="text-lg font-semibold text-primary">Moins bons performers</p>
                            </div>
                            <TableRowActionsDropdown />
                        </div>
                        <div className="flex flex-col gap-4">
                            <Table aria-label="Worst performers">
                                <Table.Header className="hidden">
                                    <Table.Head id="actif" isRowHeader className="w-full" />
                                    <Table.Head id="perf" />
                                    <Table.Head id="action" />
                                </Table.Header>
                                <Table.Body items={worstPerformers} className="border-b border-secondary">
                                    {(item) => (
                                        <Table.Row id={item.id}>
                                            <Table.Cell className="w-full px-0">
                                                <div className="flex cursor-pointer gap-3" onClick={() => setSelectedActif(item)}>
                                                    <Avatar size="md" src={item.imageUrl} alt={item.nom} initials={getInitials(item.nom)} />
                                                    <div>
                                                        <p className="text-sm font-medium text-primary">{item.nom}</p>
                                                        <p className="text-sm text-tertiary">{item.ticker}</p>
                                                    </div>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell
                                                className={cx(
                                                    "text-sm font-medium text-nowrap",
                                                    item.plusValuePercent >= 0 ? "text-finance-gain" : "text-finance-loss",
                                                )}
                                            >
                                                {formatPercent(item.plusValuePercent)}
                                            </Table.Cell>
                                            <Table.Cell className="pr-0 pl-4">
                                                <ButtonUtility size="xs" color="tertiary" tooltip="Modifier" icon={Edit01} />
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table>
                            <div className="flex justify-end">
                                <Button size="md" color="link-color">
                                    Voir tout
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Portfolio complète */}
                <div className="flex w-full flex-col gap-6 px-4 lg:px-8">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <p className="text-lg font-semibold text-primary">Portfolio complet</p>
                        <Input icon={SearchLg} shortcut aria-label="Rechercher" placeholder="Rechercher" size="sm" className="w-full lg:w-80" />
                    </div>

                    <TableCard.Root className="-mx-4 rounded-none lg:mx-0 lg:rounded-xl">
                        <Table aria-label="Portfolio" selectionMode="multiple" sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor}>
                            <Table.Header>
                                <Table.Head id="nom" isRowHeader allowsSorting label="Actif" className="w-full" />
                                <Table.Head id="type" label="Type" />
                                <Table.Head id="quantite" label="Quantité" allowsSorting className="max-lg:hidden" />
                                <Table.Head id="prixAchat" label="Prix achat" allowsSorting className="max-lg:hidden" />
                                <Table.Head id="prixActuel" label="Prix actuel" allowsSorting className="max-lg:hidden" />
                                <Table.Head id="valeurActuelle" label="Valeur" allowsSorting />
                                <Table.Head id="plusValuePercent" label="+/- Value" allowsSorting />
                                <Table.Head id="actions" />
                            </Table.Header>
                            <Table.Body items={sortedItems}>
                                {(item) => (
                                    <Table.Row id={item.id} highlightSelectedRow={false}>
                                        <Table.Cell>
                                            <div className="flex cursor-pointer items-center gap-3" onClick={() => setSelectedActif(item)}>
                                                <Avatar src={item.imageUrl} alt={item.nom} initials={getInitials(item.nom)} size="md" />
                                                <div>
                                                    <p className="text-sm font-medium text-primary">{item.nom}</p>
                                                    <p className="text-sm text-tertiary">{item.ticker}</p>
                                                </div>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <BadgeWithDot
                                                size="sm"
                                                type="modern"
                                                color={item.type === "ETF" ? "brand" : item.type === "Crypto" ? "warning" : "gray"}
                                            >
                                                {item.type}
                                            </BadgeWithDot>
                                        </Table.Cell>
                                        <Table.Cell className="max-lg:hidden">{item.quantite}</Table.Cell>
                                        <Table.Cell className="max-lg:hidden">{formatCurrency(item.prixAchat)}</Table.Cell>
                                        <Table.Cell className="max-lg:hidden">{formatCurrency(item.prixActuel)}</Table.Cell>
                                        <Table.Cell className="font-semibold">{formatCurrency(item.valeurActuelle)}</Table.Cell>
                                        <Table.Cell>
                                            <div className="flex items-center gap-2">
                                                <span className={cx("text-sm font-medium", item.plusValuePercent >= 0 ? "text-finance-gain" : "text-finance-loss")}>
                                                    {formatPercent(item.plusValuePercent)}
                                                </span>
                                                {item.plusValuePercent >= 0 ? (
                                                    <ArrowUp className="h-4 w-4 text-finance-gain-subtle" />
                                                ) : (
                                                    <ArrowDown className="h-4 w-4 text-finance-loss-subtle" />
                                                )}
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell className="px-4">
                                            <div className="flex justify-end gap-0.5">
                                                <ButtonUtility
                                                    size="xs"
                                                    color="tertiary"
                                                    tooltip="Ajouter"
                                                    icon={Plus}
                                                    onClick={() => {
                                                        setSelectedActif(item);
                                                        setIsAddPositionOpen(true);
                                                    }}
                                                />
                                                <ButtonUtility size="xs" color="tertiary" tooltip="Modifier" icon={Edit01} />
                                                <ButtonUtility size="xs" color="tertiary" tooltip="Supprimer" icon={Trash01} />
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table>
                        <PaginationCardMinimal page={1} total={1} align="center" />
                    </TableCard.Root>
                </div>
            </main>

            {/* Sidebar droite - Activité (style Dashboard 10/19) */}
            <div className="sticky top-0 hidden h-svh w-72 flex-col overflow-hidden border-l border-secondary bg-secondary_subtle lg:flex">
                <div className="flex w-full flex-wrap items-start justify-between gap-4 border-b border-secondary bg-alpha-white/90 px-4 py-5 backdrop-blur lg:px-6">
                    <p className="text-lg font-semibold text-primary">Activité</p>
                    <Button size="md" color="link-gray">
                        Voir tout
                    </Button>
                </div>
                <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-6 lg:px-6">
                    {transactionsRecentes.slice(0, 12).map((tx) => (
                        <FeedItem
                            key={tx.id}
                            id={tx.id}
                            size="sm"
                            unseen={tx.date > new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)}
                            user={{ avatarUrl: tx.avatarUrl ?? "", href: "#", name: tx.actif }}
                            action={{
                                href: "#",
                                content: tx.type === "Achat" ? "Acheté" : tx.type === "Vente" ? "Vendu" : "Dividende reçu",
                                target: tx.type === "Dividende" ? formatCurrency(tx.prix) : `${tx.quantite} ${tx.ticker}`,
                            }}
                        />
                    ))}
                </div>

                {/* Best & Worst performer mini */}
                <div className="flex flex-col gap-4 border-t border-secondary bg-primary px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendUp01 className="h-4 w-4 text-finance-gain-subtle" />
                            <span className="text-sm text-tertiary">Meilleur</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-primary">{bestPerformer.ticker}</span>
                            <Badge type="pill-color" color="success" size="sm">
                                {formatPercent(bestPerformer.plusValuePercent)}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendDown01 className="h-4 w-4 text-finance-loss-subtle" />
                            <span className="text-sm text-tertiary">Pire</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-primary">{worstPerformer.ticker}</span>
                            <Badge type="pill-color" color={worstPerformer.plusValuePercent >= 0 ? "success" : "error"} size="sm">
                                {formatPercent(worstPerformer.plusValuePercent)}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modale Nouvel investissement */}
            <ModalOverlay isOpen={isModalOpen} onOpenChange={setIsModalOpen} isDismissable>
                <Modal className="max-w-lg">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                {/* Header */}
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-primary">Nouvel investissement</h2>
                                    <p className="text-sm text-tertiary">Ajoutez un nouvel actif à votre portfolio</p>
                                </div>

                                {/* Body */}
                                <div className="flex flex-col gap-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Nom"
                                            placeholder="Ex: MSCI World"
                                            value={newInvestissement.nom}
                                            onChange={(value) => setNewInvestissement({ ...newInvestissement, nom: value })}
                                            isRequired
                                        />
                                        <Input
                                            label="Ticker"
                                            placeholder="Ex: IWDA"
                                            value={newInvestissement.ticker}
                                            onChange={(value) => setNewInvestissement({ ...newInvestissement, ticker: value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Select
                                            label="Type"
                                            selectedKey={newInvestissement.type}
                                            onSelectionChange={(v) => setNewInvestissement({ ...newInvestissement, type: v as InvestissementType })}
                                            items={[
                                                { id: "ETF", label: "ETF" },
                                                { id: "Actions", label: "Actions" },
                                                { id: "Crypto", label: "Crypto" },
                                                { id: "Immobilier", label: "Immobilier" },
                                                { id: "Obligations", label: "Obligations" },
                                            ]}
                                            isRequired
                                        >
                                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                        </Select>

                                        <Select
                                            label="Plateforme"
                                            selectedKey={newInvestissement.plateforme}
                                            onSelectionChange={(v) => setNewInvestissement({ ...newInvestissement, plateforme: v as string })}
                                            items={[
                                                { id: "Trade Republic", label: "Trade Republic" },
                                                { id: "Boursorama", label: "Boursorama" },
                                                { id: "Degiro", label: "Degiro" },
                                                { id: "Autre", label: "Autre" },
                                            ]}
                                            isRequired
                                        >
                                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <Input
                                            label="Quantité"
                                            type="number"
                                            placeholder="0"
                                            value={newInvestissement.quantite}
                                            onChange={(value) => setNewInvestissement({ ...newInvestissement, quantite: value })}
                                            isRequired
                                        />
                                        <Input
                                            label="Prix achat (€)"
                                            type="number"
                                            placeholder="0.00"
                                            value={newInvestissement.prixAchat}
                                            onChange={(value) => setNewInvestissement({ ...newInvestissement, prixAchat: value })}
                                            isRequired
                                        />
                                        <Input
                                            label="Prix actuel (€)"
                                            type="number"
                                            placeholder="0.00"
                                            value={newInvestissement.prixActuel}
                                            onChange={(value) => setNewInvestissement({ ...newInvestissement, prixActuel: value })}
                                            isRequired
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Date d'achat"
                                            type="date"
                                            value={newInvestissement.dateAchat}
                                            onChange={(value) => setNewInvestissement({ ...newInvestissement, dateAchat: value })}
                                            isRequired
                                        />
                                        <Select
                                            label="Stratégie"
                                            selectedKey={newInvestissement.strategie}
                                            onSelectionChange={(v) => setNewInvestissement({ ...newInvestissement, strategie: v as Strategie })}
                                            items={[
                                                { id: "Long terme", label: "Long terme" },
                                                { id: "Court terme", label: "Court terme" },
                                                { id: "DCA", label: "DCA" },
                                            ]}
                                        >
                                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                        </Select>
                                    </div>

                                    <TextArea
                                        label="Notes (optionnel)"
                                        placeholder="Informations supplémentaires..."
                                        value={newInvestissement.notes}
                                        onChange={(value) => setNewInvestissement({ ...newInvestissement, notes: value })}
                                        rows={2}
                                    />
                                </div>

                                {/* Footer */}
                                <div className="flex gap-3">
                                    <Button color="secondary" size="lg" onClick={close} className="flex-1">
                                        Annuler
                                    </Button>
                                    <Button
                                        color="primary"
                                        size="lg"
                                        onClick={handleCreateInvestissement}
                                        className="flex-1"
                                        isDisabled={
                                            !newInvestissement.nom ||
                                            !newInvestissement.type ||
                                            !newInvestissement.plateforme ||
                                            !newInvestissement.quantite ||
                                            !newInvestissement.prixAchat ||
                                            !newInvestissement.prixActuel ||
                                            !newInvestissement.dateAchat
                                        }
                                    >
                                        Créer
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>

            {/* Modale Ajouter position */}
            <ModalOverlay isOpen={isAddPositionOpen} onOpenChange={setIsAddPositionOpen} isDismissable>
                <Modal className="max-w-md">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                {/* Header */}
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-primary">Renforcer {selectedActif?.nom || ""}</h2>
                                    <p className="text-sm text-tertiary">Ajoutez une position à cet actif existant</p>
                                </div>

                                {/* Body */}
                                <div className="flex flex-col gap-5">
                                    <Input
                                        label="Quantité"
                                        type="number"
                                        placeholder="0"
                                        value={addPosition.quantite}
                                        onChange={(value) => setAddPosition({ ...addPosition, quantite: value })}
                                        isRequired
                                    />
                                    <Input
                                        label="Prix unitaire (€)"
                                        type="number"
                                        placeholder="0.00"
                                        value={addPosition.prix}
                                        onChange={(value) => setAddPosition({ ...addPosition, prix: value })}
                                        isRequired
                                    />
                                    <Input
                                        label="Date"
                                        type="date"
                                        value={addPosition.date}
                                        onChange={(value) => setAddPosition({ ...addPosition, date: value })}
                                        isRequired
                                    />

                                    {selectedActif && addPosition.quantite && addPosition.prix && (
                                        <div className="rounded-lg bg-secondary p-4">
                                            <p className="text-sm text-tertiary">Nouveau prix moyen estimé :</p>
                                            <p className="text-lg font-semibold text-primary">
                                                {formatCurrency(
                                                    (selectedActif.quantite * selectedActif.prixAchat + Number(addPosition.quantite) * Number(addPosition.prix)) /
                                                        (selectedActif.quantite + Number(addPosition.quantite)),
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="flex gap-3">
                                    <Button color="secondary" size="lg" onClick={close} className="flex-1">
                                        Annuler
                                    </Button>
                                    <Button
                                        color="primary"
                                        size="lg"
                                        onClick={handleAddPosition}
                                        className="flex-1"
                                        isDisabled={!addPosition.quantite || !addPosition.prix || !addPosition.date}
                                    >
                                        Ajouter
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
