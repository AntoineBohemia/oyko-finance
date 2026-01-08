"use client";

import type { FC, ReactNode } from "react";
import { BookClosed, BookOpen01, LifeBuoy01, MessageChatCircle, PlayCircle, ShieldTick, Stars02 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { NavMenuItemLink } from "./base-components/nav-menu-item";

type MenuItem = {
    title: string;
    subtitle?: string;
    href: string;
    Icon: FC<{ className?: string }>;
    badge?: ReactNode;
};

type MenuColumn = {
    title: string;
    items: MenuItem[];
};

const columns: MenuColumn[] = [
    {
        title: "Apprendre",
        items: [
            {
                title: "Blog",
                subtitle: "Conseils et actualités sur la gestion de vos finances personnelles.",
                href: "/blog",
                Icon: BookClosed,
            },
            {
                title: "Témoignages",
                subtitle: "Découvrez comment nos utilisateurs gèrent leur patrimoine avec Oyko.",
                href: "/temoignages",
                Icon: Stars02,
            },
            {
                title: "Tutoriels vidéo",
                subtitle: "Apprenez à utiliser toutes les fonctionnalités d'Oyko.",
                href: "/tutoriels",
                Icon: PlayCircle,
            },
        ],
    },
    {
        title: "Support",
        items: [
            {
                title: "Centre d'aide",
                subtitle: "Trouvez des réponses à toutes vos questions.",
                href: "/aide",
                Icon: LifeBuoy01,
            },
            {
                title: "Nous contacter",
                subtitle: "Notre équipe est disponible pour vous aider.",
                href: "/contact",
                Icon: MessageChatCircle,
            },
            {
                title: "Sécurité",
                subtitle: "Découvrez comment nous protégeons vos données.",
                href: "/securite",
                Icon: ShieldTick,
            },
        ],
    },
];

export const DropdownMenuWithTwoColsAndLinksAndFooter = () => {
    return (
        <div className="px-3 pb-2 md:max-w-200 md:p-0">
            <nav
                className="overflow-hidden rounded-xl md:rounded-2xl"
                style={{
                    backgroundColor: "var(--glass-bg)",
                    backdropFilter: "var(--glass-blur)",
                    WebkitBackdropFilter: "var(--glass-blur)",
                    boxShadow: "var(--glass-shadow)",
                }}
            >
                <div className="flex flex-col gap-5 rounded-xl pt-4 pb-5 md:gap-6 md:rounded-t-2xl md:p-6 md:pt-5">
                    <div className="flex flex-col gap-1 px-4 md:p-0">
                        <p className="text-md font-semibold text-primary">Ressources</p>
                        <p className="text-sm text-tertiary">Guides, tutoriels et support pour maîtriser Oyko.</p>
                    </div>

                    <div className="flex flex-col gap-5 md:flex-row md:gap-8 md:py-0">
                        <div className="-mb-px flex flex-col gap-4 border-b border-b-secondary px-4 pb-5 md:mb-0 md:gap-5 md:border-none md:p-0">
                            <h3 className="text-sm font-semibold text-brand-tertiary">Démarrer</h3>
                            <ul className="flex flex-col gap-3">
                                {[
                                    { title: "Guide de démarrage", href: "/guide-demarrage" },
                                    { title: "Connecter sa banque", href: "/connecter-banque" },
                                    { title: "Créer un budget", href: "/creer-budget" },
                                    { title: "Suivre son patrimoine", href: "/suivre-patrimoine" },
                                    { title: "Définir ses objectifs", href: "/definir-objectifs" },
                                    { title: "FAQ", href: "/faq" },
                                ].map((item) => (
                                    <li key={item.title}>
                                        <Button href={item.href} color="link-gray" size="lg">
                                            {item.title}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-2">
                            {columns.map((column) => (
                                <div key={column.title}>
                                    <h3 className="mb-2 px-4 text-sm font-semibold text-brand-tertiary md:px-0">{column.title}</h3>
                                    <ul className="flex flex-col gap-0.5">
                                        {column.items.map(({ title, subtitle, href, Icon }) => (
                                            <li key={title}>
                                                <NavMenuItemLink icon={Icon} title={title} subtitle={subtitle} href={href} />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mx-auto flex max-w-container flex-col px-4 py-5 md:flex-row md:items-center md:justify-between md:px-6" style={{ backgroundColor: "var(--glass-bg-subtle)" }}>
                    <Button href="/aide" color="secondary" size="md" iconLeading={BookOpen01} className="hidden md:flex">
                        Centre d'aide
                    </Button>
                    <Button href="/ressources" color="primary" size="md" className="hidden md:flex">
                        Toutes les ressources
                    </Button>
                    <Button href="/ressources" color="primary" size="sm" className="md:hidden">
                        Toutes les ressources
                    </Button>
                </div>
            </nav>
        </div>
    );
};
