"use client";

import Link from "next/link";
import { ShieldTick, Lock01, CheckVerified01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

// =============================================================================
// DATA
// =============================================================================

const footerLinks = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Contact", href: "mailto:contact@oyko.fr" },
];

const trustBadges = [
    { icon: ShieldTick, label: "Chiffrement AES-256" },
    { icon: Lock01, label: "Conforme RGPD" },
    { icon: CheckVerified01, label: "Hébergé en France" },
];

// =============================================================================
// COMPONENTS
// =============================================================================

const OykoLogo = ({ className }: { className?: string }) => (
    <Link href="/" className={cx("flex items-center gap-2.5", className)}>
        {/* Octagon icon - same as header */}
        <svg viewBox="0 0 40 48" fill="none" className="h-8 w-auto">
            <path
                d="m27.6627 4h-15.3253l-12.3374 12.3373v15.3253l12.3374 12.3374h15.3253l12.3373-12.3374v-15.3253zm-13.2049 27.8554-7.90357-7.9036 7.90357-7.9036c2.988-2.988 7.9037-2.988 10.8916 0l7.9036 7.9036-7.9036 7.9036c-2.9879 2.988-7.8072 2.988-10.8916 0z"
                className="fill-fg-primary"
            />
        </svg>
        <span
            className="text-fg-primary"
            style={{ fontSize: "1.5rem", fontWeight: 600, fontFamily: "var(--font-space-grotesk)" }}
        >
            Oyko
        </span>
    </Link>
);

const TrustBadges = () => (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {trustBadges.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-quaternary">
                <Icon className="size-4" />
                <span className="text-xs font-medium">{label}</span>
            </div>
        ))}
    </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const Footer = () => {
    return (
        <footer className="border-t border-secondary bg-secondary">
            <div className="mx-auto max-w-container px-4 md:px-8">
                {/* Main content */}
                <div className="grid gap-10 py-12 md:py-16 lg:grid-cols-2 lg:gap-16">
                    {/* Left side - Logo, description, links */}
                    <div className="flex flex-col gap-6">
                        <OykoLogo />
                        <p className="max-w-md text-sm text-tertiary">
                            Gérez vos finances personnelles simplement. Suivez vos dépenses, créez des budgets et faites grandir votre patrimoine.
                        </p>

                        {/* Navigation */}
                        <nav>
                            <ul className="flex flex-wrap gap-x-6 gap-y-2">
                                {footerLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-tertiary transition-colors hover:text-primary"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    {/* Right side - Newsletter */}
                    <div className="flex flex-col justify-center lg:items-end">
                        <div className="w-full max-w-md rounded-2xl bg-tertiary p-6">
                            <h4 className="text-md font-semibold text-primary">Restez informé</h4>
                            <p className="mt-2 text-sm text-tertiary">
                                Conseils financiers et nouveautés Oyko.
                            </p>
                            <form className="mt-4 flex flex-col gap-3 sm:flex-row">
                                <input
                                    type="email"
                                    placeholder="votre@email.com"
                                    className={cx(
                                        "h-10 flex-1 rounded-lg border border-primary bg-primary px-3.5 text-sm text-primary",
                                        "placeholder:text-placeholder",
                                        "outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
                                    )}
                                />
                                <Button type="submit" size="md">
                                    S'inscrire
                                </Button>
                            </form>
                            <p className="mt-3 text-xs text-quaternary">
                                En vous inscrivant, vous acceptez notre politique de confidentialité.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-secondary py-8">
                    {/* Trust badges */}
                    <TrustBadges />
                </div>

                {/* Copyright */}
                <div className="border-t border-secondary py-6">
                    <p className="text-center text-xs text-quaternary md:text-left">
                        © {new Date().getFullYear()} Oyko. Tous droits réservés. Fait avec ❤️ en France.
                    </p>
                </div>
            </div>
        </footer>
    );
};
