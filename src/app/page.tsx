"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, PlayCircle } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { BadgeGroup } from "@/components/base/badges/badge-groups";
import { Button } from "@/components/base/buttons/button";
import { Header } from "@/components/marketing/header-navigation/header";
import { cx } from "@/utils/cx";

// =============================================================================
// FEATURES CAROUSEL - Types & Data
// =============================================================================

type FeatureSlide = {
    headline: {
        prefix: string;
        highlight: string;
        suffix: string;
    };
    image: string;
    alt: string;
};

const featureSlides: FeatureSlide[] = [
    {
        headline: {
            prefix: "Un",
            highlight: "suivi automatique",
            suffix: "de toutes vos dépenses",
        },
        image: "https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-light.webp",
        alt: "Suivi des dépenses",
    },
    {
        headline: {
            prefix: "Des",
            highlight: "budgets intelligents",
            suffix: "pour atteindre vos objectifs",
        },
        image: "https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-light.webp",
        alt: "Gestion de budget",
    },
    {
        headline: {
            prefix: "Une",
            highlight: "vue patrimoine",
            suffix: "complète et centralisée",
        },
        image: "https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-light.webp",
        alt: "Vue patrimoine",
    },
    {
        headline: {
            prefix: "Vos",
            highlight: "investissements",
            suffix: "suivis en temps réel",
        },
        image: "https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-light.webp",
        alt: "Suivi investissements",
    },
    {
        headline: {
            prefix: "Des",
            highlight: "analyses détaillées",
            suffix: "pour mieux comprendre vos finances",
        },
        image: "https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-light.webp",
        alt: "Analyses financières",
    },
];

// =============================================================================
// CAROUSEL COMPONENTS
// =============================================================================

const CarouselDots = ({ total, current, onSelect }: { total: number; current: number; onSelect: (index: number) => void }) => (
    <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, index) => (
            <button
                key={index}
                onClick={() => onSelect(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={cx(
                    "h-2 rounded-full transition-all duration-300",
                    index === current ? "w-6 bg-gray-800 dark:bg-white" : "w-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500",
                )}
            />
        ))}
    </div>
);

