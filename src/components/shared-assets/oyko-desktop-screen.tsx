"use client";

import { cx } from "@/utils/cx";

/**
 * OykoDesktopScreen — Light-mode realistic dashboard mockup.
 * Used inside MacBook frame on landing hero & signup page.
 */
export const OykoDesktopScreen = () => (
    <div className="flex h-full bg-[#FAFAF8]">
        {/* Sidebar — full with labels */}
        <div className="flex w-44 flex-col border-r border-gray-200 bg-white px-3 py-4">
            {/* Logo */}
            <div className="flex items-center gap-2 px-1">
                <div className="flex size-7 items-center justify-center rounded-lg bg-gray-900">
                    <span className="text-[10px] font-black text-[#BEFF00]">O</span>
                </div>
                <span className="text-[11px] font-semibold text-gray-900">Oyko</span>
            </div>

            {/* Search */}
            <div className="mt-4 flex h-6 items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2">
                <svg className="size-2.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span className="text-[9px] text-gray-400">Rechercher</span>
                <span className="ml-auto rounded bg-gray-100 px-1 py-0.5 text-[7px] text-gray-400">⌘K</span>
            </div>

            {/* Nav */}
            <nav className="mt-4 flex flex-col gap-0.5">
                {[
                    { icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", label: "Accueil", active: true },
                    { icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2", label: "Dashboard" },
                    { icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", label: "Dépenses" },
                    { icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", label: "Budget" },
                    { icon: "M21 12a9 9 0 1 1-9-9c3.6 0 6.6 2 8 5", label: "Patrimoine" },
                    { icon: "M16 8v8M12 11v5M8 14v2", label: "Statistiques" },
                ].map((item) => (
                    <div key={item.label} className={cx("flex items-center gap-2 rounded-md px-2 py-1.5", item.active ? "bg-gray-50 font-medium text-gray-900" : "text-gray-500")}>
                        <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                        <span className="text-[9px]">{item.label}</span>
                    </div>
                ))}
            </nav>

            {/* Bottom */}
            <div className="mt-auto flex flex-col gap-0.5 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-gray-500">
                    <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    <span className="text-[9px]">Paramètres</span>
                </div>
                {/* User */}
                <div className="flex items-center gap-2 rounded-lg border border-gray-100 px-2 py-1.5">
                    <div className="flex size-6 items-center justify-center rounded-full bg-gray-900 text-[8px] font-semibold text-white">AM</div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[9px] font-medium text-gray-900">Antoine Moulin</p>
                        <p className="truncate text-[8px] text-gray-400">antoine@oyko.fr</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
                <div>
                    <p className="text-[9px] text-gray-400">Bonjour, Antoine</p>
                    <p className="text-[12px] font-semibold text-gray-900">Mon Dashboard</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-md border border-gray-200">
                        <svg className="size-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    </div>
                </div>
            </div>

            <div className="px-5 py-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Solde total", value: "4 247,50 €", change: "+320 €", up: true },
                        { label: "Dépenses ce mois", value: "1 847,32 €", change: "-12%", up: false },
                        { label: "Patrimoine net", value: "48 250 €", change: "+2.3%", up: true },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-3">
                            <p className="text-[8px] text-gray-500">{stat.label}</p>
                            <p className="mt-1 font-mono text-[13px] font-bold text-gray-900">{stat.value}</p>
                            <span className={cx("mt-0.5 inline-flex items-center gap-0.5 text-[8px] font-medium", stat.up ? "text-emerald-600" : "text-red-500")}>
                                {stat.up ? "↑" : "↓"} {stat.change}
                                <span className="font-normal text-gray-400">vs mois dernier</span>
                            </span>
                        </div>
                    ))}
                </div>

                {/* Chart + Budget row */}
                <div className="mt-3 grid grid-cols-5 gap-3">
                    {/* Chart */}
                    <div className="col-span-3 rounded-lg border border-gray-200 bg-white p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-medium text-gray-900">Évolution du solde</p>
                                <p className="mt-0.5 font-mono text-[11px] font-bold text-gray-900">4 247,50 €</p>
                            </div>
                            <div className="flex gap-0.5">
                                {["1M", "3M", "6M"].map((p) => (
                                    <span key={p} className={cx("rounded px-1.5 py-0.5 text-[7px]", p === "3M" ? "bg-gray-900 text-white" : "text-gray-400")}>
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="mt-3 h-20">
                            <svg viewBox="0 0 400 80" className="h-full w-full" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="mockup-chart-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#84A300" stopOpacity="0.15" />
                                        <stop offset="100%" stopColor="#84A300" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <line x1="0" y1="20" x2="400" y2="20" stroke="#E5E7EB" strokeWidth="0.5" />
                                <line x1="0" y1="40" x2="400" y2="40" stroke="#E5E7EB" strokeWidth="0.5" />
                                <line x1="0" y1="60" x2="400" y2="60" stroke="#E5E7EB" strokeWidth="0.5" />
                                <path d="M0,55 C30,53 50,50 80,46 C110,42 130,45 160,38 C190,30 210,26 240,20 C270,15 300,12 330,9 C360,7 380,5 400,4 L400,80 L0,80 Z" fill="url(#mockup-chart-grad)" />
                                <path d="M0,55 C30,53 50,50 80,46 C110,42 130,45 160,38 C190,30 210,26 240,20 C270,15 300,12 330,9 C360,7 380,5 400,4" fill="none" stroke="#84A300" strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="400" cy="4" r="3" fill="#84A300" />
                            </svg>
                        </div>
                        <div className="mt-1 flex justify-between text-[7px] text-gray-400">
                            <span>Jan</span><span>Fév</span><span>Mar</span><span>Avr</span><span>Mai</span>
                        </div>
                    </div>

                    {/* Budget */}
                    <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-3">
                        <p className="text-[9px] font-medium text-gray-900">Budget · Mai</p>
                        <div className="mt-3 flex flex-col gap-2.5">
                            {[
                                { emoji: "🍔", name: "Alimentation", spent: 280, total: 400 },
                                { emoji: "🚇", name: "Transport", spent: 65, total: 120 },
                                { emoji: "🎮", name: "Loisirs", spent: 175, total: 200 },
                                { emoji: "👕", name: "Vêtements", spent: 45, total: 100 },
                            ].map((env) => {
                                const pct = Math.round((env.spent / env.total) * 100);
                                return (
                                    <div key={env.name}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[8px]">{env.emoji}</span>
                                                <span className="text-[8px] text-gray-700">{env.name}</span>
                                            </div>
                                            <span className="font-mono text-[7px] text-gray-400">{env.spent} / {env.total} €</span>
                                        </div>
                                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className={cx("h-full rounded-full", pct > 80 ? "bg-amber-500" : "bg-gray-800")}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Transactions table */}
                <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[9px] font-medium text-gray-900">Transactions récentes</p>
                        <span className="text-[8px] text-gray-400">Voir tout →</span>
                    </div>
                    {/* Table header */}
                    <div className="mt-2 flex items-center border-b border-gray-100 pb-1.5 text-[7px] font-medium text-gray-400">
                        <span className="w-2/5">Transaction</span>
                        <span className="w-1/5">Catégorie</span>
                        <span className="w-1/5">Date</span>
                        <span className="w-1/5 text-right">Montant</span>
                    </div>
                    {/* Table rows */}
                    <div className="flex flex-col divide-y divide-gray-50">
                        {[
                            { name: "Carrefour Market", cat: "Alimentation", date: "19 mai", amount: "-47,32 €", positive: false },
                            { name: "Salaire Mai", cat: "Revenus", date: "15 mai", amount: "+2 800,00 €", positive: true },
                            { name: "Netflix", cat: "Abonnement", date: "14 mai", amount: "-13,99 €", positive: false },
                            { name: "SNCF Voyages", cat: "Transport", date: "13 mai", amount: "-35,00 €", positive: false },
                            { name: "Virement Pierre", cat: "Remboursement", date: "12 mai", amount: "+150,00 €", positive: true },
                        ].map((tx) => (
                            <div key={tx.name} className="flex items-center py-1.5">
                                <div className="flex w-2/5 items-center gap-1.5">
                                    <div className={cx("flex size-4 items-center justify-center rounded-full text-[7px]", tx.positive ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400")}>
                                        {tx.positive ? "↓" : "↑"}
                                    </div>
                                    <span className="text-[8px] font-medium text-gray-900">{tx.name}</span>
                                </div>
                                <span className="w-1/5 text-[8px] text-gray-400">{tx.cat}</span>
                                <span className="w-1/5 text-[8px] text-gray-400">{tx.date}</span>
                                <span className={cx("w-1/5 text-right font-mono text-[8px] font-medium", tx.positive ? "text-emerald-600" : "text-gray-700")}>{tx.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
