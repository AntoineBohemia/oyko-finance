"use client";

import type { HTMLAttributes } from "react";
import { ArrowUpRight, ArrowDownRight, TrendUp02, Wallet02, PiggyBank01, CreditCard02 } from "@untitledui/icons";
import { cx } from "@/utils/cx";

/**
 * Landing page chart mockups — always rendered on dark background (bg-gray-900).
 * All colors are hardcoded for dark context, not using semantic tokens.
 */

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
    <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-white/10">
            <Icon className="size-5 text-gray-300" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-semibold text-white">{value}</p>
        </div>
        <div
            className={cx(
                "flex items-center gap-0.5 text-xs font-medium",
                trend === "up" ? "text-[#BEFF00]" : "text-gray-400",
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
                    type === "income" ? "bg-[#BEFF00]/10" : "bg-white/5",
                )}
            >
                {type === "income" ? (
                    <ArrowDownRight className="size-4 text-[#BEFF00]" />
                ) : (
                    <ArrowUpRight className="size-4 text-gray-400" />
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-200">{name}</p>
                <p className="text-xs text-gray-500">{category}</p>
            </div>
        </div>
        <p className={cx("text-sm font-semibold", type === "income" ? "text-[#BEFF00]" : "text-gray-300")}>
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
                <span className="text-gray-300">{category}</span>
                <span className="text-gray-500">{spent}€ / {total}€</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className={cx("h-full rounded-full", color)} style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
};

// =============================================================================
// OYKO DASHBOARD MOCKUP
// =============================================================================

export const OykoUsersChart = (props: HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            {...props}
            className={cx(
                "flex flex-col overflow-hidden rounded-2xl bg-gray-800 shadow-2xl ring-1 ring-white/5",
                props.className,
            )}
        >
            {/* Header */}
            <div className="border-b border-white/5 bg-white/[0.03] px-5 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Solde total</p>
                        <p className="font-mono text-xl font-semibold text-white">12 458,32 €</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-[#BEFF00]/10 px-2 py-1">
                        <TrendUp02 className="size-3.5 text-[#BEFF00]" />
                        <span className="text-xs font-medium text-[#BEFF00]">+2.4%</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-4 p-5">
                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-3">
                    <MiniStat label="Revenus" value="3 200 €" trend="up" trendValue="12%" icon={Wallet02} />
                    <MiniStat label="Dépenses" value="2 450 €" trend="down" trendValue="8%" icon={CreditCard02} />
                </div>

                {/* Budget progress */}
                <div className="space-y-3 rounded-xl bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-200">Budgets du mois</p>
                        <span className="text-xs text-[#BEFF00]">Voir tout</span>
                    </div>
                    <div className="space-y-3">
                        <BudgetProgress category="Alimentation" spent={320} total={400} color="bg-white" />
                        <BudgetProgress category="Transport" spent={85} total={150} color="bg-[#BEFF00]" />
                        <BudgetProgress category="Loisirs" spent={180} total={200} color="bg-[#D97706]" />
                    </div>
                </div>

                {/* Recent transactions */}
                <div className="flex-1">
                    <p className="mb-2 text-sm font-medium text-gray-200">Transactions récentes</p>
                    <div className="divide-y divide-white/5">
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
// OYKO SAVINGS CHART
// =============================================================================

export const OykoActiveChart = (props: HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            {...props}
            className={cx(
                "flex flex-col overflow-hidden rounded-2xl bg-gray-800 shadow-2xl ring-1 ring-white/5",
                props.className,
            )}
        >
            {/* Header — lime accent */}
            <div className="bg-[#BEFF00] px-4 py-3">
                <div className="flex items-center gap-2">
                    <PiggyBank01 className="size-5 text-gray-900/60" />
                    <p className="text-sm font-medium text-gray-900">Épargne</p>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col items-center justify-center p-4">
                <p className="font-mono text-display-xs font-semibold text-white">1 250 €</p>
                <p className="text-xs text-gray-500">ce mois-ci</p>

                {/* Progress ring */}
                <div className="relative mt-3 size-16">
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" className="stroke-white/10" strokeWidth="3" />
                        <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="none"
                            className="stroke-[#BEFF00]"
                            strokeWidth="3"
                            strokeDasharray="94.2"
                            strokeDashoffset="18.84"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold text-[#BEFF00]">80%</span>
                    </div>
                </div>

                <p className="mt-2 text-center text-xs text-gray-500">Objectif : 1 500 €</p>
            </div>
        </div>
    );
};
