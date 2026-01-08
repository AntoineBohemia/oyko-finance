"use client";

import { useMemo, useState } from "react";
import {
    ArrowDown,
    ArrowUp,
    DownloadCloud02,
    Edit01,
    FilterLines,
    Plus,
    SearchLg,
    Trash01,
    TrendDown01,
    TrendUp01,
    X,
} from "@untitledui/icons";
import type { SortDescriptor } from "react-aria-components";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    PolarAngleAxis,
    RadialBar,
    RadialBarChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
} from "recharts";
import { FeedItem } from "@/components/application/activity-feed/activity-feed";
import { ChartLegendContent, ChartTooltipContent } from "@/components/application/charts/charts-base";
import { MetricChangeIndicator, MetricsSimple } from "@/components/application/metrics/metrics";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { PaginationCardMinimal } from "@/components/application/pagination/pagination";
import { Table, TableCard, TableRowActionsDropdown } from "@/components/application/table/table";
import { Avatar } from "@/components/base/avatar/avatar";
import { BadgeWithDot, Badge } from "@/components/base/badges/badges";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { TextArea } from "@/components/base/textarea/textarea";
import { cx } from "@/utils/cx";
import { createClient } from "@/lib/supabase/client";
import type {
    EvolutionPortfolio,
    RepartitionType,
    TotauxInvestissements,
    PerformanceAnnuelle,
} from "@/lib/data/investissements";
import type { Profile } from "@/types/database.types";

// ============================================
// TYPES
// ============================================

interface SerializedInvestissement {
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
    dateAchat: string | null;
    imageUrl: string | null;
    notes: string | null;
}

interface SerializedInvestissementsData {
    profile: Profile | null;
    investissements: SerializedInvestissement[];
    evolutionPortfolio: EvolutionPortfolio[];
    repartitionParType: RepartitionType[];
    totaux: TotauxInvestissements;
    performanceAnnuelle: PerformanceAnnuelle[];
}

interface InvestissementsClientProps {
    initialData: SerializedInvestissementsData;
}

// Types d'investissement disponibles
const INVESTMENT_TYPES = [
    { id: "ETF", label: "ETF" },
    { id: "Actions", label: "Actions" },
    { id: "Crypto", label: "Crypto" },
    { id: "Obligations", label: "Obligations" },
    { id: "Immobilier", label: "Immobilier" },
    { id: "Assurance-vie", label: "Assurance-vie" },
    { id: "PEA", label: "PEA" },
    { id: "Autre", label: "Autre" },
];

const PLATEFORMES = [
    { id: "Trade Republic", label: "Trade Republic" },
    { id: "Boursorama", label: "Boursorama" },
    { id: "Degiro", label: "Degiro" },
    { id: "Fortuneo", label: "Fortuneo" },
    { id: "Autre", label: "Autre" },
];

const STRATEGIES = [
    { id: "Long terme", label: "Long terme" },
    { id: "Court terme", label: "Court terme" },
    { id: "DCA", label: "DCA" },
];

// ============================================
// HELPERS
// ============================================

const formatCurrency = (amount: number): string =>
    amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

const formatPercent = (value: number): string => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
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
// COMPOSANT PRINCIPAL
// ============================================

