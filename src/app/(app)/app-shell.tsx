"use client";

import type { FC, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
    Bell01,
    HomeLine,
    LogOut01,
    Menu01,
    Moon01,
    PieChart01,
    Receipt,
    SearchLg,
    Settings01,
    Sun,
    Wallet02,
    X,
} from "@untitledui/icons";
import { useTheme } from "next-themes";
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
    /** Affiche un indicateur de notification (point rouge) */
    hasNotification?: boolean;
}

// Exemple: passer à true si budget dépassé ou alertes en cours
const hasHomeNotifications = false;

const navItems: NavItem[] = [
    {
        label: "Accueil",
        href: "/dashboard",
        icon: HomeLine,
        hasNotification: hasHomeNotifications,
    },
    {
        label: "Dépenses",
        href: "/depenses",
        icon: Receipt,
    },
    {
        label: "Budget",
        href: "/budget",
        icon: PieChart01,
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
    "/depenses": {
        title: "Dépenses",
        description: "Gérez vos dépenses et transactions",
        showSearch: true,
    },
    "/budget": {
        title: "Budget",
        description: "Suivez vos budgets par catégorie",
        showSearch: false,
    },
    "/patrimoine": {
        title: "Patrimoine",
        description: "Gérez vos comptes et investissements",
        showSearch: true,
    },
    "/parametres": {
        title: "Paramètres",
        description: "Configurez votre application",
        showSearch: false,
    },
};

// ============================================
// THEME TOGGLE COMPONENT
// ============================================

const ThemeToggle = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        setMounted(true);
    }, []);

    // Avoid hydration mismatch by rendering a placeholder until mounted
    if (!mounted) {
        return <ButtonUtility size="sm" color="tertiary" icon={Moon01} tooltip="Mode sombre" />;
    }

    return (
        <ButtonUtility
            size="sm"
            color="tertiary"
            icon={isDark ? Sun : Moon01}
            tooltip={isDark ? "Mode clair" : "Mode sombre"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
        />
    );
};

// ============================================
// MOBILE NAV COMPONENT
// ============================================

const MobileNav = ({ isOpen, onClose, pathname }: { isOpen: boolean; onClose: () => void; pathname: string }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />

            {/* Drawer */}
            <div className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-primary shadow-xl lg:hidden">
                {/* Header */}
                <div className="flex h-16 items-center justify-between border-b border-secondary px-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                            <span className="text-sm font-bold text-white">F</span>
                        </div>
                        <span className="text-lg font-semibold text-primary">Finance</span>
                    </div>
                    <ButtonUtility size="sm" color="tertiary" icon={X} onClick={onClose} />
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
                                            isActive ? "bg-brand-50 text-brand-700" : "text-tertiary hover:bg-secondary hover:text-primary",
                                        )}
                                    >
                                        <span className="relative">
                                            <Icon className="h-5 w-5" />
                                            {item.hasNotification && (
                                                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-error-500" />
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

                    <div className="my-4 border-t border-secondary" />

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
                                            isActive ? "bg-brand-50 text-brand-700" : "text-tertiary hover:bg-secondary hover:text-primary",
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
                <div className="border-t border-secondary p-4">
                    <div className="flex items-center gap-3">
                        <Avatar size="md" alt="Antoine" initials="AN" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-primary">Antoine</p>
                            <p className="truncate text-xs text-tertiary">antoine@email.com</p>
                        </div>
                        <ThemeToggle />
                        <ButtonUtility size="sm" color="tertiary" icon={LogOut01} tooltip="Déconnexion" />
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
        title: "Finance",
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
                <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-secondary bg-primary px-4 lg:hidden">
                    <div className="flex items-center gap-3">
                        <ButtonUtility size="sm" color="tertiary" icon={Menu01} onClick={() => setMobileNavOpen(true)} />
                        <span className="text-sm font-semibold text-primary">{currentPage.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ButtonUtility size="sm" color="tertiary" icon={SearchLg} />
                        <ButtonUtility size="sm" color="tertiary" icon={Bell01} />
                        <Avatar size="sm" alt="Antoine" initials="AN" />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}
