"use client";

import { useState, type FC } from "react";
import { LayoutGrid01, Receipt, Target01, LayersThree01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { OykoUsersChart, OykoActiveChart } from "./charts";

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
// FEATURE ITEM COMPONENT
// =============================================================================

interface FeatureItemProps {
    feature: Feature;
    isSelected: boolean;
    onClick: () => void;
}

const FeatureItem = ({ feature, isSelected, onClick }: FeatureItemProps) => {
    return (
        <button
            onClick={onClick}
            className={cx(
                "group flex w-full cursor-pointer flex-col gap-4 rounded-2xl p-4 text-left transition-all duration-200",
                isSelected
                    ? "bg-brand-50 ring-1 ring-brand-200 dark:bg-brand-950 dark:ring-brand-800"
                    : "hover:bg-secondary"
            )}
        >
            <FeaturedIcon
                icon={feature.icon}
                size="lg"
                color={isSelected ? "brand" : "gray"}
                theme="light"
                className={cx(
                    "hidden transition-all duration-200 md:inline-flex",
                    !isSelected && "group-hover:bg-brand-50 group-hover:text-brand-600"
                )}
            />
            <FeaturedIcon
                icon={feature.icon}
                size="md"
                color={isSelected ? "brand" : "gray"}
                theme="light"
                className={cx(
                    "inline-flex transition-all duration-200 md:hidden",
                    !isSelected && "group-hover:bg-brand-50 group-hover:text-brand-600"
                )}
            />

            <div>
                <div className="flex items-center gap-2">
                    <h3 className={cx(
                        "text-lg font-semibold transition-colors duration-200",
                        isSelected ? "text-brand-700 dark:text-brand-400" : "text-primary"
                    )}>
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
        <section id="features" className="relative bg-primary py-16 lg:py-24">
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
                <div className="mx-auto flex w-full flex-col md:text-center lg:max-w-3xl">
                    <span className="text-sm font-semibold text-brand-secondary md:text-md">Découvrir</span>
                    <h2 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">
                        Explorez chaque fonctionnalité
                    </h2>
                    <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">
                        Cliquez sur une section pour découvrir en détail chaque page de l'application.
                    </p>
                </div>

                {/* Features grid with center mockup */}
                <div className="z-10 mt-12 grid grid-cols-1 gap-8 md:mt-16 lg:grid-cols-12 lg:items-start lg:gap-6">
                    {/* Left features */}
                    <div className="flex flex-col gap-4 lg:col-span-3">
                        {features.slice(0, 2).map((feature) => (
                            <FeatureItem
                                key={feature.id}
                                feature={feature}
                                isSelected={selectedId === feature.id}
                                onClick={() => setSelectedId(feature.id)}
                            />
                        ))}
                    </div>

                    {/* Center dashboard mockup */}
                    <div className="relative order-last flex w-full items-start justify-center lg:order-none lg:col-span-6 lg:px-4">
                        <div className="relative w-full max-w-md">
                            <OykoUsersChart className="w-full" />
                            <div className="absolute -right-4 -bottom-8 md:-right-12 md:-bottom-16">
                                <OykoActiveChart className="w-40 md:w-48" />
                            </div>
                        </div>
                    </div>

                    {/* Right features */}
                    <div className="flex flex-col gap-4 lg:col-span-3">
                        {features.slice(2, 4).map((feature) => (
                            <FeatureItem
                                key={feature.id}
                                feature={feature}
                                isSelected={selectedId === feature.id}
                                onClick={() => setSelectedId(feature.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Mobile navigation dots */}
                <div className="mt-8 flex justify-center gap-2 lg:hidden">
                    {features.map((feature) => (
                        <button
                            key={feature.id}
                            onClick={() => setSelectedId(feature.id)}
                            className={cx(
                                "size-2.5 rounded-full transition-all duration-200",
                                selectedId === feature.id
                                    ? "w-6 bg-brand-600"
                                    : "bg-gray-300 hover:bg-gray-400"
                            )}
                            aria-label={`Voir ${feature.title}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
