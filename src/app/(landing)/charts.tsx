"use client";

import type { HTMLAttributes } from "react";
import { ArrowUpRight, ArrowDownRight, TrendUp02, Wallet02, PiggyBank01, CreditCard02 } from "@untitledui/icons";
import { cx } from "@/utils/cx";

// =============================================================================
// MINI STAT CARD
// =============================================================================

const MiniStat = ({
    label,
    value,
    trend,
    trendValue,
    icon: Icon,
}: {
    label: string;
    value: string;
    trend: "up" | "down";
    trendValue: string;
    icon: typeof Wallet02;
}) => (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
        <div className="flex size-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/50">
            <Icon className="size-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-xs text-tertiary">{label}</p>
            <p className="text-sm font-semibold text-primary">{value}</p>
        </div>
        <div
            className={cx(
                "flex items-center gap-0.5 text-xs font-medium",
                trend === "up" ? "text-success-600" : "text-error-600"
            )}
        >
            {trend === "up" ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {trendValue}
        </div>
    </div>
);

// =============================================================================
// TRANSACTION ROW
// =============================================================================

const TransactionRow = ({
    name,
    category,
    amount,
    type,
}: {
    name: string;
    category: string;
    amount: string;
    type: "income" | "expense";
}) => (
    <div className="flex items-center justify-between py-2.5">
        <div className="flex items-center gap-3">
            <div
                className={cx(
                    "flex size-8 items-center justify-center rounded-full",
                    type === "income" ? "bg-success-100 dark:bg-success-900/30" : "bg-gray-100 dark:bg-gray-800"
                )}
            >
                {type === "income" ? (
                    <ArrowDownRight className="size-4 text-success-600" />
                ) : (
                    <ArrowUpRight className="size-4 text-gray-500" />
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-primary">{name}</p>
                <p className="text-xs text-tertiary">{category}</p>
            </div>
        </div>
        <p
            className={cx(
                "text-sm font-semibold",
                type === "income" ? "text-success-600" : "text-primary"
            )}
        >
            {type === "income" ? "+" : "-"}{amount}
        </p>
    </div>
);

// =============================================================================
// PROGRESS BAR
// =============================================================================

const BudgetProgress = ({
    category,
    spent,
    total,
    color,
}: {
    category: string;
    spent: number;
    total: number;
    color: string;
}) => {
    const percent = Math.round((spent / total) * 100);
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="text-secondary">{category}</span>
                <span className="text-tertiary">{spent}€ / {total}€</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div className={cx("h-full rounded-full", color)} style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
};

// =============================================================================
// OYKO DASHBOARD MOCKUP - Dashboard réaliste
// =============================================================================

export const OykoUsersChart = (props: HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            {...props}
            className={cx(
                "flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10",
                props.className,
            )}
        >
            {/* Header */}
            <div className="border-b border-gray-100 bg-gray-50/80 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-tertiary">Solde total</p>
                        <p className="text-xl font-semibold text-primary">12 458,32 €</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-success-50 px-2 py-1 dark:bg-success-900/30">
                        <TrendUp02 className="size-3.5 text-success-600" />
                        <span className="text-xs font-medium text-success-700 dark:text-success-400">+2.4%</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-4 p-5">
                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-3">
                    <MiniStat
                        label="Revenus"
                        value="3 200 €"
                        trend="up"
                        trendValue="12%"
                        icon={Wallet02}
                    />
                    <MiniStat
                        label="Dépenses"
                        value="2 450 €"
                        trend="down"
                        trendValue="8%"
                        icon={CreditCard02}
                    />
                </div>

                {/* Budget progress */}
                <div className="space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/30">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-primary">Budgets du mois</p>
                        <span className="text-xs text-brand-600">Voir tout</span>
                    </div>
                    <div className="space-y-3">
                        <BudgetProgress category="Alimentation" spent={320} total={400} color="bg-brand-500" />
                        <BudgetProgress category="Transport" spent={85} total={150} color="bg-teal-500" />
                        <BudgetProgress category="Loisirs" spent={180} total={200} color="bg-amber-500" />
                    </div>
                </div>

                {/* Recent transactions */}
                <div className="flex-1">
                    <p className="mb-2 text-sm font-medium text-primary">Transactions récentes</p>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        <TransactionRow name="Carrefour" category="Alimentation" amount="47,32 €" type="expense" />
                        <TransactionRow name="Salaire" category="Revenus" amount="2 450,00 €" type="income" />
                        <TransactionRow name="Netflix" category="Abonnements" amount="13,99 €" type="expense" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// OYKO SAVINGS CHART - Épargne avec objectifs
// =============================================================================

export const OykoActiveChart = (props: HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            {...props}
            className={cx(
                "flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10",
                props.className,
            )}
        >
            {/* Header */}
            <div className="border-b border-gray-100 bg-gradient-to-br from-brand-500 to-brand-600 px-4 py-3 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <PiggyBank01 className="size-5 text-white/80" />
                    <p className="text-sm font-medium text-white">Épargne</p>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col items-center justify-center p-4">
                <p className="text-display-xs font-semibold text-primary">1 250 €</p>
                <p className="text-xs text-tertiary">ce mois-ci</p>

                {/* Progress ring visual */}
                <div className="relative mt-3 size-16">
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                        <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="none"
                            className="stroke-gray-100 dark:stroke-gray-800"
                            strokeWidth="3"
                        />
                        <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="none"
                            className="stroke-brand-500"
                            strokeWidth="3"
                            strokeDasharray="94.2"
                            strokeDashoffset="18.84"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold text-brand-600">80%</span>
                    </div>
                </div>

                <p className="mt-2 text-center text-xs text-tertiary">
                    Objectif : 1 500 €
                </p>
            </div>
        </div>
    );
};
