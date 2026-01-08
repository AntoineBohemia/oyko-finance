"use client";

import { useState } from "react";
import {
    ArrowDown,
    ArrowUp,
    Bank,
    CreditCard01,
    LineChartUp01,
    PiggyBank01,
    Plus,
    RefreshCw01,
    TrendDown01,
    TrendUp01,
    Wallet03,
} from "@untitledui/icons";
import Link from "next/link";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
} from "recharts";
import { ChartLegendContent, ChartTooltipContent } from "@/components/application/charts/charts-base";
import { MetricChangeIndicator } from "@/components/application/metrics/metrics";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Table, TableRowActionsDropdown } from "@/components/application/table/table";
import { TabList, Tabs } from "@/components/application/tabs/tabs";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { cx } from "@/utils/cx";
import { createClient } from "@/lib/supabase/client";
import type {
    PatrimoineData,
    ComptePatrimoine,
    InvestissementPatrimoine,
    DettePatrimoine,
    EvolutionPatrimoine,
    TotauxPatrimoine,
} from "@/lib/data/patrimoine";
import type { Profile } from "@/types/database.types";

// Types pour les données sérialisées
interface SerializedPatrimoineData {
    profile: Profile | null;
    comptes: ComptePatrimoine[];
    investissements: InvestissementPatrimoine[];
    dettes: {
        id: string;
        nom: string;
        type: string;
        capitalRestant: number;
        capitalInitial: number;
        mensualite: number;
        prochainPrelevement: string;
        preteur: string;
        imageUrl: string | null;
    }[];
    evolutionPatrimoine: EvolutionPatrimoine[];
    totaux: TotauxPatrimoine;
}

interface PatrimoineClientProps {
    initialData: SerializedPatrimoineData;
}

// ============================================
// HELPERS
// ============================================

const formatCurrency = (amount: number): string => amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

const formatCurrencyCompact = (amount: number): string => {
    if (Math.abs(amount) >= 1000) return `${(amount / 1000).toFixed(1)}k €`;
    return `${amount.toFixed(0)} €`;
};

const formatPercent = (value: number): string => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
};

const formatDate = (date: Date): string => date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

const getDaysUntil = (date: Date): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getJMoinsBadge = (date: Date): { label: string; color: "success" | "warning" | "error" | "gray" } => {
    const days = getDaysUntil(date);
    if (days < 0) return { label: "Passé", color: "gray" };
    if (days === 0) return { label: "Aujourd'hui", color: "error" };
    if (days <= 3) return { label: `J-${days}`, color: "error" };
    if (days <= 7) return { label: `J-${days}`, color: "warning" };
    return { label: `J-${days}`, color: "success" };
};

const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
        etudiant: "Étudiant",
        immobilier: "Immobilier",
        conso: "Conso",
        auto: "Auto",
        personnel: "Personnel",
        autre: "Autre",
    };
    return labels[type] || type;
};

const getTypeColor = (type: string): "brand" | "warning" | "error" => {
    const colors: Record<string, "brand" | "warning" | "error"> = {
        etudiant: "brand",
        immobilier: "brand",
        conso: "warning",
        auto: "warning",
        personnel: "error",
        autre: "error",
    };
    return colors[type] || "brand";
};

const getCompteIcon = (type: string) => {
    switch (type) {
        case "epargne":
            return PiggyBank01;
        case "cash":
            return Wallet03;
        default:
            return Bank;
    }
};

const getCompteIconColor = (type: string) => {
    switch (type) {
        case "epargne":
            return "text-success-600";
        case "cash":
            return "text-warning-600";
        default:
            return "text-brand-600";
    }
};

// ============================================
// TABS
// ============================================

