"use client";

import type { FC, ReactNode } from "react";
import { useState } from "react";
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

const MobileNav = ({ isOpen, onClose, pathname }: { isOpen: boolean; onClose: () => void; pathname: string }) => {
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
                        <button className="rounded-lg p-1.5 text-gray-500 transition-colors hover:text-gray-300">
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

    const currentPage = pageMetadata[pathname] || {
        title: "Oyko",
        description: "",
        showSearch: false,
    };

    return (
        <div className="flex min-h-screen bg-primary">
            {/* Sidebar Desktop */}
            <SidebarNavigationSlim items={navItems} footerItems={footerItems} activeUrl={pathname} />

            {/* Mobile Nav */}
            <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} pathname={pathname} />

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
                    {/* Subtle gradient mesh for depth */}
                    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
                        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#BEFF00]/[0.02] blur-[120px]" />
                        <div className="absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-[#BEFF00]/[0.015] blur-[100px]" />
                    </div>
                    <div className="relative z-10">{children}</div>
                </main>
            </div>
        </div>
    );
}
