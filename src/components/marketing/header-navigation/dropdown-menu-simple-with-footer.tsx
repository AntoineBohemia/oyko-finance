"use client";

import { BarChart07, CreditCard02, PieChart01, Target04, Wallet03 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { NavMenuItemLink } from "./base-components/nav-menu-item";

const items = [
    {
        title: "Tableau de bord",
        subtitle: "Vue d'ensemble de votre patrimoine et de vos finances en temps réel.",
        href: "/fonctionnalites/tableau-de-bord",
        Icon: BarChart07,
    },
    {
        title: "Suivi des dépenses",
        subtitle: "Catégorisez et analysez vos dépenses automatiquement.",
        href: "/fonctionnalites/depenses",
        Icon: Wallet03,
    },
    {
        title: "Gestion du patrimoine",
        subtitle: "Suivez vos investissements, immobilier et actifs en un seul endroit.",
        href: "/fonctionnalites/patrimoine",
        Icon: PieChart01,
    },
    {
        title: "Objectifs financiers",
        subtitle: "Définissez et atteignez vos objectifs d'épargne et d'investissement.",
        href: "/fonctionnalites/objectifs",
        Icon: Target04,
    },
    {
        title: "Connexion bancaire",
        subtitle: "Synchronisez vos comptes bancaires en toute sécurité.",
        href: "/fonctionnalites/connexion-bancaire",
        Icon: CreditCard02,
    },
];

export const DropdownMenuSimpleWithFooter = () => {
    return (
        <div className="px-3 pb-2 md:max-w-84 md:p-0">
            <nav
                className="overflow-hidden rounded-xl md:rounded-2xl"
                style={{
                    backgroundColor: "var(--glass-bg)",
                    backdropFilter: "var(--glass-blur)",
                    WebkitBackdropFilter: "var(--glass-blur)",
                    boxShadow: "var(--glass-shadow)",
                }}
            >
                <ul className="flex flex-col gap-0.5 rounded-xl py-2 md:rounded-t-2xl md:p-2">
                    {items.map(({ title, subtitle, href, Icon }) => (
                        <li key={title}>
                            <NavMenuItemLink icon={Icon} title={title} subtitle={subtitle} href={href} />
                        </li>
                    ))}
                </ul>
                <div className="px-4 py-5 text-center sm:px-5" style={{ backgroundColor: "var(--glass-bg-subtle)" }}>
                    <Button href="/fonctionnalites" color="link-color" size="lg">
                        Toutes les fonctionnalités
                    </Button>
                </div>
            </nav>
        </div>
    );
};