export default function InvestissementsClient({ initialData }: InvestissementsClientProps) {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();
    const [selectedActif, setSelectedActif] = useState<SerializedInvestissement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddPositionOpen, setIsAddPositionOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [newInvestissement, setNewInvestissement] = useState({
        nom: "",
        type: "ETF",
        ticker: "",
        plateforme: "",
        quantite: "",
        prixAchat: "",
        prixActuel: "",
        dateAchat: "",
        strategie: "",
        notes: "",
    });

    const [addPosition, setAddPosition] = useState({
        quantite: "",
        prix: "",
        date: "",
    });

    // Donnees
    const profile = initialData.profile;
    const investissements = initialData.investissements;
    const evolutionPortfolio = initialData.evolutionPortfolio;
    const totaux = initialData.totaux;
    const performanceAnnuelle = initialData.performanceAnnuelle;

    // Calculs derives
    const topPerformers = useMemo(() => {
        return [...investissements].sort((a, b) => b.plusValuePercent - a.plusValuePercent).slice(0, 5);
    }, [investissements]);

    const worstPerformers = useMemo(() => {
        return [...investissements].sort((a, b) => a.plusValuePercent - b.plusValuePercent).slice(0, 5);
    }, [investissements]);

    const bestPerformer = topPerformers[0];
    const worstPerformer = worstPerformers[0];

    // Tri du tableau
    const sortedItems = useMemo(() => {
        if (!sortDescriptor) return investissements;

        return [...investissements].sort((a, b) => {
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
    }, [sortDescriptor, investissements]);

    // Handlers
    const resetNewInvestissement = () => {
        setNewInvestissement({
            nom: "",
            type: "ETF",
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

    const handleCreateInvestissement = async () => {
        if (!profile || !newInvestissement.nom || !newInvestissement.quantite || !newInvestissement.prixAchat) return;

        setIsSaving(true);
        const supabase = createClient();

        const quantite = parseFloat(newInvestissement.quantite);
        const prixAchat = parseFloat(newInvestissement.prixAchat);
        const prixActuel = newInvestissement.prixActuel ? parseFloat(newInvestissement.prixActuel) : prixAchat;

        const { error } = await supabase.from("investissements").insert({
            user_id: profile.id,
            nom: newInvestissement.nom,
            ticker: newInvestissement.ticker || null,
            type: newInvestissement.type,
            plateforme: newInvestissement.plateforme || null,
            quantite,
            prix_achat_unitaire: prixAchat,
            prix_actuel: prixActuel,
            date_achat: newInvestissement.dateAchat || null,
            notes: newInvestissement.notes || null,
        });

        if (!error) {
            setIsModalOpen(false);
            resetNewInvestissement();
            window.location.reload();
        }

        setIsSaving(false);
    };

    const handleAddPosition = async () => {
        if (!selectedActif || !addPosition.quantite || !addPosition.prix) return;

        setIsSaving(true);
        const supabase = createClient();

        const newQuantite = selectedActif.quantite + parseFloat(addPosition.quantite);
        const newPrixMoyen =
            (selectedActif.quantite * selectedActif.prixAchat + parseFloat(addPosition.quantite) * parseFloat(addPosition.prix)) /
            newQuantite;

        const { error } = await supabase
            .from("investissements")
            .update({
                quantite: newQuantite,
                prix_achat_unitaire: newPrixMoyen,
            })
            .eq("id", selectedActif.id);

        if (!error) {
            setIsAddPositionOpen(false);
            setAddPosition({ quantite: "", prix: "", date: "" });
            window.location.reload();
        }

        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cet investissement ?")) return;

        const supabase = createClient();
        const { error } = await supabase.from("investissements").delete().eq("id", id);

        if (!error) {
            window.location.reload();
        }
    };

    // Message si pas de donnees
    if (!profile) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-primary">
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-primary">Chargement...</h1>
                    <p className="text-tertiary">Recuperation de vos donnees...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-primary lg:flex-row">
            <main className="flex min-w-0 flex-1 flex-col gap-8 pt-8 pb-12">
                {/* Page header */}
                <div className="flex flex-col gap-5 px-4 lg:px-8">
                    <div className="flex flex-col gap-4 border-b border-secondary pb-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-xl font-semibold text-primary lg:text-display-xs">Investissements</h1>
                            <p className="text-sm text-tertiary">Suivez la performance de votre portfolio</p>
                        </div>
                        <div className="flex items-center gap-3">
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

                {/* Metriques principales */}
                <div className="-my-2 flex w-full max-w-full flex-col gap-4 overflow-x-auto px-4 py-2 md:flex-row md:flex-wrap lg:gap-5 lg:px-8">
                    <MetricsSimple
                        title={formatCurrency(totaux.totalActuel)}
                        subtitle="Valeur actuelle"
                        type="modern"
                        trend={totaux.plusValuePercent >= 0 ? "positive" : "negative"}
                        change={formatPercent(totaux.plusValuePercent)}
                        className="flex-1 ring-2 ring-brand md:min-w-[280px]"
                    />
                    <MetricsSimple
                        title={formatCurrency(totaux.totalInvesti)}
                        subtitle="Valeur investie"
                        type="modern"
                        trend="positive"
                        className="flex-1 md:min-w-[280px]"
                    />
                    <MetricsSimple
                        title={formatCurrency(totaux.plusValue)}
                        subtitle="Plus-value totale"
                        type="modern"
                        trend={totaux.plusValue >= 0 ? "positive" : "negative"}
                        change={formatPercent(totaux.plusValuePercent)}
                        className="flex-1 md:min-w-[280px]"
                    />
                </div>

                {/* Graphiques section */}
                <div className="flex flex-col gap-8 px-4 lg:flex-row lg:gap-6 lg:px-8">
                    {/* Repartition Radial */}
                    <div className="flex flex-col gap-6 lg:w-60">
                        <div className="flex items-start justify-between border-b border-secondary pb-5">
                            <p className="text-lg font-semibold text-primary">Performance</p>
                            <TableRowActionsDropdown />
                        </div>
                        <div className="h-60 w-60">
                            <ResponsiveContainer>
                                <RadialBarChart
                                    data={performanceAnnuelle}
                                    accessibilityLayer
                                    innerRadius={64}
                                    outerRadius={122}
                                    startAngle={90}
                                    endAngle={360 + 90}
                                    className="font-medium text-tertiary [&_.recharts-polar-grid]:text-utility-gray-100 [&_.recharts-text]:text-sm"
                                >
                                    <PolarAngleAxis tick={false} domain={[0, Math.max(...performanceAnnuelle.map((d) => d.value), 1000)]} type="number" reversed />
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
                                            {formatPercent(totaux.plusValuePercent).replace("+", "")}
                                        </tspan>
                                    </text>
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Legende */}
                        <div className="flex flex-col gap-2">
                            {performanceAnnuelle.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={cx("h-2 w-2 rounded-full", item.className.replace("text-", "bg-"))} />
                                        <span className="text-sm text-tertiary">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-medium text-primary">{formatCurrency(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Evolution Portfolio */}
                    <div className="flex flex-1 flex-col gap-6">
                        <div className="flex items-start justify-between border-b border-secondary pb-5">
                            <div className="flex flex-col gap-2">
                                <p className="text-lg font-semibold text-primary">Evolution du portfolio</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-display-sm font-semibold text-primary">{formatCurrency(totaux.totalActuel)}</span>
                                    <MetricChangeIndicator
                                        type="trend"
                                        trend={totaux.plusValuePercent >= 0 ? "positive" : "negative"}
                                        value={formatPercent(totaux.plusValuePercent)}
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

                {/* Top & Worst Performers */}
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
                            {topPerformers.length > 0 ? (
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
                                                        <Avatar size="md" src={item.imageUrl ?? undefined} alt={item.nom} initials={getInitials(item.nom)} />
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
                            ) : (
                                <p className="py-4 text-sm text-tertiary">Aucun investissement</p>
                            )}
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
                            {worstPerformers.length > 0 ? (
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
                                                        <Avatar size="md" src={item.imageUrl ?? undefined} alt={item.nom} initials={getInitials(item.nom)} />
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
                            ) : (
                                <p className="py-4 text-sm text-tertiary">Aucun investissement</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table Portfolio complete */}
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
                                <Table.Head id="quantite" label="Quantite" allowsSorting className="max-lg:hidden" />
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
                                                <Avatar src={item.imageUrl ?? undefined} alt={item.nom} initials={getInitials(item.nom)} size="md" />
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
                                                <ButtonUtility size="xs" color="tertiary" tooltip="Supprimer" icon={Trash01} onClick={() => handleDelete(item.id)} />
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table>
                        {investissements.length > 0 && <PaginationCardMinimal page={1} total={1} align="center" />}
                    </TableCard.Root>
                </div>
            </main>

            {/* Sidebar droite - Activite */}
            <div className="sticky top-0 hidden h-svh w-72 flex-col overflow-hidden border-l border-secondary bg-secondary_subtle lg:flex">
                <div className="flex w-full flex-wrap items-start justify-between gap-4 border-b border-secondary bg-alpha-white/90 px-4 py-5 backdrop-blur lg:px-6">
                    <p className="text-lg font-semibold text-primary">Activite</p>
                    <Button size="md" color="link-gray">
                        Voir tout
                    </Button>
                </div>
                <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-6 lg:px-6">
                    {investissements.length > 0 ? (
                        investissements.slice(0, 8).map((inv) => (
                            <FeedItem
                                key={inv.id}
                                id={inv.id}
                                size="sm"
                                unseen={false}
                                user={{ avatarUrl: inv.imageUrl ?? "", href: "#", name: inv.nom }}
                                action={{
                                    href: "#",
                                    content: "Position",
                                    target: `${inv.quantite} ${inv.ticker}`,
                                }}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-tertiary">Aucune activite recente</p>
                    )}
                </div>

                {/* Best & Worst performer mini */}
                {bestPerformer && worstPerformer && (
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
                )}
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
                                    <p className="text-sm text-tertiary">Ajoutez un nouvel actif a votre portfolio</p>
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
                                            onSelectionChange={(v) => setNewInvestissement({ ...newInvestissement, type: v as string })}
                                            items={INVESTMENT_TYPES}
                                            isRequired
                                        >
                                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                        </Select>

                                        <Select
                                            label="Plateforme"
                                            selectedKey={newInvestissement.plateforme}
                                            onSelectionChange={(v) => setNewInvestissement({ ...newInvestissement, plateforme: v as string })}
                                            items={PLATEFORMES}
                                        >
                                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <Input
                                            label="Quantite"
                                            type="number"
                                            placeholder="0"
                                            value={newInvestissement.quantite}
                                            onChange={(value) => setNewInvestissement({ ...newInvestissement, quantite: value })}
                                            isRequired
                                        />
                                        <Input
                                            label="Prix achat"
                                            type="number"
                                            placeholder="0.00"
                                            value={newInvestissement.prixAchat}
                                            onChange={(value) => setNewInvestissement({ ...newInvestissement, prixAchat: value })}
                                            isRequired
                                        />
                                        <Input
                                            label="Prix actuel"
                                            type="number"
                                            placeholder="0.00"
                                            value={newInvestissement.prixActuel}
                                            onChange={(value) => setNewInvestissement({ ...newInvestissement, prixActuel: value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Date d'achat"
                                            type="date"
                                            value={newInvestissement.dateAchat}
                                            onChange={(value) => setNewInvestissement({ ...newInvestissement, dateAchat: value })}
                                        />
                                        <Select
                                            label="Strategie"
                                            selectedKey={newInvestissement.strategie}
                                            onSelectionChange={(v) => setNewInvestissement({ ...newInvestissement, strategie: v as string })}
                                            items={STRATEGIES}
                                        >
                                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                        </Select>
                                    </div>

                                    <TextArea
                                        label="Notes (optionnel)"
                                        placeholder="Informations supplementaires..."
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
                                        isDisabled={!newInvestissement.nom || !newInvestissement.quantite || !newInvestissement.prixAchat || isSaving}
                                    >
                                        {isSaving ? "Creation..." : "Creer"}
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
                                    <p className="text-sm text-tertiary">Ajoutez une position a cet actif existant</p>
                                </div>

                                {/* Body */}
                                <div className="flex flex-col gap-5">
                                    <Input
                                        label="Quantite"
                                        type="number"
                                        placeholder="0"
                                        value={addPosition.quantite}
                                        onChange={(value) => setAddPosition({ ...addPosition, quantite: value })}
                                        isRequired
                                    />
                                    <Input
                                        label="Prix unitaire"
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
                                    />

                                    {selectedActif && addPosition.quantite && addPosition.prix && (
                                        <div className="rounded-lg bg-secondary p-4">
                                            <p className="text-sm text-tertiary">Nouveau prix moyen estime :</p>
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
                                        isDisabled={!addPosition.quantite || !addPosition.prix || isSaving}
                                    >
                                        {isSaving ? "Ajout..." : "Ajouter"}
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
