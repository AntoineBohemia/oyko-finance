"use client";

import { type FC, useState } from "react";
import { LayersThree01, LayoutGrid01, Receipt, Target01 } from "@untitledui/icons";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { cx } from "@/utils/cx";
import { OykoActiveChart, OykoUsersChart } from "./charts";

// =============================================================================
// TYPES & DATA
// =============================================================================

interface Feature {
    id: string;
    title: string;
    subtitle: string;
    icon: FC<{ className?: string }>;
}

const features: Feature[] = [
    {
        id: "dashboard",
        title: "Dashboard",
        subtitle: "Vue d'ensemble de vos finances. Solde total, dernières transactions et tendances en un coup d'oeil.",
        icon: LayoutGrid01,
    },
    {
        id: "depenses",
        title: "Dépenses",
        subtitle: "Catégorisation automatique de vos transactions. Visualisez où va votre argent en un instant.",
        icon: Receipt,
    },
    {
        id: "budget",
        title: "Budget",
        subtitle: "Créez des budgets adaptés à votre vie. Recevez des alertes avant de dépasser vos limites.",
        icon: Target01,
    },
    {
        id: "patrimoine",
        title: "Patrimoine",
        subtitle: "Tous vos comptes et investissements centralisés. Suivez l'évolution de votre richesse.",
        icon: LayersThree01,
    },
];

// =============================================================================
// MOBILE FEATURE ITEM - Compact horizontal layout
// =============================================================================

const MobileFeatureItem = ({ feature }: { feature: Feature }) => {
    return (
        <div className={cx("flex items-start gap-3 rounded-xl bg-secondary p-3", "transition-all duration-150", "active:scale-[0.99] active:bg-tertiary")}>
            <FeaturedIcon icon={feature.icon} size="sm" color="brand" theme="light" className="shrink-0" />
            <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-primary">{feature.title}</h3>
                <p className="mt-0.5 text-sm leading-snug text-tertiary">{feature.subtitle}</p>
            </div>
        </div>
    );
};

// =============================================================================
// DESKTOP FEATURE ITEM - Original style with selection
// =============================================================================

interface DesktopFeatureItemProps {
    feature: Feature;
    isSelected: boolean;
    onClick: () => void;
}

const DesktopFeatureItem = ({ feature, isSelected, onClick }: DesktopFeatureItemProps) => {
    return (
        <button
            onClick={onClick}
            className={cx(
                "group flex w-full cursor-pointer flex-col gap-4 rounded-2xl p-4 text-left",
                "transition-all duration-150",
                "active:scale-[0.98]",
                isSelected ? "bg-brand-50 ring-1 ring-brand-200 dark:bg-brand-950 dark:ring-brand-800" : "hover:bg-secondary active:bg-secondary",
            )}
        >
            <FeaturedIcon
                icon={feature.icon}
                size="lg"
                color={isSelected ? "brand" : "gray"}
                theme="light"
                className={cx("transition-all duration-200", !isSelected && "group-hover:bg-brand-50 group-hover:text-brand-600")}
            />

            <div>
                <div className="flex items-center gap-2">
                    <h3
                        className={cx(
                            "text-lg font-semibold transition-colors duration-200",
                            isSelected ? "text-brand-700 dark:text-brand-400" : "text-primary",
                        )}
                    >
                        {feature.title}
                    </h3>
                    {isSelected && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                            Actif
                        </span>
                    )}
                </div>
                <p className="mt-1 text-md text-tertiary">{feature.subtitle}</p>
            </div>
        </button>
    );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const FeaturesGrid = () => {
    const [selectedId, setSelectedId] = useState<string>("dashboard");

    return (
        <section id="features" className="relative bg-primary py-12 lg:py-24">
            {/* Gradient de transition depuis la section précédente */}
            <div
                className="pointer-events-none absolute inset-x-0 -top-24 h-32"
                style={{
                    background: "linear-gradient(to bottom, transparent, var(--color-bg-primary) 70%)",
                }}
                aria-hidden="true"
            />

            <div className="mx-auto w-full max-w-container px-4 md:px-8">
                {/* Header */}
                <div className="flex flex-col lg:mx-auto lg:max-w-3xl lg:text-center">
                    <span className="text-sm font-semibold text-brand-secondary">Découvrir</span>
                    <h2 className="mt-2 text-display-xs font-semibold text-primary md:text-display-md">Explorez chaque fonctionnalité</h2>
                    <p className="mt-3 text-md text-tertiary md:mt-5 md:text-xl">Tout ce dont vous avez besoin pour gérer vos finances.</p>
                </div>

                {/* Mobile: Simple 2x2 grid */}
                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
                    {features.map((feature) => (
                        <MobileFeatureItem key={feature.id} feature={feature} />
                    ))}
                </div>

                {/* Desktop: Grid layout with center mockup */}
                <div className="mt-16 hidden lg:grid lg:grid-cols-12 lg:items-start lg:gap-6">
                    {/* Left features */}
                    <div className="flex flex-col gap-4 lg:col-span-3">
                        {features.slice(0, 2).map((feature) => (
                            <DesktopFeatureItem
                                key={feature.id}
                                feature={feature}
                                isSelected={selectedId === feature.id}
                                onClick={() => setSelectedId(feature.id)}
                            />
                        ))}
                    </div>

                    {/* Center dashboard mockup */}
                    <div className="relative flex w-full items-start justify-center lg:col-span-6 lg:px-4">
                        <div className="relative w-full max-w-md">
                            <OykoUsersChart className="w-full" />
                            <div className="absolute -right-12 -bottom-16">
                                <OykoActiveChart className="w-48" />
                            </div>
                        </div>
                    </div>

                    {/* Right features */}
                    <div className="flex flex-col gap-4 lg:col-span-3">
                        {features.slice(2, 4).map((feature) => (
                            <DesktopFeatureItem
                                key={feature.id}
                                feature={feature}
                                isSelected={selectedId === feature.id}
                                onClick={() => setSelectedId(feature.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