const tabs = [
    { id: "liquidites", label: "Liquidités" },
    { id: "investissements", label: "Investissements" },
    { id: "dettes", label: "Dettes" },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function PatrimoineClient({ initialData }: PatrimoineClientProps) {
    const [selectedTab, setSelectedTab] = useState("liquidites");
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [soldesUpdate, setSoldesUpdate] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Données
    const profile = initialData.profile;
    const comptes = initialData.comptes;
    const investissements = initialData.investissements;
    const evolutionPatrimoine = initialData.evolutionPatrimoine;
    const totaux = initialData.totaux;

    // Reconvertir les dates des dettes
    const dettes = initialData.dettes.map((d) => ({
        ...d,
        prochainPrelevement: new Date(d.prochainPrelevement),
    }));

    // Répartition actifs pour le donut
    const repartitionActifs = [
        { name: "Liquidités", value: totaux.totalLiquidites, color: "#7c3aed" },
        { name: "Investissements", value: totaux.totalInvestissements, color: "#10b981" },
    ];

    // Initialiser les soldes pour la modale
    const openUpdateModal = () => {
        const initial: Record<string, string> = {};
        comptes.forEach((c) => {
            initial[c.id] = c.solde.toString();
        });
        setSoldesUpdate(initial);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateSoldes = async () => {
        if (!profile) return;

        setIsSaving(true);
        const supabase = createClient();

        try {
            for (const [compteId, solde] of Object.entries(soldesUpdate)) {
                await supabase
                    .from("comptes")
                    .update({ solde: parseFloat(solde) || 0 })
                    .eq("id", compteId);
            }

            setIsUpdateModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
        } finally {
            setIsSaving(false);
        }
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

    // Calcul de la variation mensuelle
    const variationMois = evolutionPatrimoine.length >= 2
        ? ((evolutionPatrimoine[evolutionPatrimoine.length - 1]?.net ?? 0) -
           (evolutionPatrimoine[evolutionPatrimoine.length - 2]?.net ?? 0)) /
          Math.abs(evolutionPatrimoine[evolutionPatrimoine.length - 2]?.net || 1) * 100
        : 0;

    return (
        <div className="min-h-screen bg-primary">
            <div className="mx-auto max-w-container px-4 py-6 lg:px-8 lg:py-8">
                <div className="flex flex-col gap-8">
                    {/* SECTION 1: HEADER */}
                    <div className="flex flex-col gap-4 border-b border-secondary pb-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-xl font-semibold text-primary lg:text-display-xs">Patrimoine</h1>
                            <p className="text-sm text-tertiary">Vue consolidée de vos actifs et passifs</p>
                        </div>
                        <Button size="md" color="secondary" iconLeading={RefreshCw01} onClick={openUpdateModal}>
                            Mettre à jour les soldes
                        </Button>
                    </div>

                    {/* SECTION 2: VALEUR NETTE HERO */}
                    <div className="flex flex-col gap-6 rounded-xl bg-primary_alt p-6 shadow-xs ring-1 ring-secondary ring-inset lg:p-8">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium text-tertiary">Valeur nette</p>
                                <div className="flex items-end gap-3">
                                    <p className="text-display-md font-semibold text-primary lg:text-display-lg">
                                        {formatCurrency(totaux.valeurNette)}
                                    </p>
                                    <MetricChangeIndicator
                                        trend={variationMois >= 0 ? "positive" : "negative"}
                                        type="trend"
                                        value={`${variationMois >= 0 ? "+" : ""}${variationMois.toFixed(1)}%`}
                                        className="mb-2"
                                    />
                                </div>
                            </div>

                            {/* Mini donut répartition */}
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20">
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={repartitionActifs}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={25}
                                                outerRadius={38}
                                                paddingAngle={2}
                                            >
                                                {repartitionActifs.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-col gap-1">
                                    {repartitionActifs.map((item) => (
                                        <div key={item.name} className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-xs text-tertiary">{item.name}</span>
                                            <span className="text-xs font-medium text-primary">{formatCurrencyCompact(item.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Barre Actifs vs Passifs */}
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <TrendUp01 className="h-4 w-4 text-finance-gain-subtle" />
                                    <span className="text-tertiary">Actifs</span>
                                    <span className="font-semibold text-finance-gain">{formatCurrency(totaux.totalActifs)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-finance-loss">{formatCurrency(totaux.totalDettes)}</span>
                                    <span className="text-tertiary">Passifs</span>
                                    <TrendDown01 className="h-4 w-4 text-finance-loss-subtle" />
                                </div>
                            </div>
                            <div className="flex h-3 w-full overflow-hidden rounded-full bg-error-100">
                                <div
                                    className="h-full bg-success-500 transition-all"
                                    style={{ width: `${(totaux.totalActifs / (totaux.totalActifs + totaux.totalDettes)) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-tertiary">
                                <span>{((totaux.totalActifs / (totaux.totalActifs + totaux.totalDettes)) * 100).toFixed(0)}% actifs</span>
                                <span>{((totaux.totalDettes / (totaux.totalActifs + totaux.totalDettes)) * 100).toFixed(0)}% passifs</span>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: TABS */}
                    <Tabs selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(key as string)}>
                        <TabList size="md" type="underline" items={tabs} />
                    </Tabs>

                    {/* SECTION 4: CONTENU TABS */}
                    <>
                        {/* TAB LIQUIDITÉS */}
                        {selectedTab === "liquidites" && (
                            <div className="flex flex-col gap-6">
                                {/* Total liquidités */}
                                <div className="flex items-center justify-between rounded-xl bg-primary_alt p-4 shadow-xs ring-1 ring-secondary ring-inset">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50">
                                            <Wallet03 className="h-5 w-5 text-brand-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-tertiary">Total liquidités</p>
                                            <p className="text-lg font-semibold text-primary">{formatCurrency(totaux.totalLiquidites)}</p>
                                        </div>
                                    </div>
                                    <Link href="/comptes">
                                        <Button size="sm" color="secondary" iconLeading={Plus}>
                                            Nouveau compte
                                        </Button>
                                    </Link>
                                </div>

                                {/* Liste comptes */}
                                {comptes.length > 0 ? (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {comptes.map((compte) => {
                                            const Icon = getCompteIcon(compte.type);
                                            const iconColor = getCompteIconColor(compte.type);
                                            return (
                                                <div
                                                    key={compte.id}
                                                    className="flex flex-col gap-4 rounded-xl bg-primary_alt p-5 shadow-xs ring-1 ring-secondary ring-inset"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                                                <Icon className={cx("h-5 w-5", iconColor)} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-primary">{compte.nom}</p>
                                                                <p className="text-xs text-tertiary">{compte.banque}</p>
                                                            </div>
                                                        </div>
                                                        <TableRowActionsDropdown />
                                                    </div>
                                                    <div className="flex items-end justify-between">
                                                        <p className="text-xl font-semibold text-primary">{formatCurrency(compte.solde)}</p>
                                                        <Badge size="sm" type="pill-color" color={compte.type === "epargne" ? "success" : "gray"}>
                                                            {compte.type === "courant" ? "Courant" : compte.type === "epargne" ? "Épargne" : "Cash"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="rounded-xl bg-secondary p-8 text-center">
                                        <p className="text-tertiary">Aucun compte configuré.</p>
                                        <Link href="/comptes">
                                            <Button size="sm" color="link-color" className="mt-2">
                                                Ajouter un compte
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB INVESTISSEMENTS */}
                        {selectedTab === "investissements" && (
                            <div className="flex flex-col gap-6">
                                {/* Total investissements */}
                                <div className="flex items-center justify-between rounded-xl bg-primary_alt p-4 shadow-xs ring-1 ring-secondary ring-inset">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-50">
                                            <LineChartUp01 className="h-5 w-5 text-success-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-tertiary">Total investissements</p>
                                            <p className="text-lg font-semibold text-primary">{formatCurrency(totaux.totalInvestissements)}</p>
                                        </div>
                                        <div className="ml-4 flex flex-col">
                                            <span className="text-xs text-tertiary">Plus-value</span>
                                            <span className={cx("text-sm font-medium", totaux.totalPlusValue >= 0 ? "text-finance-gain" : "text-finance-loss")}>
                                                {formatCurrency(totaux.totalPlusValue)} ({formatPercent(totaux.totalPlusValuePercent)})
                                            </span>
                                        </div>
                                    </div>
                                    <Link href="/investissements">
                                        <Button size="sm" color="secondary" iconLeading={Plus}>
                                            Nouvel investissement
                                        </Button>
                                    </Link>
                                </div>

                                {/* Table investissements */}
                                {investissements.length > 0 ? (
                                    <div className="overflow-hidden rounded-xl bg-primary_alt shadow-xs ring-1 ring-secondary ring-inset">
                                        <Table aria-label="Investissements">
                                            <Table.Header>
                                                <Table.Head id="nom" isRowHeader label="Actif" className="w-full" />
                                                <Table.Head id="type" label="Type" />
                                                <Table.Head id="valeur" label="Valeur" />
                                                <Table.Head id="plusValue" label="+/- Value" />
                                            </Table.Header>
                                            <Table.Body items={investissements}>
                                                {(inv) => (
                                                    <Table.Row id={inv.id}>
                                                        <Table.Cell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar src={inv.imageUrl ?? undefined} alt={inv.nom} size="sm" initials={inv.ticker.substring(0, 2)} />
                                                                <div>
                                                                    <p className="text-sm font-medium text-primary">{inv.nom}</p>
                                                                    <p className="text-xs text-tertiary">{inv.ticker}</p>
                                                                </div>
                                                            </div>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <Badge size="sm" type="pill-color" color={inv.type === "ETF" ? "brand" : inv.type === "Crypto" ? "warning" : "gray"}>
                                                                {inv.type}
                                                            </Badge>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <span className="text-sm font-medium text-primary">{formatCurrency(inv.valeurActuelle)}</span>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={cx("text-sm font-medium", inv.plusValuePercent >= 0 ? "text-finance-gain" : "text-finance-loss")}>
                                                                    {formatPercent(inv.plusValuePercent)}
                                                                </span>
                                                                {inv.plusValuePercent >= 0 ? (
                                                                    <ArrowUp className="h-3.5 w-3.5 text-finance-gain-subtle" />
                                                                ) : (
                                                                    <ArrowDown className="h-3.5 w-3.5 text-finance-loss-subtle" />
                                                                )}
                                                            </div>
                                                        </Table.Cell>
                                                    </Table.Row>
                                                )}
                                            </Table.Body>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="rounded-xl bg-secondary p-8 text-center">
                                        <p className="text-tertiary">Aucun investissement configuré.</p>
                                        <Link href="/investissements">
                                            <Button size="sm" color="link-color" className="mt-2">
                                                Ajouter un investissement
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB DETTES */}
                        {selectedTab === "dettes" && (
                            <div className="flex flex-col gap-6">
                                {/* Total dettes */}
                                <div className="flex items-center justify-between rounded-xl bg-primary_alt p-4 shadow-xs ring-1 ring-secondary ring-inset">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-50">
                                            <CreditCard01 className="h-5 w-5 text-error-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-tertiary">Total dettes</p>
                                            <p className="text-lg font-semibold text-finance-loss">{formatCurrency(totaux.totalDettes)}</p>
                                        </div>
                                        <div className="ml-4 flex flex-col">
                                            <span className="text-xs text-tertiary">Mensualités totales</span>
                                            <span className="text-sm font-medium text-primary">
                                                {formatCurrency(totaux.totalMensualitesDettes)}/mois
                                            </span>
                                        </div>
                                    </div>
                                    <Link href="/dettes">
                                        <Button size="sm" color="secondary" iconLeading={Plus}>
                                            Nouvelle dette
                                        </Button>
                                    </Link>
                                </div>

                                {/* Liste dettes */}
                                {dettes.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        {dettes.map((dette) => {
                                            const progression = ((dette.capitalInitial - dette.capitalRestant) / dette.capitalInitial) * 100;
                                            const jMoins = getJMoinsBadge(dette.prochainPrelevement);

                                            return (
                                                <div
                                                    key={dette.id}
                                                    className="flex flex-col gap-4 rounded-xl bg-primary_alt p-5 shadow-xs ring-1 ring-secondary ring-inset"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar src={dette.imageUrl ?? undefined} alt={dette.nom} size="md" initials={dette.nom.substring(0, 2)} />
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm font-medium text-primary">{dette.nom}</p>
                                                                    <Badge size="sm" type="pill-color" color={getTypeColor(dette.type)}>
                                                                        {getTypeLabel(dette.type)}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-tertiary">{dette.preteur}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-semibold text-primary">{formatCurrency(dette.capitalRestant)}</p>
                                                            <p className="text-xs text-tertiary">sur {formatCurrency(dette.capitalInitial)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex justify-between text-xs text-tertiary">
                                                            <span>{progression.toFixed(0)}% remboursé</span>
                                                            <span>{formatCurrency(dette.mensualite)}/mois</span>
                                                        </div>
                                                        <ProgressBar min={0} max={100} value={progression} />
                                                    </div>

                                                    <div className="flex items-center justify-between border-t border-secondary pt-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-tertiary">Prochain prélèvement:</span>
                                                            <span className="text-xs font-medium text-primary">{formatDate(dette.prochainPrelevement)}</span>
                                                        </div>
                                                        <Badge size="sm" type="pill-color" color={jMoins.color}>
                                                            {jMoins.label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="rounded-xl bg-secondary p-8 text-center">
                                        <p className="text-tertiary">Aucune dette enregistrée.</p>
                                        <Link href="/dettes">
                                            <Button size="sm" color="link-color" className="mt-2">
                                                Ajouter une dette
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </>

                    {/* SECTION 5: ÉVOLUTION DU PATRIMOINE */}
                    {evolutionPatrimoine.length > 0 && (
                        <div className="flex flex-col gap-6 rounded-xl bg-primary_alt p-6 shadow-xs ring-1 ring-secondary ring-inset">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col gap-1">
                                    <p className="text-lg font-semibold text-primary">Évolution du patrimoine</p>
                                    <p className="text-sm text-tertiary">Progression sur les 12 derniers mois</p>
                                </div>
                                <TableRowActionsDropdown />
                            </div>

                            <div className="flex h-64 w-full flex-col gap-2 lg:h-80">
                                <ResponsiveContainer className="h-full">
                                    <AreaChart data={evolutionPatrimoine} className="text-tertiary [&_.recharts-text]:text-xs">
                                        <defs>
                                            <linearGradient id="gradientActifs" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity="0.3" />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity="0" />
                                            </linearGradient>
                                            <linearGradient id="gradientNet" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#7c3aed" stopOpacity="0.3" />
                                                <stop offset="95%" stopColor="#7c3aed" stopOpacity="0" />
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
                                            className="text-success-500"
                                            dataKey="actifs"
                                            name="Actifs"
                                            type="monotone"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            fill="url(#gradientActifs)"
                                            activeDot={{ className: "fill-bg-primary stroke-success-500 stroke-2" }}
                                        />

                                        <Area
                                            isAnimationActive={false}
                                            className="text-error-400"
                                            dataKey="passifs"
                                            name="Passifs"
                                            type="monotone"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            fill="none"
                                            strokeDasharray="4 4"
                                            activeDot={{ className: "fill-bg-primary stroke-error-400 stroke-2" }}
                                        />

                                        <Area
                                            isAnimationActive={false}
                                            className="text-brand-600"
                                            dataKey="net"
                                            name="Valeur nette"
                                            type="monotone"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                            fill="url(#gradientNet)"
                                            activeDot={{ className: "fill-bg-primary stroke-brand-600 stroke-2" }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modale mise à jour des soldes */}
            <ModalOverlay isOpen={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen} isDismissable>
                <Modal className="max-w-md">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                {/* Header */}
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-primary">Mettre à jour les soldes</h2>
                                    <p className="text-sm text-tertiary">Ajustez les soldes de vos comptes</p>
                                </div>

                                {/* Body */}
                                <div className="flex flex-col gap-4">
                                    {comptes.map((compte) => (
                                        <Input
                                            key={compte.id}
                                            label={compte.nom}
                                            type="number"
                                            placeholder="0.00"
                                            value={soldesUpdate[compte.id] || ""}
                                            onChange={(value) => setSoldesUpdate({ ...soldesUpdate, [compte.id]: value })}
                                        />
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="flex justify-end gap-3 border-t border-secondary pt-6">
                                    <Button color="secondary" onClick={close}>
                                        Annuler
                                    </Button>
                                    <Button color="primary" onClick={handleUpdateSoldes} isDisabled={isSaving}>
                                        {isSaving ? "Enregistrement..." : "Enregistrer"}
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
