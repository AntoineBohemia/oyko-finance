"use client";

import type { FC } from "react";
import {
    CheckCircle,
    Circle,
    Clock,
    CreditCard01,
    HomeLine,
    LineChartUp03,
    LogIn01,
    PieChart03,
    Receipt,
    Rocket01,
    Settings01,
    UserPlus01,
    Wallet02,
} from "@untitledui/icons";
import Link from "next/link";
import { cx } from "@/utils/cx";

// =============================================================================
// TYPES
// =============================================================================

interface NavCard {
    label: string;
    description: string;
    href: string;
    icon: FC<{ className?: string }>;
    status?: "done" | "in-progress" | "todo";
}

// =============================================================================
// DATA
// =============================================================================

const authPages: NavCard[] = [
    {
        label: "Login",
        description: "Se connecter à son compte",
        href: "/login",
        icon: LogIn01,
        status: "done",
    },
    {
        label: "Signup",
        description: "Créer un nouveau compte",
        href: "/signup",
        icon: UserPlus01,
        status: "done",
    },
    {
        label: "Onboarding",
        description: "Configuration initiale",
        href: "/onboarding",
        icon: Rocket01,
        status: "done",
    },
];

const appPages: NavCard[] = [
    {
        label: "Accueil",
        description: "Vue d'ensemble hebdomadaire",
        href: "/dashboard",
        icon: HomeLine,
        status: "in-progress",
    },
    {
        label: "Dépenses",
        description: "Gérez vos dépenses",
        href: "/depenses",
        icon: Receipt,
        status: "todo",
    },
    {
        label: "Budget",
        description: "Enveloppes budgétaires",
        href: "/budget",
        icon: PieChart03,
        status: "in-progress",
    },
    {
        label: "Patrimoine",
        description: "Comptes, investissements, dettes",
        href: "/patrimoine",
        icon: Wallet02,
        status: "todo",
    },
    {
        label: "Paramètres",
        description: "Configurez votre application",
        href: "/parametres",
        icon: Settings01,
        status: "todo",
    },
];

const legacyPages: NavCard[] = [
    {
        label: "Transactions",
        description: "Anciennes transactions",
        href: "/transactions",
        icon: Receipt,
    },
    {
        label: "Comptes",
        description: "Ancienne page comptes",
        href: "/comptes",
        icon: CreditCard01,
    },
    {
        label: "Investissements",
        description: "Ancienne page investissements",
        href: "/investissements",
        icon: LineChartUp03,
    },
    {
        label: "Dettes",
        description: "Ancienne page dettes",
        href: "/dettes",
        icon: Wallet02,
    },
];

// =============================================================================
// STATUS BADGE
// =============================================================================

const StatusBadge = ({ status }: { status?: "done" | "in-progress" | "todo" }) => {
    if (!status) return null;

    const config = {
        done: {
            icon: CheckCircle,
            label: "Terminé",
            className: "bg-emerald-50 text-emerald-600 ring-emerald-200/50",
        },
        "in-progress": {
            icon: Clock,
            label: "En cours",
            className: "bg-amber-50 text-amber-600 ring-amber-200/50",
        },
        todo: {
            icon: Circle,
            label: "À faire",
            className: "bg-gray-50 text-gray-500 ring-gray-200/50",
        },
    };

    const { icon: Icon, label, className } = config[status];

    return (
        <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset", className)}>
            <Icon className="size-3" />
            {label}
        </span>
    );
};

// =============================================================================
// PROGRESS CARD
// =============================================================================

