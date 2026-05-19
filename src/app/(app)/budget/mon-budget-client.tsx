"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { cx } from "@/utils/cx";
import { formatCurrencySimple, getProgressColor } from "@/utils/format";
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

// Budget summary data (always loaded from budget data)
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

    // Calculs pour le résumé
    const transactions = useMemo(() => {
        return budgetSummary.transactions.map((t) => ({
            ...t,
            date: new Date(t.date),
        }));
    }, [budgetSummary.transactions]);

    const disponiblePourVariables = revenusMois - totalChargesFixes;

    const totalDepenseVariables = useMemo(() => {
        return enveloppes.reduce((acc, env) => {
            const depenses = transactions
                .filter((t) => t.type === "variable" && t.categorieId === env.id)
                .reduce((sum, t) => sum + Math.abs(t.montant), 0);
            return acc + depenses;
        }, 0);
    }, [enveloppes, transactions]);

    const pourcentageMois = disponiblePourVariables > 0 ? (totalDepenseVariables / disponiblePourVariables) * 100 : 0;
    const resteADepenser = disponiblePourVariables - totalDepenseVariables;

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
        // Preserve periode for transactions tab
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
        <div className="min-h-screen bg-primary">
            <div className="mx-auto max-w-container px-4 py-6 lg:px-8 lg:py-8">
                {/* ============================================ */}
                {/* HEADER */}
                {/* ============================================ */}
                <div className="mb-6 flex flex-col gap-4 border-b border-secondary pb-5 lg:mb-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl font-semibold text-primary capitalize lg:text-display-xs">Mon budget · {monthName}</h1>
                        <p className="text-sm text-tertiary">Gérez vos dépenses, enveloppes et charges fixes</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button size="sm" color="tertiary" iconLeading={ChevronLeft} onClick={() => navigateMonth("prev")} aria-label="Mois précédent" />
                        <Button size="sm" color="tertiary" iconLeading={ChevronRight} onClick={() => navigateMonth("next")} aria-label="Mois suivant" />
                    </div>
                </div>

                {/* ============================================ */}
                {/* RÉSUMÉ DU MOIS */}
                {/* ============================================ */}
                <div className="mb-8 rounded-xl bg-secondary p-5 ring-1 ring-secondary ring-inset lg:p-6">
                    <h2 className="mb-4 text-sm font-semibold tracking-wider text-tertiary uppercase">Résumé du mois</h2>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-tertiary">Revenus</span>
                                <span className="font-semibold text-finance-gain">{formatCurrencySimple(revenusMois)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-tertiary">− Charges fixes</span>
                                <span className="text-primary">{formatCurrencySimple(totalChargesFixes)}</span>
                            </div>
                            <div className="flex justify-between border-t border-tertiary/20 pt-2">
                                <span className="font-medium text-primary">= Disponible pour dépenses variables</span>
                                <span className="font-bold text-primary">{formatCurrencySimple(disponiblePourVariables)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 rounded-lg bg-primary p-4">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <div>
                                    <span className="text-sm text-tertiary">Dépensé ce mois : </span>
                                    <span className="text-lg font-semibold text-primary">{formatCurrencySimple(totalDepenseVariables)}</span>
                                    <span className="text-sm text-tertiary"> ({pourcentageMois.toFixed(0)}% du budget)</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <div>
                                    <span className="text-sm text-tertiary">Reste à dépenser : </span>
                                    <span className={cx("text-lg font-semibold", resteADepenser >= 0 ? "text-finance-gain" : "text-tertiary")}>
                                        {formatCurrencySimple(Math.abs(resteADepenser))}
                                    </span>
                                    <span className="text-sm text-tertiary"> ({daysRemaining} jours restants)</span>
                                </div>
                            </div>

                            <ProgressBar value={Math.min(pourcentageMois, 100)} className="mt-2 h-3" progressClassName={getProgressColor(pourcentageMois)} />
                        </div>
                    </div>
                </div>

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
        </div>
    );
}
