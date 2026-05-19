"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight, TrendUp01, TrendDown01 } from "@untitledui/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatedAmount } from "@/components/base/animated-amount/animated-amount";
import { Button } from "@/components/base/buttons/button";
import { PageTransition } from "@/components/base/page-transition/page-transition";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { cx } from "@/utils/cx";
import { formatCurrencySimple, getProgressColorOnDark, getProgressColor } from "@/utils/format";
import type { Enveloppe } from "@/lib/data/budget";
import type { Profile } from "@/types/api";
import TransactionsTab from "./tabs/transactions-tab";
import type { TransactionsTabProps } from "./tabs/transactions-tab";
import EnveloppesTab from "./tabs/enveloppes-tab";
import type { EnveloppesTabProps } from "./tabs/enveloppes-tab";
import ChargesFixesTab from "./tabs/charges-fixes-tab";
import type { ChargesFixesTabProps } from "./tabs/charges-fixes-tab";

// ============================================
// TYPES
// ============================================

type TabId = "transactions" | "enveloppes" | "charges-fixes";

interface TabConfig {
    id: TabId;
    label: string;
}

const TABS: TabConfig[] = [
    { id: "transactions", label: "Transactions" },
    { id: "enveloppes", label: "Enveloppes" },
    { id: "charges-fixes", label: "Charges fixes" },
];

interface BudgetSummary {
    profile: Profile | null;
    revenusMois: number;
    totalChargesFixes: number;
    enveloppes: Enveloppe[];
    transactions: {
        id: string;
        description: string;
        montant: number;
        date: string;
        categorieId: string;
        type: "variable" | "fixe" | "revenu";
    }[];
}

export interface MonBudgetClientProps {
    activeTab: TabId;
    currentMonth: number;
    currentYear: number;
    budgetSummary: BudgetSummary;
    transactionsData?: TransactionsTabProps["initialData"];
    transactionsPeriode?: string;
    enveloppesData?: EnveloppesTabProps["initialData"];
    chargesFixesData?: ChargesFixesTabProps["initialData"];
}

// ============================================
// HELPERS
// ============================================

const getMonthName = (month: number, year: number): string => {
    const date = new Date(year, month);
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
};

