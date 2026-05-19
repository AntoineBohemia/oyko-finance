"use client";

import { CheckVerified01, Lock01, ShieldTick } from "@untitledui/icons";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

// =============================================================================
// DATA
// =============================================================================

const footerLinks = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Contact", href: "mailto:contact@oyko.fr" },
];

const legalLinks = [
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Confidentialité", href: "/politique-confidentialite" },
    { label: "CGU", href: "/cgu" },
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
    <Link href="/" className={cx("-m-2 flex items-center gap-2.5 rounded-lg p-2", "transition-opacity active:opacity-70", className)}>
        <svg viewBox="0 0 40 48" fill="none" className="h-7 w-auto md:h-8">
            <path
                d="m27.6627 4h-15.3253l-12.3374 12.3373v15.3253l12.3374 12.3374h15.3253l12.3373-12.3374v-15.3253zm-13.2049 27.8554-7.90357-7.9036 7.90357-7.9036c2.988-2.988 7.9037-2.988 10.8916 0l7.9036 7.9036-7.9036 7.9036c-2.9879 2.988-7.8072 2.988-10.8916 0z"
                className="fill-white"
            />
        </svg>
        <span className="font-display text-xl font-semibold text-white md:text-2xl">
            Oyko
        </span>
    </Link>
);

const TrustBadges = () => (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
        {trustBadges.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-gray-500">
                <Icon className="size-4" />
                <span className="text-xs font-medium">{label}</span>
            </div>
        ))}
    </div>
);

// =============================================================================
// MAIN COMPONENT — DARK FOOTER
// =============================================================================

export const Footer = () => {
    return (
        <footer className="bg-gray-900">
            <div className="mx-auto max-w-container px-4 md:px-8">
                {/* Main content */}
                <div className="flex flex-col gap-8 py-10 md:py-16 lg:flex-row lg:gap-16">
                    {/* Left side - Logo, description, links */}
                    <div className="flex flex-col gap-5 lg:flex-1">
                        <OykoLogo />
                        <p className="max-w-md text-sm text-gray-400">
                            Gérez vos finances personnelles simplement. Suivez vos dépenses, créez des budgets et faites grandir votre patrimoine.
                        </p>

                        {/* Navigation */}
                        <nav className="-mx-2">
                            <ul className="flex flex-wrap">
                                {footerLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="inline-flex min-h-11 items-center px-3 py-2 text-sm text-gray-400 transition-colors hover:text-white"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    {/* Right side - Newsletter */}
                    <div className="w-full lg:w-auto lg:max-w-md">
                        <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 md:rounded-2xl md:p-6">
                            <h4 className="text-md font-semibold text-white">Restez informé</h4>
                            <p className="mt-1.5 text-sm text-gray-400 md:mt-2">Conseils financiers et nouveautés <span className="font-display">Oyko</span>.</p>
                            <form className="mt-4 flex flex-row gap-2 md:gap-3">
                                <input
                                    type="email"
                                    placeholder="votre@email.com"
                                    autoComplete="email"
                                    className={cx(
                                        "h-11 min-w-0 flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 text-base text-white",
                                        "placeholder:text-gray-500",
                                        "outline-none focus:border-[#BEFF00] focus:ring-1 focus:ring-[#BEFF00]",
                                    )}
                                />
                                <Button type="submit" size="lg" className="shrink-0">
                                    OK
                                </Button>
                            </form>
                            <p className="mt-3 text-xs text-gray-500">
                                En vous inscrivant, vous acceptez notre{" "}
                                <Link href="/politique-confidentialite" className="underline hover:text-gray-300">
                                    politique de confidentialité
                                </Link>
                                .
                            </p>
                        </div>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="border-t border-gray-800 py-6 md:py-8">
                    <TrustBadges />
                </div>

                {/* Copyright & Legal Links */}
                <div className="border-t border-gray-800 py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        {/* Legal links */}
                        <nav className="-mx-2 md:order-2">
                            <ul className="flex flex-wrap">
                                {legalLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="inline-flex min-h-11 items-center px-2 py-2 text-xs text-gray-500 transition-colors hover:text-gray-300"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Copyright */}
                        <p className="text-xs text-gray-500 md:order-1">© {new Date().getFullYear()} <span className="font-display">Oyko</span> · Fait avec ❤️ en France</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
