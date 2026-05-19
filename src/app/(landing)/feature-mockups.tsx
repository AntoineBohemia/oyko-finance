"use client";

import { cx } from "@/utils/cx";

/**
 * Feature mockups for the landing page features grid.
 * Each mockup represents a real Oyko feature, rendered on dark bg (bg-gray-800).
 * Designed to feel like actual app screenshots, simplified and polished.
 */

// =============================================================================
// SHARED COMPONENTS
// =============================================================================

const MockupShell = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cx("flex flex-col overflow-hidden rounded-2xl bg-gray-800 shadow-2xl ring-1 ring-white/5", className)}>
        {children}
    </div>
);

const MockupHeader = ({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) => (
    <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.03] px-5 py-4">
        {left}
        {right}
    </div>
);

const ProgressBar = ({ percent, color = "bg-white" }: { percent: number; color?: string }) => (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className={cx("h-full rounded-full", color)} style={{ width: `${percent}%` }} />
    </div>
);

// =============================================================================
// 1. DASHBOARD MOCKUP
// =============================================================================

export const DashboardMockup = ({ className }: { className?: string }) => (
    <MockupShell className={className}>
        <MockupHeader
            left={
                <div>
                    <p className="text-xs text-gray-500">Solde disponible</p>
                    <p className="font-mono text-xl font-semibold text-white">1 247,50 €</p>
                </div>
            }
            right={
                <div className="rounded-full bg-[#BEFF00]/10 px-2.5 py-1">
                    <span className="text-xs font-medium text-[#BEFF00]">12j restants</span>
                </div>
            }
        />
        <div className="flex flex-1 flex-col gap-4 p-5">
            {/* Budget bar */}
            <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Budget semaine</span>
                    <span className="font-mono text-gray-300">320 € / 450 €</span>
                </div>
                <ProgressBar percent={71} color="bg-[#BEFF00]" />
            </div>

            {/* Enveloppes mini */}
            <div className="grid grid-cols-2 gap-2">
                {[
                    { emoji: "🍔", name: "Alimentation", spent: "182 €", pct: 65 },
                    { emoji: "🚇", name: "Transport", spent: "45 €", pct: 30 },
                    { emoji: "🎮", name: "Loisirs", spent: "95 €", pct: 85 },
                    { emoji: "👕", name: "Vêtements", spent: "0 €", pct: 0 },
                ].map((env) => (
                    <div key={env.name} className="rounded-lg bg-white/[0.03] p-3">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm">{env.emoji}</span>
                            <span className="text-xs text-gray-400">{env.name}</span>
                        </div>
                        <p className="mt-1 font-mono text-sm font-medium text-white">{env.spent}</p>
                        <div className="mt-2">
                            <ProgressBar percent={env.pct} color={env.pct > 80 ? "bg-[#D97706]" : "bg-white"} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Transactions */}
            <div className="divide-y divide-white/5">
                {[
                    { name: "Carrefour", cat: "Alimentation", amount: "-47,32 €", type: "expense" },
                    { name: "Salaire", cat: "Revenus", amount: "+2 800 €", type: "income" },
                ].map((tx) => (
                    <div key={tx.name} className="flex items-center justify-between py-2.5">
                        <div className="flex items-center gap-2.5">
                            <div className={cx("flex size-7 items-center justify-center rounded-full", tx.type === "income" ? "bg-[#BEFF00]/10" : "bg-white/5")}>
                                <span className="text-xs">{tx.type === "income" ? "↓" : "↑"}</span>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-200">{tx.name}</p>
                                <p className="text-[10px] text-gray-500">{tx.cat}</p>
                            </div>
                        </div>
                        <p className={cx("font-mono text-xs font-medium", tx.type === "income" ? "text-[#BEFF00]" : "text-gray-300")}>{tx.amount}</p>
                    </div>
                ))}
            </div>
        </div>
    </MockupShell>
);

// =============================================================================
// 2. DEPENSES MOCKUP
// =============================================================================

export const DepensesMockup = ({ className }: { className?: string }) => (
    <MockupShell className={className}>
        <MockupHeader
            left={<p className="text-sm font-medium text-white">Dépenses · Mai 2026</p>}
            right={<span className="text-xs text-gray-500">Ce mois</span>}
        />
        <div className="flex flex-1 flex-col gap-4 p-5">
            {/* Bar chart mini */}
            <div className="flex items-end gap-1.5 h-20">
                {[35, 52, 28, 65, 42, 78, 45, 30, 55, 40, 68, 25, 48, 60].map((h, i) => (
                    <div
                        key={i}
                        className={cx("flex-1 rounded-t", i === 5 ? "bg-[#BEFF00]" : "bg-white/15")}
                        style={{ height: `${h}%` }}
                    />
                ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-500">
                <span>1 mai</span>
                <span>Aujourd'hui</span>
                <span>31 mai</span>
            </div>

            {/* Transactions grouped */}
            <div>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-500">Aujourd'hui</p>
                <div className="divide-y divide-white/5">
                    {[
                        { name: "Monoprix", cat: "Alimentation", amount: "32,50 €" },
                        { name: "Uber", cat: "Transport", amount: "12,80 €" },
                        { name: "Spotify", cat: "Abonnements", amount: "9,99 €" },
                    ].map((tx) => (
                        <div key={tx.name} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2.5">
                                <div className="size-7 rounded-full bg-white/5" />
                                <div>
                                    <p className="text-xs font-medium text-gray-200">{tx.name}</p>
                                    <p className="text-[10px] text-gray-500">{tx.cat}</p>
                                </div>
                            </div>
                            <p className="font-mono text-xs text-gray-300">-{tx.amount}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-500">Hier</p>
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-full bg-white/5" />
                        <div>
                            <p className="text-xs font-medium text-gray-200">Amazon</p>
                            <p className="text-[10px] text-gray-500">Achats</p>
                        </div>
                    </div>
                    <p className="font-mono text-xs text-gray-300">-29,99 €</p>
                </div>
            </div>
        </div>
    </MockupShell>
);

// =============================================================================
// 3. BUDGET MOCKUP
// =============================================================================

export const BudgetMockup = ({ className }: { className?: string }) => (
    <MockupShell className={className}>
        <MockupHeader
            left={<p className="text-sm font-medium text-white">Budget · Mai 2026</p>}
            right={
                <div className="flex gap-1">
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-gray-400">◀</span>
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-gray-400">▶</span>
                </div>
            }
        />
        <div className="flex flex-1 flex-col gap-4 p-5">
            {/* Résumé */}
            <div className="rounded-lg bg-white/[0.03] p-3">
                <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Revenus</span>
                        <span className="font-mono font-medium text-[#BEFF00]">3 200 €</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">− Charges fixes</span>
                        <span className="font-mono text-gray-300">1 450 €</span>
                    </div>
                    <div className="mt-1 flex justify-between border-t border-white/5 pt-1.5">
                        <span className="font-medium text-gray-300">= Disponible</span>
                        <span className="font-mono font-semibold text-white">1 750 €</span>
                    </div>
                </div>
            </div>

            {/* Enveloppes */}
            <div>
                <p className="mb-3 text-xs font-medium text-gray-300">Enveloppes</p>
                <div className="flex flex-col gap-3">
                    {[
                        { emoji: "🍔", name: "Alimentation", spent: 280, budget: 400, pct: 70 },
                        { emoji: "🚇", name: "Transport", spent: 65, budget: 120, pct: 54 },
                        { emoji: "🎮", name: "Loisirs", spent: 175, budget: 200, pct: 88 },
                        { emoji: "👕", name: "Vêtements", spent: 45, budget: 100, pct: 45 },
                        { emoji: "🚨", name: "Imprévus", spent: 0, budget: 100, pct: 0 },
                    ].map((env) => (
                        <div key={env.name} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">{env.emoji}</span>
                                    <span className="text-xs text-gray-300">{env.name}</span>
                                </div>
                                <span className="font-mono text-[10px] text-gray-500">{env.spent} € / {env.budget} €</span>
                            </div>
                            <ProgressBar percent={env.pct} color={env.pct > 80 ? "bg-[#D97706]" : "bg-white"} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </MockupShell>
);

// =============================================================================
// 4. PATRIMOINE MOCKUP
// =============================================================================

export const PatrimoineMockup = ({ className }: { className?: string }) => (
    <MockupShell className={className}>
        <MockupHeader
            left={
                <div>
                    <p className="text-xs text-gray-500">Valeur nette</p>
                    <p className="font-mono text-xl font-semibold text-white">48 250 €</p>
                </div>
            }
            right={
                <div className="rounded-full bg-[#BEFF00]/10 px-2.5 py-1">
                    <span className="text-xs font-medium text-[#BEFF00]">+2.3%</span>
                </div>
            }
        />
        <div className="flex flex-1 flex-col gap-4 p-5">
            {/* Area chart mock */}
            <div className="relative h-24 overflow-hidden rounded-lg">
                <svg viewBox="0 0 300 80" className="h-full w-full" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="limeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#BEFF00" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#BEFF00" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,60 C30,55 60,50 90,45 C120,40 150,35 180,30 C210,25 240,18 270,15 L300,12 L300,80 L0,80 Z"
                        fill="url(#limeGrad)"
                    />
                    <path
                        d="M0,60 C30,55 60,50 90,45 C120,40 150,35 180,30 C210,25 240,18 270,15 L300,12"
                        fill="none"
                        stroke="#BEFF00"
                        strokeWidth="2"
                    />
                    {/* Passifs line (dashed, subtle) */}
                    <path
                        d="M0,65 C30,64 60,63 90,62 C120,61 150,60 180,58 C210,56 240,54 270,52 L300,50"
                        fill="none"
                        stroke="#57534E"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                    />
                </svg>
                <div className="absolute bottom-1 left-2 flex gap-4 text-[9px]">
                    <span className="flex items-center gap-1 text-gray-500"><span className="inline-block h-0.5 w-3 bg-[#BEFF00]" /> Valeur nette</span>
                    <span className="flex items-center gap-1 text-gray-500"><span className="inline-block h-0.5 w-3 border-t border-dashed border-gray-500" /> Passifs</span>
                </div>
            </div>

            {/* Répartition */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    { label: "Liquidités", amount: "12 400 €", color: "bg-white" },
                    { label: "Investissements", amount: "42 350 €", color: "bg-[#BEFF00]" },
                    { label: "Dettes", amount: "-6 500 €", color: "bg-gray-500" },
                ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-white/[0.03] p-2.5">
                        <div className={cx("mb-1.5 h-1 w-6 rounded-full", item.color)} />
                        <p className="text-[10px] text-gray-500">{item.label}</p>
                        <p className="font-mono text-xs font-medium text-white">{item.amount}</p>
                    </div>
                ))}
            </div>

            {/* Comptes */}
            <div>
                <p className="mb-2 text-xs font-medium text-gray-300">Comptes</p>
                <div className="divide-y divide-white/5">
                    {[
                        { name: "Compte courant", bank: "BNP Paribas", amount: "3 240 €" },
                        { name: "Livret A", bank: "BNP Paribas", amount: "8 500 €" },
                        { name: "PEA", bank: "Boursorama", amount: "42 350 €" },
                    ].map((c) => (
                        <div key={c.name} className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-xs font-medium text-gray-200">{c.name}</p>
                                <p className="text-[10px] text-gray-500">{c.bank}</p>
                            </div>
                            <p className="font-mono text-xs text-gray-300">{c.amount}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </MockupShell>
);

// =============================================================================
// MOCKUP SWITCHER — Renders the correct mockup based on selected feature
// =============================================================================

export const FeatureMockup = ({ selectedId, className }: { selectedId: string; className?: string }) => {
    const mockups: Record<string, React.ReactNode> = {
        dashboard: <DashboardMockup className={className} />,
        depenses: <DepensesMockup className={className} />,
        budget: <BudgetMockup className={className} />,
        patrimoine: <PatrimoineMockup className={className} />,
    };

    return mockups[selectedId] || mockups.dashboard;
};