const getDaysRemainingInMonth = (date: Date): number => {
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return lastDay.getDate() - date.getDate();
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function MonBudgetClient({
    activeTab,
    currentMonth,
    currentYear,
    budgetSummary,
    transactionsData,
    transactionsPeriode,
    enveloppesData,
    chargesFixesData,
}: MonBudgetClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const today = new Date();

    const monthName = getMonthName(currentMonth, currentYear);
    const daysRemaining = getDaysRemainingInMonth(today);

    const { profile, revenusMois, totalChargesFixes, enveloppes } = budgetSummary;

    // Calculs
    const transactions = useMemo(() => {
        return budgetSummary.transactions.map((t) => ({
            ...t,
            date: new Date(t.date),
        }));
    }, [budgetSummary.transactions]);

    const disponiblePourVariables = revenusMois - totalChargesFixes;

    const depensesParEnveloppe = useMemo(() => {
        return enveloppes.map((env) => {
            const depenses = transactions
                .filter((t) => t.type === "variable" && t.categorieId === env.id)
                .reduce((sum, t) => sum + Math.abs(t.montant), 0);
            const reste = env.budgetMensuel - depenses;
            const pourcentage = env.budgetMensuel > 0 ? (depenses / env.budgetMensuel) * 100 : 0;
            return { ...env, depense: depenses, reste, pourcentage };
        });
    }, [enveloppes, transactions]);

    const totalDepenseVariables = depensesParEnveloppe.reduce((acc, e) => acc + e.depense, 0);
    const pourcentageMois = disponiblePourVariables > 0 ? (totalDepenseVariables / disponiblePourVariables) * 100 : 0;
    const resteADepenser = disponiblePourVariables - totalDepenseVariables;
    const resteParJour = daysRemaining > 0 ? resteADepenser / daysRemaining : 0;

    // Navigation mois
    const navigateMonth = (direction: "prev" | "next") => {
        const newMonth = direction === "prev"
            ? (currentMonth === 0 ? 11 : currentMonth - 1)
            : (currentMonth === 11 ? 0 : currentMonth + 1);
        const newYear = direction === "prev"
            ? (currentMonth === 0 ? currentYear - 1 : currentYear)
            : (currentMonth === 11 ? currentYear + 1 : currentYear);

        const params = new URLSearchParams(searchParams.toString());
        params.set("month", newMonth.toString());
        params.set("year", newYear.toString());
        router.push(`/budget?${params.toString()}`);
    };

    // Navigation onglets
    const handleTabChange = (tab: TabId) => {
        const params = new URLSearchParams();
        params.set("tab", tab);
        params.set("month", currentMonth.toString());
        params.set("year", currentYear.toString());
        if (tab === "transactions" && transactionsPeriode) {
            params.set("periode", transactionsPeriode);
        }
        router.push(`/budget?${params.toString()}`);
    };

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
        <PageTransition className="min-h-screen bg-primary">
            <div className="mx-auto max-w-container px-4 py-6 lg:px-8 lg:py-8">
                {/* ============================================ */}
                {/* HEADER */}
                {/* ============================================ */}
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-display-xs font-semibold capitalize text-primary lg:text-display-sm">
                            Mon budget · {monthName}
                        </h1>
                        <p className="text-md text-tertiary">
                            {daysRemaining} jours restants ce mois
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button size="sm" color="tertiary" iconLeading={ChevronLeft} onClick={() => navigateMonth("prev")} aria-label="Mois précédent" />
                        <Button size="sm" color="tertiary" iconLeading={ChevronRight} onClick={() => navigateMonth("next")} aria-label="Mois suivant" />
                    </div>
                </div>

                {/* ============================================ */}
                {/* HERO : Budget + Résumé côte à côte */}
                {/* ============================================ */}
                <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-5">
                    {/* Hero card anthracite — 3 cols */}
                    <div className="flex flex-col gap-5 rounded-xl bg-gray-900 p-6 lg:col-span-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-300">Budget variables</h2>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-300">
                                {pourcentageMois.toFixed(0)}%
                            </span>
                        </div>

                        <div>
                            <AnimatedAmount value={totalDepenseVariables} className="font-mono text-display-md font-bold tabular-nums text-white lg:text-display-lg" />
                            <span className="ml-2 text-lg text-gray-500">/ {formatCurrencySimple(disponiblePourVariables)}</span>
                        </div>

                        <ProgressBar
                            value={Math.min(pourcentageMois, 100)}
                            className="h-2 bg-gray-700"
                            progressClassName={getProgressColorOnDark(pourcentageMois)}
                        />

                        <div className="flex items-center justify-between text-sm text-gray-400">
                            <span>
                                Reste : <span className="font-semibold text-white">{formatCurrencySimple(Math.max(0, resteADepenser))}</span>
                            </span>
                            <span>
                                {resteParJour > 0
                                    ? `≈ ${formatCurrencySimple(resteParJour)}/jour`
                                    : `${daysRemaining}j restants`
                                }
                            </span>
                        </div>
                    </div>

                    {/* Résumé ce mois — 2 cols */}
                    <div className="flex flex-col gap-4 rounded-xl border border-[#E5E2DC] bg-white p-5 shadow-xs lg:col-span-2">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-tertiary">Ce mois</h2>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-50">
                                        <TrendUp01 className="h-4 w-4 text-success-600" />
                                    </div>
                                    <span className="text-sm text-tertiary">Revenus</span>
                                </div>
                                <span className="font-semibold text-finance-gain">{formatCurrencySimple(revenusMois)}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-error-50">
                                        <TrendDown01 className="h-4 w-4 text-error-600" />
                                    </div>
                                    <span className="text-sm text-tertiary">Charges fixes</span>
                                </div>
                                <span className="font-semibold text-primary">{formatCurrencySimple(totalChargesFixes)}</span>
                            </div>

                            <div className="border-t border-secondary pt-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-primary">Disponible</span>
                                    <span className="font-mono text-xl font-bold tabular-nums text-gray-900">{formatCurrencySimple(disponiblePourVariables)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                                <span className="text-xs text-tertiary">Variables dépensées</span>
                                <span className="text-sm font-semibold text-primary">{formatCurrencySimple(totalDepenseVariables)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================================ */}
                {/* ENVELOPPES — bande horizontale toujours visible */}
                {/* ============================================ */}
                {depensesParEnveloppe.length > 0 && (
                    <div className="mb-8">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-primary">Enveloppes</h2>
                            <Button
                                size="sm"
                                color="link-color"
                                onClick={() => handleTabChange("enveloppes")}
                            >
                                Voir le détail
                            </Button>
                        </div>

                        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 lg:pb-0">
                            {depensesParEnveloppe.map((env) => (
                                <div
                                    key={env.id}
                                    className="flex w-44 shrink-0 flex-col gap-2.5 rounded-xl border border-[#E5E2DC] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md lg:w-auto"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{env.icone}</span>
                                        <span className="truncate text-sm font-medium text-primary">{env.nom}</span>
                                    </div>

                                    <div className="flex items-baseline gap-1">
                                        <span className="font-mono text-lg font-bold text-primary">
                                            {formatCurrencySimple(env.depense)}
                                        </span>
                                        <span className="text-xs text-tertiary">/ {formatCurrencySimple(env.budgetMensuel)}</span>
                                    </div>

                                    <ProgressBar
                                        value={Math.min(env.pourcentage, 100)}
                                        className="h-1.5"
                                        progressClassName={getProgressColor(env.pourcentage)}
                                    />

                                    <p className={cx(
                                        "text-xs font-medium",
                                        env.reste >= 0 ? "text-finance-gain" : "text-finance-loss"
                                    )}>
                                        {env.reste >= 0
                                            ? `${formatCurrencySimple(env.reste)} restant`
                                            : `${formatCurrencySimple(Math.abs(env.reste))} dépassé`
                                        }
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ============================================ */}
                {/* ONGLETS */}
                {/* ============================================ */}
                <div className="mb-8">
                    <div className="flex gap-1 border-b border-secondary">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={cx(
                                    "relative px-4 py-2.5 text-sm font-medium transition-colors",
                                    activeTab === tab.id
                                        ? "text-brand-700"
                                        : "text-tertiary hover:text-primary"
                                )}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-brand-700" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ============================================ */}
                {/* CONTENU DE L'ONGLET ACTIF */}
                {/* ============================================ */}
                {activeTab === "transactions" && transactionsData && (
                    <TransactionsTab
                        initialData={transactionsData}
                        initialPeriode={transactionsPeriode || "this-week"}
                    />
                )}

                {activeTab === "enveloppes" && enveloppesData && (
                    <EnveloppesTab
                        initialData={enveloppesData}
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                    />
                )}

                {activeTab === "charges-fixes" && chargesFixesData && (
                    <ChargesFixesTab initialData={chargesFixesData as ChargesFixesTabProps["initialData"]} />
                )}
            </div>
        </PageTransition>
    );
}