const CarouselArrow = ({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) => {
    const Icon = direction === "left" ? ChevronLeft : ChevronRight;

    return (
        <button
            onClick={onClick}
            aria-label={direction === "left" ? "Previous slide" : "Next slide"}
            className={cx("flex size-8 items-center justify-center rounded-full", "text-quaternary transition-all duration-200", "hover:text-secondary")}
        >
            <Icon className="size-5" />
        </button>
    );
};

// Decorative side panel - Left (same rainbow gradient as bottom)
const LeftDecorativePanel = () => (
    <div className="absolute top-1/2 left-0 -z-10 hidden -translate-y-1/4 xl:block">
        <div className="relative">
            <div className={cx("h-[400px] w-28 rounded-r-[32px]", "bg-gradient-to-b from-amber-200/60 via-pink-300/60 via-60% to-cyan-300/60", "blur-xl")} />
            {/* Badge "+12%" */}
            <div className={cx("absolute -top-3 left-4 z-10", "rounded-lg bg-gray-800 px-3 py-1.5 dark:bg-gray-700", "text-xs font-medium text-white")}>
                +12%
            </div>
        </div>
    </div>
);

// Decorative side panel - Right (same rainbow gradient as bottom)
const RightDecorativePanel = () => (
    <div className="absolute top-1/2 right-0 -z-10 hidden -translate-y-1/4 xl:block">
        <div className={cx("h-[400px] w-28 rounded-l-[32px]", "bg-gradient-to-b from-cyan-300/60 via-pink-300/60 via-60% to-amber-200/60", "blur-xl")} />
    </div>
);

// Rainbow gradient bar at bottom (behind the window)
const RainbowGradientBar = () => (
    <div
        className={cx(
            "absolute bottom-0 left-1/2 -z-10",
            "-translate-x-1/2 translate-y-1/3",
            "h-48 w-[100%]",
            "rounded-[40px]",
            "bg-gradient-to-r from-amber-200/70 via-pink-300/70 via-50% to-cyan-300/70",
            "blur-2xl",
        )}
    />
);

// =============================================================================
// APP WINDOW MOCKUP COMPONENT
// =============================================================================

const AppWindowMockup = () => (
    <div className="relative w-full max-w-3xl">
        {/* Window chrome */}
        <div className="overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10">
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/80">
                {/* Traffic lights */}
                <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-full bg-red-400" />
                    <div className="size-3 rounded-full bg-yellow-400" />
                    <div className="size-3 rounded-full bg-green-400" />
                </div>

                {/* Tabs */}
                <div className="ml-4 flex items-center gap-1">
                    <div className="flex items-center gap-1.5 rounded-md bg-brand-500 px-3 py-1">
                        <span className="text-xs font-medium text-white">Finances</span>
                        <ChevronDown className="size-3 text-white/70" />
                    </div>
                    <div className="flex size-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100">
                        <svg className="size-4" fill="currentColor" viewBox="0 0 16 16">
                            <rect x="3" y="3" width="10" height="10" rx="1" />
                        </svg>
                    </div>
                    <div className="flex size-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100">
                        <svg className="size-4" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M4 4h8v8H4z" />
                        </svg>
                    </div>
                </div>

                {/* Tab - Tableau de bord */}
                <div className="ml-2 flex items-center gap-1.5 rounded-md bg-white px-3 py-1 shadow-sm ring-1 ring-black/5 dark:bg-gray-700 dark:ring-white/10">
                    <svg className="size-3.5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="2" width="10" height="12" rx="1" />
                        <path d="M5 5h6M5 8h6M5 11h3" />
                    </svg>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Tableau de bord</span>
                </div>

                <div className="ml-2 flex size-6 items-center justify-center text-gray-300">
                    <svg className="size-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                        <path d="M8 4v8M4 8h8" />
                    </svg>
                </div>
            </div>

            {/* Content area */}
            <div className="flex">
                {/* Main content - Document */}
                <div className="flex-1 p-6">
                    {/* URL bar */}
                    <div className="mb-4 flex items-center gap-2 text-gray-400 dark:text-gray-500">
                        <ChevronLeft className="size-4" />
                        <ChevronRight className="size-4" />
                        <div className="flex items-center gap-1.5 rounded-md bg-gray-50 px-3 py-1.5 dark:bg-gray-800">
                            <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="8" cy="8" r="5" />
                            </svg>
                            <span className="text-xs text-gray-500 dark:text-gray-400">finance.app</span>
                        </div>
                    </div>

                    {/* Document content */}
                    <div className="space-y-4 font-mono text-sm text-gray-700 dark:text-gray-300">
                        <p className="font-semibold">Résumé du mois :</p>
                        <p className="text-gray-600 dark:text-gray-400">
                            Janvier 2024 - Vos finances sont
                            <br />
                            en bonne santé. Vous avez économisé
                            <br />
                            12% de plus que le mois dernier.
                        </p>
                        <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                            <li>
                                • Dépenses totales : 2 450€
                                <br />
                                dont <span className="rounded bg-brand-100 px-1 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">890€</span> en courses
                                <br />
                                et 340€ en restaurants.
                            </li>
                            <li>
                                • Budget alimentation : 85% utilisé
                                <br />
                                Il vous reste 150€ pour ce mois.
                            </li>
                            <li>
                                • Patrimoine total : 45 230€
                                <br />
                                dont 12 500€ en investissements.
                            </li>
                            <li>
                                • Épargne mensuelle : +580€
                                <br />
                                Objectif atteint à 116%.
                            </li>
                            <li>
                                • Prochaine échéance : Loyer
                                <br />
                                850€ prélevés le 05/02.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Sidebar - Catégories */}
                <div className="w-64 border-l border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                    {/* Header */}
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="size-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                                <rect x="2" y="2" width="12" height="12" rx="2" />
                            </svg>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Catégories</span>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">5</span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                            <svg className="size-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                                <path d="M4 4l8 8M12 4l-8 8" />
                            </svg>
                        </button>
                    </div>

                    {/* Action button */}
                    <button className="mb-4 w-full rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white shadow-sm">Voir toutes les dépenses</button>

                    {/* Categories */}
                    <div className="space-y-3">
                        {[
                            { name: "Alimentation", amount: "890€", percent: "36%" },
                            { name: "Transport", amount: "320€", percent: "13%" },
                            { name: "Loisirs", amount: "280€", percent: "11%" },
                        ].map((cat, i) => (
                            <div key={cat.name} className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-amber-600 dark:text-amber-400">📊 {cat.percent}</span>
                                    </div>
                                    <button className="text-xs text-gray-400 dark:text-gray-500">Détails</button>
                                </div>
                                <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">{cat.name}</p>
                                <button
                                    className={cx(
                                        "rounded-md px-3 py-1.5 text-xs font-medium",
                                        i === 1
                                            ? "bg-gray-800 text-white dark:bg-white dark:text-gray-900"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
                                    )}
                                >
                                    {cat.amount}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Footer input */}
                    <div className="mt-4 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                        <span className="text-xs text-gray-400 dark:text-gray-500">Rechercher une dépense...</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// =============================================================================
// FEATURES CAROUSEL SECTION
// =============================================================================

const FeaturesCarouselSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const goToSlide = useCallback(
        (index: number) => {
            setDirection(index > currentIndex ? 1 : -1);
            setCurrentIndex(index);
        },
        [currentIndex],
    );

    const goToPrevious = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + featureSlides.length) % featureSlides.length);
    }, []);

    const goToNext = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % featureSlides.length);
    }, []);

    // Auto-advance slides
    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % featureSlides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const currentSlide = featureSlides[currentIndex];

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 200 : -200,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 200 : -200,
            opacity: 0,
        }),
    };

    return (
        <section className="relative overflow-hidden bg-primary py-16 md:py-24">
            <div className="mx-auto w-full max-w-container px-4 md:px-8">
                {/* Header text */}
                <div className="flex flex-col items-center text-center">
                    <h2 className="text-display-sm font-semibold md:text-display-lg">
                        <span className="text-brand-600 dark:text-brand-400">Oyko</span>
                        <span className="text-primary"> simplifie votre quotidien</span>
                    </h2>
                    <p className="mt-3 text-lg text-tertiary md:text-xl">Tous vos outils financiers en un seul endroit</p>
                </div>

                {/* Carousel navigation */}
                <div className="mt-8 flex items-center justify-center gap-3">
                    <CarouselArrow direction="left" onClick={goToPrevious} />
                    <CarouselDots total={featureSlides.length} current={currentIndex} onSelect={goToSlide} />
                    <CarouselArrow direction="right" onClick={goToNext} />
                </div>

                {/* Headline with animation */}
                <div className="mt-8 md:mt-10">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.p
                            key={currentIndex + "-headline"}
                            custom={direction}
                            variants={{
                                enter: { opacity: 0, y: 15 },
                                center: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: -15 },
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.25 }}
                            className="text-center text-lg text-tertiary md:text-xl"
                        >
                            {currentSlide.headline.prefix}{" "}
                            <span className="font-semibold text-brand-600 dark:text-brand-400">{currentSlide.headline.highlight}</span>{" "}
                            {currentSlide.headline.suffix}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* App window with decorative elements */}
                <div className="relative mt-8 flex items-center justify-center md:mt-10">
                    {/* Decorative panels - OUTSIDE animation, fixed position */}
                    <LeftDecorativePanel />
                    <RightDecorativePanel />

                    {/* Main app window container */}
                    <div className="relative z-10 w-full max-w-4xl">
                        {/* Rainbow gradient at bottom - BEHIND the window */}
                        <RainbowGradientBar />

                        {/* Animated window */}
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 },
                                }}
                                className="relative flex justify-center"
                            >
                                <AppWindowMockup />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

