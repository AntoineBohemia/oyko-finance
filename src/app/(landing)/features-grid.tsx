"use client";

import { type FC, useRef, useState } from "react";
import { LayersThree01, LayoutGrid01, Receipt, Target01 } from "@untitledui/icons";
import { AnimatePresence, motion, useInView } from "motion/react";
import { cx } from "@/utils/cx";
import { FeatureMockup } from "./feature-mockups";

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

const ease = [0.16, 1, 0.3, 1] as const;

// =============================================================================
// MOBILE FEATURE ITEM
// =============================================================================

const MobileFeatureItem = ({ feature, index }: { feature: Feature; index: number }) => {
    const Icon = feature.icon;
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-40px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease, delay: index * 0.1 }}
            className="flex items-start gap-3 rounded-lg bg-white/5 p-3 transition-all duration-150 active:scale-[0.99] active:bg-white/10"
        >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Icon className="size-4 text-[#BEFF00]" />
            </div>
            <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                <p className="mt-0.5 text-sm leading-snug text-gray-400">{feature.subtitle}</p>
            </div>
        </motion.div>
    );
};

// =============================================================================
// DESKTOP FEATURE ITEM
// =============================================================================

const DesktopFeatureItem = ({
    feature,
    isSelected,
    onClick,
    index,
}: {
    feature: Feature;
    isSelected: boolean;
    onClick: () => void;
    index: number;
}) => {
    const Icon = feature.icon;
    const ref = useRef<HTMLButtonElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <motion.button
            ref={ref}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.7, ease, delay: index * 0.12 }}
            onClick={onClick}
            className={cx(
                "group relative flex w-full cursor-pointer flex-col gap-4 rounded-xl p-4 text-left",
                "transition-all duration-200",
                "active:scale-[0.98]",
                isSelected ? "bg-white/10 ring-1 ring-white/10" : "hover:bg-white/5",
            )}
        >
            {/* Animated glow behind icon when selected */}
            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        className="absolute top-4 left-4 size-10 rounded-lg bg-[#BEFF00]/20 blur-xl"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.5 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.4, ease }}
                    />
                )}
            </AnimatePresence>

            <motion.div
                className={cx(
                    "relative flex size-10 items-center justify-center rounded-lg",
                    isSelected ? "bg-[#BEFF00] text-gray-900" : "bg-white/10 text-gray-400 group-hover:text-white",
                )}
                animate={{
                    scale: isSelected ? 1 : 1,
                    rotate: isSelected ? 0 : 0,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                layout
            >
                <Icon className="size-5" />
            </motion.div>

            <div>
                <div className="flex items-center gap-2">
                    <h3
                        className={cx(
                            "text-lg font-semibold transition-colors duration-200",
                            isSelected ? "text-white" : "text-gray-300",
                        )}
                    >
                        {feature.title}
                    </h3>
                    <AnimatePresence>
                        {isSelected && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8, x: -8 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: -8 }}
                                transition={{ duration: 0.3, ease }}
                                className="rounded-full bg-[#BEFF00]/15 px-2 py-0.5 text-xs font-medium text-[#BEFF00]"
                            >
                                Actif
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
                <motion.p
                    className="mt-1 text-md text-gray-500"
                    animate={{ color: isSelected ? "rgb(156 163 175)" : "rgb(107 114 128)" }}
                    transition={{ duration: 0.3 }}
                >
                    {feature.subtitle}
                </motion.p>
            </div>
        </motion.button>
    );
};

// =============================================================================
// MAIN COMPONENT — DARK SECTION
// =============================================================================

export const FeaturesGrid = () => {
    const [selectedId, setSelectedId] = useState<string>("dashboard");
    const headerRef = useRef<HTMLDivElement>(null);
    const mockupRef = useRef<HTMLDivElement>(null);
    const headerInView = useInView(headerRef, { once: true, margin: "-80px" });
    const mockupInView = useInView(mockupRef, { once: true, margin: "-100px" });

    return (
        <section id="features" className="relative bg-gray-900 py-16 lg:py-24">
            <div className="mx-auto w-full max-w-container px-4 md:px-8">
                {/* Header */}
                <div ref={headerRef} className="flex flex-col lg:mx-auto lg:max-w-3xl lg:text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, ease }}
                        className="text-sm font-semibold text-[#BEFF00]"
                    >
                        Découvrir
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, ease, delay: 0.1 }}
                        className="mt-2 text-display-xs font-semibold text-white md:text-display-md"
                    >
                        Explorez chaque fonctionnalité
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, ease, delay: 0.2 }}
                        className="mt-3 text-md text-gray-400 md:mt-5 md:text-xl"
                    >
                        Tout ce dont vous avez besoin pour gérer vos finances.
                    </motion.p>
                </div>

                {/* Mobile: Staggered grid */}
                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
                    {features.map((feature, i) => (
                        <MobileFeatureItem key={feature.id} feature={feature} index={i} />
                    ))}
                </div>

                {/* Desktop: Grid layout with center mockup */}
                <div className="mt-16 hidden lg:grid lg:grid-cols-12 lg:items-start lg:gap-6">
                    {/* Left features */}
                    <div className="flex flex-col gap-4 lg:col-span-3">
                        {features.slice(0, 2).map((feature, i) => (
                            <DesktopFeatureItem
                                key={feature.id}
                                feature={feature}
                                isSelected={selectedId === feature.id}
                                onClick={() => setSelectedId(feature.id)}
                                index={i}
                            />
                        ))}
                    </div>

                    {/* Center mockup — switches based on selected feature */}
                    <div ref={mockupRef} className="relative flex w-full items-start justify-center lg:col-span-6 lg:px-4">
                        <motion.div
                            className="relative w-full max-w-md"
                            initial={{ opacity: 0, y: 60, scale: 0.9 }}
                            animate={mockupInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                            transition={{ duration: 0.8, ease, delay: 0.2 }}
                        >
                            {/* Glow behind mockup */}
                            <motion.div
                                className="pointer-events-none absolute -inset-8 rounded-3xl bg-[#BEFF00]/5 blur-3xl"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedId}
                                    initial={{ opacity: 0, scale: 0.95, y: 12, rotateX: 4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -12, rotateX: -4 }}
                                    transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                                    style={{ transformPerspective: 1200 }}
                                >
                                    <FeatureMockup selectedId={selectedId} className="w-full" />
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Right features */}
                    <div className="flex flex-col gap-4 lg:col-span-3">
                        {features.slice(2, 4).map((feature, i) => (
                            <DesktopFeatureItem
                                key={feature.id}
                                feature={feature}
                                isSelected={selectedId === feature.id}
                                onClick={() => setSelectedId(feature.id)}
                                index={i + 2}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
