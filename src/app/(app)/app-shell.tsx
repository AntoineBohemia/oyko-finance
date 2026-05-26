"use client";

import type { FC, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
    Bell01,
    HomeLine,
    LogOut01,
    Menu01,
    Receipt,
    SearchLg,
    Settings01,
    Wallet02,
    X,
} from "@untitledui/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarNavigationSlim } from "@/components/application/app-navigation/sidebar-navigation/sidebar-slim";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { AppDataPrefetch } from "@/providers/app-data-prefetch";
import { cx } from "@/utils/cx";

// ============================================
// NAVIGATION CONFIG
// ============================================

interface NavItem {
    label: string;
    href: string;
    icon: FC<{ className?: string }>;
    badge?: string;
    hasNotification?: boolean;
}

const hasHomeNotifications = false;

const navItems: NavItem[] = [
    {
        label: "Accueil",
        href: "/dashboard",
        icon: HomeLine,
        hasNotification: hasHomeNotifications,
    },
    {
        label: "Mon budget",
        href: "/budget",
        icon: Receipt,
    },
    {
        label: "Patrimoine",
        href: "/patrimoine",
        icon: Wallet02,
    },
];

const footerItems: NavItem[] = [
    {
        label: "Paramètres",
        href: "/parametres",
        icon: Settings01,
    },
];

// ============================================
// PAGE METADATA
// ============================================

const pageMetadata: Record<string, { title: string; description: string; showSearch?: boolean }> = {
    "/dashboard": {
        title: "Accueil",
        description: "Vue d'ensemble de vos finances",
        showSearch: false,
    },
    "/budget": {
        title: "Mon budget",
        description: "Gérez vos dépenses, enveloppes et charges fixes",
        showSearch: false,
    },
    "/patrimoine": {
        title: "Patrimoine",
        description: "Gérez vos comptes et investissements",
        showSearch: true,
    },
    "/patrimoine/investissements": {
        title: "Investissements",
        description: "Suivez la performance de votre portfolio",
        showSearch: true,
    },
    "/patrimoine/dettes": {
        title: "Dettes",
        description: "Suivez vos emprunts et remboursements",
        showSearch: true,
    },
    "/parametres": {
        title: "Paramètres",
        description: "Configurez votre application",
        showSearch: false,
    },
};

// ============================================
// MOBILE NAV — Dark drawer (matches sidebar)
// ============================================

const MobileNav = ({ isOpen, onClose, pathname, onLogout }: { isOpen: boolean; onClose: () => void; pathname: string; onLogout: () => void }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden" onClick={onClose} />

            {/* Drawer — dark background matching sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gray-900 shadow-xl lg:hidden">
                {/* Header */}
                <div className="flex h-16 items-center justify-between border-b border-gray-700 px-4">
                    <span className="font-display text-lg font-semibold text-white">Oyko</span>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:text-gray-200">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                    <ul className="flex flex-col gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        className={cx(
                                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                            isActive ? "text-[#BEFF00]" : "text-gray-400 hover:text-gray-200",
                                        )}
                                    >
                                        <span className="relative">
                                            <Icon className="h-5 w-5" />
                                            {item.hasNotification && (
                                                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#BEFF00]" />
                                            )}
                                        </span>
                                        <span className="flex-1">{item.label}</span>
                                        {item.badge && (
                                            <Badge type="modern" size="sm">
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="my-4 border-t border-gray-700" />

                    <ul className="flex flex-col gap-1">
                        {footerItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        className={cx(
                                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                            isActive ? "text-[#BEFF00]" : "text-gray-400 hover:text-gray-200",
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User */}
                <div className="border-t border-gray-700 p-4">
                    <div className="flex items-center gap-3">
                        <Avatar size="md" alt="Antoine" initials="AN" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-200">Antoine</p>
                            <p className="truncate text-xs text-gray-500">antoine@email.com</p>
                        </div>
                        <button onClick={onLogout} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:text-gray-300">
                            <LogOut01 className="size-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

// ============================================
// LAYOUT COMPONENT
// ============================================

export function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);

    useEffect(() => {
        setIsDemoMode(document.cookie.includes("demo_mode=true"));
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            document.cookie = "demo_mode=; path=/; max-age=0";
            window.location.href = "/login";
        } catch (e) {
            console.error(e);
        }
    };

    const currentPage = pageMetadata[pathname] || {
        title: "Oyko",
        description: "",
        showSearch: false,
    };

    return (
        <div className="flex min-h-screen bg-primary">
            <AppDataPrefetch />
            {/* Sidebar Desktop */}
            <SidebarNavigationSlim items={navItems} footerItems={footerItems} activeUrl={pathname} />

            {/* Mobile Nav */}
            <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} pathname={pathname} onLogout={handleLogout} />

            {/* Main Content */}
            <div className="flex min-h-screen flex-1 flex-col lg:pl-[68px]">
                {/* Mobile Header */}
                <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E5E2DC] bg-[#F5F3EF] px-4 lg:hidden">
                    <div className="flex items-center gap-3">
                        <ButtonUtility size="sm" color="tertiary" icon={Menu01} onClick={() => setMobileNavOpen(true)} />
                        <span className="text-sm font-semibold text-gray-900">{currentPage.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ButtonUtility size="sm" color="tertiary" icon={SearchLg} />
                        <ButtonUtility size="sm" color="tertiary" icon={Bell01} />
                        <Avatar size="sm" alt="Antoine" initials="AN" />
                    </div>
                </header>

                {/* Page Content */}
                <main className="relative flex-1">
                    {/* Grain noise texture — 3% opacity per visual identity */}
                    <svg className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.03]" aria-hidden="true">
                        <filter id="grain-noise">
                            <feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" stitchTiles="stitch" />
                        </filter>
                        <rect width="100%" height="100%" filter="url(#grain-noise)" />
                    </svg>
                    {isDemoMode && (
                        <div className="relative z-20 flex items-center justify-between gap-4 border-b border-[#E5E2DC] bg-[#1C1917] px-4 py-2.5 text-sm lg:px-8">
                            <p className="text-gray-300">
                                <span className="mr-2">🎭</span>
                                Vous explorez Oyko avec des données fictives.
                            </p>
                            <button
                                onClick={handleLogout}
                                className="shrink-0 rounded-md bg-[#BEFF00] px-3 py-1 text-xs font-semibold text-[#1C1917] transition-colors hover:bg-[#A7E600]"
                            >
                                Quitter la démo
                            </button>
                        </div>
                    )}
                    <div className="relative z-10">{children}</div>
                </main>
            </div>
        </div>
    );
}