// =============================================================================
// MAIN LANDING PAGE
// =============================================================================

export default function LandingPage() {
    return (
        <div className="relative overflow-hidden bg-primary">
            {/* Background pattern */}
            <img
                alt="Grid of dots"
                aria-hidden="true"
                loading="lazy"
                src="https://www.untitledui.com/patterns/light/grid-dot-sm-desktop.svg"
                className="pointer-events-none absolute top-0 left-1/2 z-0 hidden max-w-none -translate-x-1/2 md:block dark:brightness-[0.2]"
            />
            <img
                alt="Grid of dots"
                aria-hidden="true"
                loading="lazy"
                src="https://www.untitledui.com/patterns/light/grid-dot-sm-mobile.svg"
                className="pointer-events-none absolute top-0 left-1/2 z-0 max-w-none -translate-x-1/2 md:hidden dark:brightness-[0.2]"
            />

            <Header />

            {/* Spacer pour compenser le header fixed */}
            <div className="h-16 md:h-20" />

            {/* Hero Section - Original */}
            <section className="relative overflow-hidden py-16 md:pb-24">
                <div className="mx-auto grid max-w-container grid-cols-1 items-center justify-items-center gap-16 px-4 md:px-8 lg:grid-cols-2 lg:justify-items-start">
                    <div className="flex max-w-3xl flex-col items-center text-center lg:items-start lg:text-left">
                        <BadgeGroup className="hidden md:flex" size="lg" addonText="Nouveau" iconTrailing={ArrowRight} theme="light" color="brand">
                            Synchronisation bancaire
                        </BadgeGroup>
                        <BadgeGroup className="md:hidden" size="md" addonText="Nouveau" iconTrailing={ArrowRight} theme="light" color="brand">
                            Synchronisation bancaire
                        </BadgeGroup>

                        <h1 className="mt-4 text-display-md font-semibold text-primary md:text-display-lg lg:text-display-xl">
                            Gérez vos finances personnelles simplement
                        </h1>
                        <p className="mt-4 max-w-lg text-lg text-balance text-tertiary md:mt-6 md:text-xl">
                            Suivez vos dépenses, gérez votre budget et faites grandir votre patrimoine. Tout en un seul endroit.
                        </p>
                        <div className="mt-8 flex w-full flex-col-reverse items-stretch gap-3 sm:w-auto sm:flex-row sm:items-start md:mt-12">
                            <Link href="/login">
                                <Button iconLeading={PlayCircle} color="secondary" size="xl">
                                    Démo
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="xl">Commencer</Button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative lg:h-full lg:min-h-177">
                        {/* Light mode image (hidden in dark mode) */}
                        <img
                            alt="Macbook Pro Screen Mockup"
                            className="inset-0 h-auto w-full max-w-none object-cover md:h-90 md:w-auto lg:absolute lg:h-full lg:object-left dark:hidden"
                            src="https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-light.webp"
                        />
                        {/* Dark mode image (hidden in light mode) */}
                        <img
                            alt="Macbook Pro Screen Mockup"
                            className="inset-0 h-auto w-full max-w-none object-cover not-dark:hidden md:h-90 md:w-auto lg:absolute lg:h-full lg:object-left"
                            src="https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-dark.webp"
                        />
                    </div>
                </div>
            </section>

            {/* Features Carousel Section - Style Dia Browser */}
            <FeaturesCarouselSection />
        </div>
    );
}
