"use client";

import { useState } from "react";
import { PageTransition } from "@/components/base/page-transition/page-transition";
import { AnimatedAmount } from "@/components/base/animated-amount/animated-amount";
import { StaggerList, StaggerItem } from "@/components/base/stagger-list/stagger-list";
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
import { TableRowActionsDropdown } from "@/components/application/table/table";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { cx } from "@/utils/cx";
import type {
    ComptePatrimoine,
    InvestissementPatrimoine,
    EvolutionPatrimoine,
    TotauxPatrimoine,
} from "@/lib/data/patrimoine";
import type { Profile } from "@/types/api";

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
    if (Math.abs(amount) >= 1000) return `${(amount / 1000).toFixed(1).replace(".0", "")}k €`;
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
    const labels: Record<string, string> = { etudiant: "Étudiant", immobilier: "Immobilier", conso: "Conso", auto: "Auto", personnel: "Personnel", autre: "Autre" };
    return labels[type] || type;
};

const getTypeColor = (type: string): "brand" | "warning" | "error" => {
    const colors: Record<string, "brand" | "warning" | "error"> = { etudiant: "brand", immobilier: "brand", conso: "warning", auto: "warning", personnel: "error", autre: "error" };
    return colors[type] || "brand";
};

const getCompteIcon = (type: string) => {
    switch (type) {
        case "epargne": return PiggyBank01;
        case "cash": return Wallet03;
        default: return Bank;
    }
};

