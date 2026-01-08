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
import { DropdownMenuFeatureCard } from "./dropdown-menu-feature-card";
import { DropdownMenuSimpleWithFooter } from "./dropdown-menu-simple-with-footer";
import { DropdownMenuWithTwoColsAndLinksAndFooter } from "./dropdown-menu-with-two-cols-and-links-and-footer";

// =============================================================================
// CONSTANTS
// =============================================================================

const SCROLL_THRESHOLD = 50;

// Spring config inspirée Dynamic Island - réactive mais smooth
const springConfig = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 1,
};

// =============================================================================
// COMPONENTS
// =============================================================================

const ThemeToggle = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        setMounted(true);
    }, []);

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

type HeaderNavItem = {
    label: string;
    href?: string;
    menu?: ReactNode;
};

const headerNavItems: HeaderNavItem[] = [
    { label: "Products", href: "/products", menu: <DropdownMenuSimpleWithFooter /> },
    { label: "Services", href: "/Services", menu: <DropdownMenuFeatureCard /> },
    { label: "Pricing", href: "/pricing" },
    { label: "Resources", href: "/resources", menu: <DropdownMenuWithTwoColsAndLinksAndFooter /> },
    { label: "About", href: "/about" },
];

const footerNavItems = [
    { label: "About us", href: "/" },
    { label: "Press", href: "/products" },
    { label: "Careers", href: "/resources" },
    { label: "Legal", href: "/pricing" },
    { label: "Support", href: "/pricing" },
    { label: "Contact", href: "/pricing" },
    { label: "Sitemap", href: "/pricing" },
    { label: "Cookie settings", href: "/pricing" },
];

const MobileNavItem = (props: { className?: string; label: string; href?: string; children?: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (props.href) {
        return (
            <li>
                <a href={props.href} className="flex items-center justify-between px-4 py-3 text-md font-semibold text-primary hover:bg-primary_hover">
                    {props.label}
                </a>
            </li>
        );
    }

    return (
        <li className="flex flex-col gap-0.5">
            <button
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between px-4 py-3 text-md font-semibold text-primary hover:bg-primary_hover"
            >
                {props.label}{" "}
                <ChevronDown
                    className={cx("size-4 stroke-[2.625px] text-fg-quaternary transition duration-100 ease-linear", isOpen ? "-rotate-180" : "rotate-0")}
                />
            </button>
            {isOpen && <div>{props.children}</div>}
        </li>
    );
};

const MobileFooter = () => {
    return (
        <div className="flex flex-col gap-8 border-t border-secondary px-4 py-6">
            <div>
                <ul className="grid grid-flow-col grid-cols-2 grid-rows-4 gap-x-6 gap-y-3">
                    {footerNavItems.map((navItem) => (
                        <li key={navItem.label}>
                            <Button color="link-gray" size="lg" href={navItem.href}>
                                {navItem.label}
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2">
                    <span className="text-sm text-tertiary">Theme</span>
                    <ThemeToggle />
                </div>
                <Button size="lg">Sign up</Button>
                <Button color="secondary" size="lg">
                    Log in
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

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
        };

        // Check initial state
        handleScroll();

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header ref={headerRef} className={cx("fixed top-0 right-0 left-0 z-50", "flex w-full items-center justify-center", "h-16 md:h-20", className)}>
            {/* Animated container - morphs between full-width and floating */}
            <motion.div
                layout
                transition={springConfig}
                className={cx("flex items-center", "w-full max-w-container px-4 md:px-8")}
                style={{
                    paddingTop: isScrolled ? 12 : 0,
                }}
            >
                <motion.div
                    layout
                    transition={springConfig}
                    className={cx("flex w-full items-center justify-between gap-4", "md:py-3 md:pr-3 md:pl-4")}
                    // Animated styles pour l'effet glass
                    animate={{
                        // Background: transparent → glass
                        backgroundColor: isScrolled ? "var(--glass-bg)" : "rgba(255, 255, 255, 0)",
                        // Border radius: 0 → rounded
                        borderRadius: isScrolled ? 16 : 0,
                        // Shadow: none → soft shadow avec effet glass
                        boxShadow: isScrolled ? "var(--glass-shadow)" : "0 0 0 0 rgba(0, 0, 0, 0)",
                        // Backdrop blur pour l'effet glass
                        backdropFilter: isScrolled ? "var(--glass-blur)" : "blur(0px) saturate(1)",
                    }}
                    style={{
                        willChange: "transform, opacity",
                        WebkitBackdropFilter: isScrolled ? "var(--glass-blur)" : "blur(0px) saturate(1)",
                    }}
                >
                    <div className="flex flex-1 items-center gap-5">
                        <UntitledLogo className="h-8 md:max-lg:hidden" />
                        <UntitledLogoMinimal className="hidden h-8 md:inline-block lg:hidden" />

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

                    <div className="hidden items-center gap-3 md:flex">
                        <ThemeToggle />
                        <Button color="secondary" size="md">
                            Log in
                        </Button>
                        <Button color="primary" size="md">
                            Sign up
                        </Button>
                    </div>

                    {/* Mobile menu and menu trigger */}
                    <AriaDialogTrigger>
                        <AriaButton
                            aria-label="Toggle navigation menu"
                            className={({ isFocusVisible, isHovered }) =>
                                cx(
                                    "group ml-auto cursor-pointer rounded-lg p-2 md:hidden",
                                    isHovered && "bg-black/5",
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
                            className="scrollbar-hide h-[calc(100vh-64px)] w-full overflow-y-auto md:hidden"
                            offset={0}
                            containerPadding={0}
                            placement="bottom left"
                        >
                            <AriaDialog className="outline-hidden">
                                <nav className="w-full bg-white shadow-lg">
                                    <ul className="flex flex-col gap-0.5 py-5">
                                        {items.map((navItem) =>
                                            navItem.menu ? (
                                                <MobileNavItem key={navItem.label} label={navItem.label}>
                                                    {navItem.menu}
                                                </MobileNavItem>
                                            ) : (
                                                <MobileNavItem key={navItem.label} label={navItem.label} href={navItem.href} />
                                            ),
                                        )}
                                    </ul>
                                    <MobileFooter />
                                </nav>
                            </AriaDialog>
                        </AriaPopover>
                    </AriaDialogTrigger>
                </motion.div>
            </motion.div>
        </header>
    );
};