const ProgressCard = () => {
    const allPages = [...authPages, ...appPages];
    const done = allPages.filter((p) => p.status === "done").length;
    const inProgress = allPages.filter((p) => p.status === "in-progress").length;
    const total = allPages.length;
    const percentage = Math.round((done / total) * 100);

    return (
        <div className="rounded-2xl border border-gray-200/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
            <h3 className="mb-5 text-sm font-semibold text-gray-900">Progression</h3>

            {/* Circular progress */}
            <div className="mb-6 flex items-center justify-center">
                <div className="relative">
                    <svg className="size-28 -rotate-90 transform">
                        <circle cx="56" cy="56" r="48" stroke="#f3f4f6" strokeWidth="6" fill="none" />
                        <circle
                            cx="56"
                            cy="56"
                            r="48"
                            stroke="url(#progressGradientLight)"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${percentage * 3.02} 302`}
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="progressGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#a855f7" />
                                <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-emerald-50 px-2 py-3">
                    <div className="text-lg font-semibold text-emerald-600">{done}</div>
                    <div className="text-[11px] text-emerald-600/70">Terminés</div>
                </div>
                <div className="rounded-xl bg-amber-50 px-2 py-3">
                    <div className="text-lg font-semibold text-amber-600">{inProgress}</div>
                    <div className="text-[11px] text-amber-600/70">En cours</div>
                </div>
                <div className="rounded-xl bg-gray-50 px-2 py-3">
                    <div className="text-lg font-semibold text-gray-500">{total - done - inProgress}</div>
                    <div className="text-[11px] text-gray-400">À faire</div>
                </div>
            </div>

            {/* Progress bars */}
            <div className="mt-6 space-y-3">
                <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-700">Auth Flow</span>
                        <span className="text-emerald-600">3/3</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
                    </div>
                </div>
                <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-700">App Pages</span>
                        <span className="text-amber-600">0/5</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full w-[40%] rounded-full bg-gradient-to-r from-amber-500 to-amber-400" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// NAV CARD COMPONENT
// =============================================================================

const NavCardItem = ({ page, variant = "default" }: { page: NavCard; variant?: "default" | "legacy" }) => {
    const Icon = page.icon;
    const isLegacy = variant === "legacy";

    return (
        <Link href={page.href} className="group block">
            <div
                className={cx(
                    "relative rounded-2xl border bg-white/70 p-5 backdrop-blur-sm transition-all duration-200",
                    isLegacy
                        ? "border-gray-100 bg-white/50 p-4 hover:border-gray-200 hover:bg-white/80"
                        : "border-gray-200/60 shadow-sm hover:border-gray-300/60 hover:bg-white/90 hover:shadow-md",
                )}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-3">
                        <div
                            className={cx(
                                "flex items-center justify-center rounded-xl transition-all duration-200",
                                isLegacy
                                    ? "size-9 bg-gray-100/80 text-gray-400 group-hover:bg-gray-200/80 group-hover:text-gray-500"
                                    : "size-11 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 group-hover:from-violet-50 group-hover:to-indigo-50 group-hover:text-violet-600",
                            )}
                        >
                            <Icon className={isLegacy ? "size-4" : "size-5"} />
                        </div>
                        <div>
                            <h3 className={cx("font-semibold", isLegacy ? "text-sm text-gray-500" : "text-[15px] text-gray-900")}>{page.label}</h3>
                            <p className={cx("mt-0.5", isLegacy ? "text-xs text-gray-400" : "text-sm text-gray-500")}>{page.description}</p>
                        </div>
                    </div>

                    {page.status && <StatusBadge status={page.status} />}
                </div>
            </div>
        </Link>
    );
};

// =============================================================================
// DEV TOOLS CARD
// =============================================================================

const DevToolsCard = () => {
    const handleClearStorage = () => {
        localStorage.removeItem("budget-user");
        localStorage.removeItem("budget-onboarding");
        localStorage.removeItem("budget-onboarding-completed");
        window.location.reload();
    };

    return (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white/50 p-5 backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Outils Dev</h3>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={handleClearStorage}
                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 ring-1 ring-red-200/50 transition-colors ring-inset hover:bg-red-100"
                >
                    Clear localStorage
                </button>
                <button
                    onClick={() => {
                        localStorage.setItem("budget-user", JSON.stringify({ email: "test@test.com", name: "Test User" }));
                        localStorage.setItem("budget-onboarding-completed", "true");
                        window.location.reload();
                    }}
                    className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-600 ring-1 ring-emerald-200/50 transition-colors ring-inset hover:bg-emerald-100"
                >
                    Simuler connecté
                </button>
                <button
                    onClick={() => {
                        localStorage.setItem("budget-user", JSON.stringify({ email: "test@test.com", name: "Test User" }));
                        localStorage.removeItem("budget-onboarding-completed");
                        window.location.reload();
                    }}
                    className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-600 ring-1 ring-amber-200/50 transition-colors ring-inset hover:bg-amber-100"
                >
                    Sans onboarding
                </button>
            </div>
        </div>
    );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function IndexPage() {
    return (
        <div className="relative min-h-screen">
            {/* Gradient background - légèrement plus présent */}
            <div className="fixed inset-0 -z-10">
                {/* Base white/off-white */}
                <div className="absolute inset-0 bg-[#fafafa]" />

                {/* Violet/lavande en haut - plus visible */}
                <div
                    className="absolute inset-x-0 top-0 h-[80vh]"
                    style={{
                        background: "radial-gradient(ellipse 90% 60% at 50% 0%, rgba(192, 180, 220, 0.4) 0%, transparent 65%)",
                    }}
                />

                {/* Pêche/corail en bas - plus présent */}
                <div
                    className="absolute inset-x-0 bottom-0 h-[70vh]"
                    style={{
                        background: "radial-gradient(ellipse 90% 60% at 50% 100%, rgba(255, 200, 170, 0.45) 0%, transparent 65%)",
                    }}
                />

                {/* Bleu clair à gauche */}
                <div
                    className="absolute bottom-0 left-0 h-[60vh] w-[50vw]"
                    style={{
                        background: "radial-gradient(ellipse 100% 100% at 0% 100%, rgba(180, 210, 240, 0.35) 0%, transparent 55%)",
                    }}
                />

                {/* Touch de rose/magenta subtil à droite */}
                <div
                    className="absolute top-[20%] right-0 h-[40vh] w-[30vw]"
                    style={{
                        background: "radial-gradient(ellipse 100% 100% at 100% 30%, rgba(230, 190, 220, 0.25) 0%, transparent 50%)",
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="mb-16 text-center">
                        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
                            <Wallet02 className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Budget App</h1>
                        <p className="mt-3 text-lg text-gray-500">Index de développement</p>
                    </div>

                    {/* Main grid */}
                    <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
                        {/* Left column - Pages */}
                        <div className="space-y-10">
                            {/* Auth Pages */}
                            <section>
                                <h2 className="mb-5 text-xs font-semibold tracking-widest text-gray-400 uppercase">Authentification</h2>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {authPages.map((page) => (
                                        <NavCardItem key={page.href} page={page} />
                                    ))}
                                </div>
                            </section>

                            {/* App Pages */}
                            <section>
                                <h2 className="mb-5 text-xs font-semibold tracking-widest text-gray-400 uppercase">Application</h2>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {appPages.map((page) => (
                                        <NavCardItem key={page.href} page={page} />
                                    ))}
                                </div>
                            </section>

                            {/* Legacy Pages */}
                            <section>
                                <h2 className="mb-4 text-xs font-semibold tracking-widest text-gray-300 uppercase">Legacy</h2>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    {legacyPages.map((page) => (
                                        <NavCardItem key={page.href} page={page} variant="legacy" />
                                    ))}
                                </div>
                            </section>

                            {/* Dev Tools - Mobile */}
                            <div className="lg:hidden">
                                <DevToolsCard />
                            </div>
                        </div>

                        {/* Right column - Progress & Dev Tools */}
                        <div className="hidden lg:block">
                            <div className="sticky top-8 space-y-5">
                                <ProgressCard />
                                <DevToolsCard />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Progress Card */}
                    <div className="mt-10 lg:hidden">
                        <ProgressCard />
                    </div>
                </div>
            </div>
        </div>
    );
}