const getCompteIconColor = (type: string) => {
    switch (type) {
        case "epargne": return "text-[#608B00] bg-[#FAFFE4]";
        case "cash": return "text-warning-600 bg-amber-50";
        default: return "text-gray-600 bg-gray-100";
    }
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function PatrimoineClient({ initialData }: PatrimoineClientProps) {
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [soldesUpdate, setSoldesUpdate] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const profile = initialData.profile;
    const comptes = initialData.comptes;
    const investissements = initialData.investissements;
    const evolutionPatrimoine = initialData.evolutionPatrimoine;
    const totaux = initialData.totaux;

    const dettes = initialData.dettes.map((d) => ({
        ...d,
        prochainPrelevement: new Date(d.prochainPrelevement),
    }));

    // Répartition pour le donut
    const repartitionActifs = [
        { name: "Liquidités", value: totaux.totalLiquidites, color: "#1C1917" },
        { name: "Investissements", value: totaux.totalInvestissements, color: "#BEFF00" },
    ];

    // Variation mensuelle
    const variationMois = evolutionPatrimoine.length >= 2
        ? ((evolutionPatrimoine[evolutionPatrimoine.length - 1]?.net ?? 0) -
           (evolutionPatrimoine[evolutionPatrimoine.length - 2]?.net ?? 0)) /
          Math.abs(evolutionPatrimoine[evolutionPatrimoine.length - 2]?.net || 1) * 100
        : 0;

    const totalMensualitesDettes = dettes.reduce((acc, d) => acc + d.mensualite, 0);
    const pctActifs = totaux.totalActifs + totaux.totalDettes > 0
        ? (totaux.totalActifs / (totaux.totalActifs + totaux.totalDettes)) * 100
        : 100;

    // Modale mise à jour
    const openUpdateModal = () => {
        const initial: Record<string, string> = {};
        comptes.forEach((c) => { initial[c.id] = c.solde.toString(); });
        setSoldesUpdate(initial);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateSoldes = async () => {
        if (!profile) return;
        setIsSaving(true);
        try {
            const { updateCompteSolde } = await import("@/lib/data/patrimoine");
            for (const [compteId, solde] of Object.entries(soldesUpdate)) {
                await updateCompteSolde(compteId, parseFloat(solde) || 0);
            }
            setIsUpdateModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <PageTransition className="min-h-screen bg-primary">
            <div className="mx-auto max-w-container px-4 py-6 lg:px-8 lg:py-8">
                {/* ============================================ */}
                {/* HEADER                                       */}
                {/* ============================================ */}
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="font-display text-display-xs font-semibold text-primary lg:text-display-sm">Patrimoine</h1>
                        <p className="text-md text-tertiary">Vue consolidée de vos actifs et passifs</p>
                    </div>
                    <Button size="md" color="secondary" iconLeading={RefreshCw01} onClick={openUpdateModal}>
                        Mettre à jour
                    </Button>
                </div>

                {/* ============================================ */}
                {/* HERO — Valeur nette + Donut (bg-white)       */}
                {/* ============================================ */}
                <div className="mb-8 rounded-xl border border-[#E5E2DC] bg-white p-6 shadow-xs lg:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        {/* Left — Valeur nette */}
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-tertiary">Valeur nette</p>
                            <div className="flex flex-wrap items-baseline gap-3">
                                <span className="font-mono text-4xl font-bold tabular-nums tracking-tight text-primary lg:text-5xl">
                                    {formatCurrency(totaux.valeurNette)}
                                </span>
                                <MetricChangeIndicator
                                    trend={variationMois >= 0 ? "positive" : "negative"}
                                    type="trend"
                                    value={`${variationMois >= 0 ? "+" : ""}${variationMois.toFixed(1)}%`}
                                />
                            </div>
                        </div>

                        {/* Right — Donut Recharts interactif */}
                        <div className="flex items-center gap-5">
                            <div className="h-24 w-24">
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={repartitionActifs}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={28}
                                            outerRadius={44}
                                            paddingAngle={3}
                                        >
                                            {repartitionActifs.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            content={<ChartTooltipContent />}
                                            formatter={(value) => formatCurrency(value as number)}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                {repartitionActifs.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm text-tertiary">{item.name}</span>
                                        <span className="font-mono text-sm font-semibold text-primary">{formatCurrencyCompact(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Barre Actifs vs Passifs */}
                    <div className="mt-8 flex flex-col gap-3">
                        <div className="flex justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <TrendUp01 className="h-4 w-4 text-stone-600" />
                                <span className="text-tertiary">Actifs</span>
                                <span className="font-semibold text-[#608B00]">{formatCurrency(totaux.totalActifs)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-primary">{formatCurrency(totaux.totalDettes)}</span>
                                <span className="text-tertiary">Passifs</span>
                                <TrendDown01 className="h-4 w-4 text-stone-500" />
                            </div>
                        </div>
                        <div className="flex h-3 w-full overflow-hidden rounded-full bg-stone-200">
                            <div className="h-full bg-gray-900 transition-all" style={{ width: `${pctActifs}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-tertiary">
                            <span>{pctActifs.toFixed(0)}% actifs</span>
                            <span>{(100 - pctActifs).toFixed(0)}% passifs</span>
                        </div>
                    </div>
                </div>

                {/* ============================================ */}
                {/* 3 KPI CARDS                                  */}
                {/* ============================================ */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-4 rounded-xl border border-[#E5E2DC] bg-white p-5 shadow-xs">
                        <div className="flex size-11 items-center justify-center rounded-full bg-gray-100">
                            <Wallet03 className="size-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm text-tertiary">Liquidités</p>
                            <p className="font-mono text-lg font-bold text-primary">{formatCurrency(totaux.totalLiquidites)}</p>
                            <p className="text-xs text-tertiary">{comptes.length} compte{comptes.length > 1 ? "s" : ""}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl border border-[#E5E2DC] bg-white p-5 shadow-xs">
                        <div className="flex size-11 items-center justify-center rounded-full bg-[#BEFF00]/10">
                            <LineChartUp01 className="size-5 text-[#5C7A00]" />
                        </div>
                        <div>
                            <p className="text-sm text-tertiary">Investissements</p>
                            <p className="font-mono text-lg font-bold text-primary">{formatCurrency(totaux.totalInvestissements)}</p>
                            <p className="text-xs font-medium text-[#5C7A00]">{formatPercent(totaux.totalPlusValuePercent)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl border border-[#E5E2DC] bg-white p-5 shadow-xs">
                        <div className="flex size-11 items-center justify-center rounded-full bg-stone-100">
                            <CreditCard01 className="size-5 text-stone-600" />
                        </div>
                        <div>
                            <p className="text-sm text-tertiary">Dettes</p>
                            <p className="font-mono text-lg font-bold text-primary">{formatCurrency(totaux.totalDettes)}</p>
                            <p className="text-xs text-tertiary">{formatCurrency(totalMensualitesDettes)}/mois</p>
                        </div>
                    </div>
                </div>

                {/* ============================================ */}
                {/* 3 COLONNES DÉTAIL — No tabs                  */}
                {/* ============================================ */}
                <StaggerList className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">

                    {/* ---- LIQUIDITÉS ---- */}
                    <StaggerItem className="flex flex-col overflow-hidden rounded-xl border border-[#E5E2DC] bg-white shadow-xs">
                        <div className="flex items-center justify-between border-b border-[#E5E2DC] px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <Wallet03 className="size-4 text-gray-500" />
                                <span className="text-sm font-semibold text-primary">Liquidités</span>
                            </div>
                            <span className="font-mono text-sm font-bold tabular-nums text-primary">{formatCurrency(totaux.totalLiquidites)}</span>
                        </div>

                        <div className="flex flex-1 flex-col divide-y divide-gray-100">
                            {comptes.length > 0 ? comptes.map((compte) => {
                                const Icon = getCompteIcon(compte.type);
                                const colorClasses = getCompteIconColor(compte.type);
                                return (
                                    <div key={compte.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50">
                                        <div className={cx("flex size-8 items-center justify-center rounded-full", colorClasses)}>
                                            <Icon className="size-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-primary">{compte.nom}</p>
                                            <p className="text-xs text-tertiary">{compte.banque}</p>
                                        </div>
                                        <span className="font-mono text-sm font-semibold tabular-nums text-primary">{formatCurrency(compte.solde)}</span>
                                    </div>
                                );
                            }) : (
                                <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 px-8">
                                    <p className="font-display text-lg font-semibold text-primary">Aucun compte</p>
                                    <p className="max-w-sm text-center text-sm text-tertiary">Ajoutez un compte bancaire pour suivre vos liquidites.</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-[#E5E2DC] p-3">
                            <Link href="/patrimoine?tab=liquidites">
                                <Button size="sm" color="link-color" iconLeading={Plus} className="w-full justify-center">
                                    Nouveau compte
                                </Button>
                            </Link>
                        </div>
                    </StaggerItem>

                    {/* ---- INVESTISSEMENTS ---- */}
                    <StaggerItem className="flex flex-col overflow-hidden rounded-xl border border-[#E5E2DC] bg-white shadow-xs">
                        <div className="flex items-center justify-between border-b border-[#E5E2DC] px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <LineChartUp01 className="size-4 text-[#5C7A00]" />
                                <span className="text-sm font-semibold text-primary">Investissements</span>
                            </div>
                            <div className="text-right">
                                <span className="font-mono text-sm font-bold tabular-nums text-primary">{formatCurrency(totaux.totalInvestissements)}</span>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col divide-y divide-gray-100">
                            {investissements.length > 0 ? investissements.map((inv) => (
                                <div key={inv.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50">
                                    <Avatar src={inv.imageUrl ?? undefined} alt={inv.nom} size="sm" initials={inv.ticker.substring(0, 2)} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-primary">{inv.nom}</p>
                                        <Badge size="sm" type="pill-color" color={inv.type === "ETF" ? "brand" : inv.type === "Crypto" ? "warning" : "gray"}>
                                            {inv.type}
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-sm font-semibold tabular-nums text-primary">{formatCurrency(inv.valeurActuelle)}</p>
                                        <div className="flex items-center justify-end gap-1">
                                            <span className={cx("font-mono text-xs font-semibold tabular-nums", inv.plusValuePercent >= 0 ? "text-[#608B00]" : "text-primary")}>
                                                {formatPercent(inv.plusValuePercent)}
                                            </span>
                                            {inv.plusValuePercent >= 0
                                                ? <ArrowUp className="size-3 text-[#608B00]" />
                                                : <ArrowDown className="size-3 text-primary" />
                                            }
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 px-8">
                                    <p className="font-display text-lg font-semibold text-primary">Aucun investissement</p>
                                    <p className="max-w-sm text-center text-sm text-tertiary">Ajoutez vos placements pour suivre la performance de votre portefeuille.</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-[#E5E2DC] p-3">
                            <Link href="/patrimoine/investissements">
                                <Button size="sm" color="link-color" iconLeading={Plus} className="w-full justify-center">
                                    Nouvel investissement
                                </Button>
                            </Link>
                        </div>
                    </StaggerItem>

                    {/* ---- DETTES ---- */}
                    <StaggerItem className="flex flex-col overflow-hidden rounded-xl border border-[#E5E2DC] bg-white shadow-xs">
                        <div className="flex items-center justify-between border-b border-[#E5E2DC] px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <CreditCard01 className="size-4 text-stone-500" />
                                <span className="text-sm font-semibold text-primary">Dettes</span>
                            </div>
                            <div className="text-right">
                                <span className="font-mono text-sm font-bold tabular-nums text-primary">{formatCurrency(totaux.totalDettes)}</span>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col divide-y divide-gray-100">
                            {dettes.length > 0 ? dettes.map((dette) => {
                                const progression = ((dette.capitalInitial - dette.capitalRestant) / dette.capitalInitial) * 100;
                                const jMoins = getJMoinsBadge(dette.prochainPrelevement);

                                return (
                                    <div key={dette.id} className="px-5 py-4 transition-colors hover:bg-gray-50">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar src={dette.imageUrl ?? undefined} alt={dette.nom} size="sm" initials={dette.nom.substring(0, 2)} />
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-sm font-medium text-primary">{dette.nom}</p>
                                                        <Badge size="sm" type="pill-color" color={getTypeColor(dette.type)}>{getTypeLabel(dette.type)}</Badge>
                                                    </div>
                                                    <p className="text-xs text-tertiary">{dette.preteur}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-mono text-sm font-bold tabular-nums text-primary">{formatCurrency(dette.capitalRestant)}</p>
                                                <p className="text-[11px] text-tertiary">sur {formatCurrency(dette.capitalInitial)}</p>
                                            </div>
                                        </div>

                                        <div className="mt-2.5 flex items-center gap-2">
                                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                                                <div className={cx("h-full rounded-full", progression >= 50 ? "bg-[#BEFF00]" : "bg-gray-900")} style={{ width: `${progression}%` }} />
                                            </div>
                                            <span className="text-[11px] font-medium tabular-nums text-tertiary">{progression.toFixed(0)}%</span>
                                        </div>

                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-xs text-tertiary">{formatCurrency(dette.mensualite)}/mois · {formatDate(dette.prochainPrelevement)}</span>
                                            <Badge size="sm" type="pill-color" color={jMoins.color}>{jMoins.label}</Badge>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 px-8">
                                    <p className="font-display text-lg font-semibold text-primary">Aucune dette</p>
                                    <p className="max-w-sm text-center text-sm text-tertiary">Ajoutez vos credits et emprunts pour un suivi complet de votre patrimoine.</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-[#E5E2DC] p-3">
                            <Link href="/patrimoine/dettes">
                                <Button size="sm" color="link-color" iconLeading={Plus} className="w-full justify-center">
                                    Nouvelle dette
                                </Button>
                            </Link>
                        </div>
                    </StaggerItem>
                </StaggerList>

                {/* ============================================ */}
                {/* ÉVOLUTION DU PATRIMOINE — Recharts           */}
                {/* ============================================ */}
                {evolutionPatrimoine.length > 0 && (
                    <div className="rounded-xl border border-[#E5E2DC] bg-white p-6 shadow-xs">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-lg font-semibold text-primary">Évolution du patrimoine</p>
                                <p className="text-sm text-tertiary">Progression sur les 12 derniers mois</p>
                            </div>
                            <TableRowActionsDropdown />
                        </div>

                        <div className="mt-4 flex h-64 w-full flex-col gap-2 lg:h-80">
                            <ResponsiveContainer className="h-full">
                                <AreaChart data={evolutionPatrimoine} className="text-tertiary [&_.recharts-text]:text-xs">
                                    <defs>
                                        <linearGradient id="gradientActifs" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1C1917" stopOpacity="0.1" />
                                            <stop offset="95%" stopColor="#1C1917" stopOpacity="0" />
                                        </linearGradient>
                                        <linearGradient id="gradientNet" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#BEFF00" stopOpacity="0.25" />
                                            <stop offset="95%" stopColor="#BEFF00" stopOpacity="0" />
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

                                    <Area isAnimationActive={false} className="text-gray-400" dataKey="actifs" name="Actifs" type="monotone" stroke="currentColor" strokeWidth={2} fill="url(#gradientActifs)" activeDot={{ className: "fill-white stroke-gray-400 stroke-2" }} />
                                    <Area isAnimationActive={false} className="text-gray-300" dataKey="passifs" name="Passifs" type="monotone" stroke="currentColor" strokeWidth={2} fill="none" strokeDasharray="4 4" activeDot={{ className: "fill-white stroke-gray-300 stroke-2" }} />
                                    <Area isAnimationActive={false} className="text-[#BEFF00]" dataKey="net" name="Valeur nette" type="monotone" stroke="currentColor" strokeWidth={3} fill="url(#gradientNet)" activeDot={{ className: "fill-white stroke-[#BEFF00] stroke-2" }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Modale mise à jour des soldes */}
            <ModalOverlay isOpen={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen} isDismissable>
                <Modal className="max-w-md">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-primary">Mettre à jour les soldes</h2>
                                    <p className="text-sm text-tertiary">Ajustez les soldes de vos comptes</p>
                                </div>
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
                                <div className="flex justify-end gap-3 border-t border-secondary pt-6">
                                    <Button color="secondary" onClick={close}>Annuler</Button>
                                    <Button color="primary" onClick={handleUpdateSoldes} isDisabled={isSaving}>
                                        {isSaving ? "Enregistrement..." : "Enregistrer"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </PageTransition>
    );
}
