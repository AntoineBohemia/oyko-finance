"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Moon01, Sun } from "@untitledui/icons";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { Button as AriaButton, Dialog as AriaDialog, DialogTrigger as AriaDialogTrigger, Popover as AriaPopover } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { UntitledLogoMinimal } from "@/components/foundations/logo/untitledui-logo-minimal";
import { cx } from "@/utils/cx";

// =============================================================================
// CONSTANTS
// =============================================================================

const SCROLL_THRESHOLD = 50;

const springConfig = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 1,
};

// =============================================================================
// COMPONENTS
// =============================================================================

const ThemeToggle = ({ size = "sm" }: { size?: "sm" | "md" }) => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <ButtonUtility size={size} color="tertiary" icon={Moon01} tooltip="Thème sombre" />;
    }

    return (
        <ButtonUtility
            size={size}
            color="tertiary"
            icon={isDark ? Sun : Moon01}
            tooltip={isDark ? "Thème clair" : "Thème sombre"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
        />
    );
};

type HeaderNavItem = {
    label: string;
    href?: string;
    menu?: ReactNode;
};

const headerNavItems: HeaderNavItem[] = [{ label: "Fonctionnalités", href: "#features" }];

const MobileNavItem = (props: { label: string; href?: string; children?: ReactNode; onClose?: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (props.href) {
        return (
            <li>
                <a
                    href={props.href}
                    onClick={props.onClose}
                    className={cx(
                        "flex min-h-12 items-center px-5 text-md font-semibold text-primary",
                        "transition-colors duration-150",
                        "active:bg-secondary",
                    )}
                >
                    {props.label}
                </a>
            </li>
        );
    }

    return (
        <li className="flex flex-col">
            <button
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                className={cx(
                    "flex min-h-12 w-full items-center justify-between px-5 text-md font-semibold text-primary",
                    "transition-colors duration-150",
                    "active:bg-secondary",
                )}
            >
                {props.label}
                <ChevronDown className={cx("size-5 text-fg-quaternary transition-transform duration-200", isOpen && "-rotate-180")} />
            </button>
            {isOpen && <div className="px-5 pb-3">{props.children}</div>}
        </li>
    );
};

const MobileFooter = () => {
    return (
        <div className="mt-auto border-t border-secondary px-5 py-6">
            {/* Theme toggle row */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-tertiary">Apparence</span>
                <ThemeToggle size="md" />
            </div>

            {/* CTA buttons */}
            <div className="mt-5 flex flex-row gap-3">
                <Button color="secondary" size="lg" href="/login" className="flex-1 justify-center">
                    Connexion
                </Button>
                <Button size="lg" href="/signup" className="flex-1 justify-center">
                    Commencer
                </Button>
            </div>
        </div>
    );
};

interface HeaderProps {
    items?: HeaderNavItem[];
    isFullWidth?: boolean;
    className?: string;
}

export const Header = ({ items = headerNavItems, isFullWidth, className }: HeaderProps) => {
    const headerRef = useRef<HTMLElement>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
        };

        handleScroll();

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileMenuOpen]);

    // Determine header background state
    const showSolidBg = isScrolled || isMobileMenuOpen;

    return (
        <header
            ref={headerRef}
            className={cx(
                "fixed top-0 right-0 left-0 z-50",
                "flex w-full items-center justify-center",
                "h-16 md:h-20",
                // Solid background when menu open on mobile
                isMobileMenuOpen && "bg-primary md:bg-transparent",
                className,
            )}
        >
            {/* Animated container */}
            <motion.div
                layout
                transition={springConfig}
                className={cx("flex items-center", "w-full max-w-container px-4 md:px-8")}
                style={{
                    paddingTop: isScrolled && !isMobileMenuOpen ? 12 : 0,
                }}
            >
                <motion.div
                    layout
                    transition={springConfig}
                    className={cx("flex w-full items-center justify-between gap-4", "px-3 py-2 md:py-3 md:pr-3 md:pl-4")}
                    animate={{
                        backgroundColor: isMobileMenuOpen ? "transparent" : isScrolled ? "var(--glass-bg)" : "rgba(255, 255, 255, 0)",
                        borderRadius: isScrolled && !isMobileMenuOpen ? 16 : 0,
                        boxShadow: isScrolled && !isMobileMenuOpen ? "var(--glass-shadow)" : "0 0 0 0 rgba(0, 0, 0, 0)",
                        backdropFilter: isScrolled && !isMobileMenuOpen ? "var(--glass-blur)" : "blur(0px) saturate(1)",
                    }}
                    style={{
                        willChange: "transform, opacity",
                        WebkitBackdropFilter: isScrolled && !isMobileMenuOpen ? "var(--glass-blur)" : "blur(0px) saturate(1)",
                    }}
                >
                    {/* Logo + nav */}
                    <div className="flex flex-1 items-center gap-5">
                        <a
                            href="/"
                            className={cx(
                                "-m-2 rounded-xl p-2",
                                "outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
                                "transition-opacity active:opacity-70",
                            )}
                        >
                            <UntitledLogo className="h-7 md:h-8 md:max-lg:hidden" />
                            <UntitledLogoMinimal className="hidden h-7 md:inline-block md:h-8 lg:hidden" />
                        </a>

                        {/* Desktop navigation */}
                        <nav className="max-md:hidden">
                            <ul className="flex items-center gap-0.5">
                                {items.map((navItem) => (
                                    <li key={navItem.label}>
                                        {navItem.menu ? (
                                            <AriaDialogTrigger>
                                                <AriaButton className="flex cursor-pointer items-center gap-0.5 rounded-lg px-1.5 py-1 text-md font-semibold text-secondary outline-focus-ring transition duration-100 ease-linear hover:bg-black/[0.04] hover:text-secondary_hover focus-visible:outline-2 focus-visible:outline-offset-2">
                                                    <span className="px-0.5">{navItem.label}</span>
                                                    <ChevronDown className="size-4 rotate-0 stroke-[2.625px] text-fg-quaternary transition duration-100 ease-linear in-aria-expanded:-rotate-180" />
                                                </AriaButton>

                                                <AriaPopover
                                                    className={({ isEntering, isExiting }) =>
                                                        cx(
                                                            "hidden origin-top will-change-transform md:block",
                                                            isFullWidth && "w-full",
                                                            isEntering && "duration-200 ease-out animate-in fade-in slide-in-from-top-2",
                                                            isExiting && "duration-150 ease-in animate-out fade-out slide-out-to-top-2",
                                                        )
                                                    }
                                                    offset={12}
                                                    containerPadding={16}
                                                    triggerRef={isFullWidth ? headerRef : undefined}
                                                >
                                                    {({ isEntering, isExiting }) => (
                                                        <AriaDialog
                                                            className={cx(
                                                                "mx-auto origin-top outline-hidden",
                                                                isEntering && !isFullWidth && "duration-200 ease-out animate-in zoom-in-95",
                                                                isExiting && !isFullWidth && "duration-150 ease-in animate-out zoom-out-95",
                                                            )}
                                                        >
                                                            {navItem.menu}
                                                        </AriaDialog>
                                                    )}
                                                </AriaPopover>
                                            </AriaDialogTrigger>
                                        ) : (
                                            <a
                                                href={navItem.href}
                                                className="flex cursor-pointer items-center gap-0.5 rounded-lg px-1.5 py-1 text-md font-semibold text-secondary outline-focus-ring transition duration-100 ease-linear hover:bg-black/[0.04] hover:text-secondary_hover focus:outline-offset-2 focus-visible:outline-2"
                                            >
                                                <span className="px-0.5">{navItem.label}</span>
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    {/* Desktop actions */}
                    <div className="hidden items-center gap-3 md:flex">
                        <ThemeToggle />
                        <Button color="secondary" size="md" href="/login">
                            Connexion
                        </Button>
                        <Button color="primary" size="md" href="/signup">
                            Commencer
                        </Button>
                    </div>

                    {/* Mobile menu trigger */}
                    <AriaDialogTrigger>
                        <AriaButton
                            aria-label="Menu de navigation"
                            className={({ isFocusVisible }) =>
                                cx(
                                    "group flex size-11 items-center justify-center rounded-xl md:hidden",
                                    "transition-colors duration-150",
                                    "active:bg-black/5",
                                    isFocusVisible && "outline-2 outline-offset-2 outline-focus-ring",
                                )
                            }
                        >
                            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path
                                    className="hidden text-secondary group-aria-expanded:block"
                                    d="M18 6L6 18M6 6L18 18"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    className="text-secondary group-aria-expanded:hidden"
                                    d="M3 12H21M3 6H21M3 18H21"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </AriaButton>

                        <AriaPopover
                            triggerRef={headerRef}
                            className={({ isEntering, isExiting }) =>
                                cx(
                                    "w-full md:hidden",
                                    isEntering && "duration-200 ease-out animate-in fade-in slide-in-from-top-2",
                                    isExiting && "duration-150 ease-in animate-out fade-out slide-out-to-top-2",
                                )
                            }
                            offset={0}
                            containerPadding={0}
                            placement="bottom left"
                            onOpenChange={(isOpen) => setIsMobileMenuOpen(isOpen)}
                        >
                            {({ close }) => (
                                <AriaDialog className="outline-hidden">
                                    <div className={cx("flex h-[calc(100dvh-64px)] flex-col", "bg-primary", "overflow-y-auto overscroll-contain")}>
                                        {/* Nav items */}
                                        <nav>
                                            <ul className="flex flex-col py-2">
                                                {items.map((navItem) =>
                                                    navItem.menu ? (
                                                        <MobileNavItem key={navItem.label} label={navItem.label} onClose={close}>
                                                            {navItem.menu}
                                                        </MobileNavItem>
                                                    ) : (
                                                        <MobileNavItem key={navItem.label} label={navItem.label} href={navItem.href} onClose={close} />
                                                    ),
                                                )}
                                            </ul>
                                        </nav>

                                        {/* Footer pinned at bottom */}
                                        <MobileFooter />
                                    </div>
                                </AriaDialog>
                            )}
                        </AriaPopover>
                    </AriaDialogTrigger>
                </motion.div>
            </motion.div>
        </header>
    );
};
