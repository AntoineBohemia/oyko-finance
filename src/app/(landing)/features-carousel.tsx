"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, User01, Users01, Home02, GraduationHat01 } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import { cx } from "@/utils/cx";

// =============================================================================
// TYPES & DATA
// =============================================================================

type UseCase = {
    id: string;
    title: string;
    icon: typeof User01;
    headline: {
        prefix: string;
        highlight: string;
        suffix: string;
    };
    features: string[];
    stat: {
        value: string;
        label: string;
    };
};

const useCases: UseCase[] = [
    {
        id: "freelance",
        title: "Freelance",
        icon: User01,
        headline: {
            prefix: "Séparez",
            highlight: "pro et perso",
            suffix: "en toute simplicité",
        },
        features: [
            "Suivi des revenus par client",
            "Calcul automatique des charges",
            "Export pour le comptable",
            "Alertes TVA et URSSAF",
        ],
        stat: {
            value: "3h",
            label: "gagnées par mois en compta",
        },
    },
    {
        id: "couple",
        title: "Couple",
        icon: Users01,
        headline: {
            prefix: "Gérez vos",
            highlight: "finances à deux",
            suffix: "sans prise de tête",
        },
        features: [
            "Comptes joints et perso séparés",
            "Budgets partagés",
            "Répartition équitable des dépenses",
            "Objectifs d'épargne communs",
        ],
        stat: {
            value: "89%",
            label: "moins de disputes sur l'argent",
        },
    },
    {
        id: "famille",
        title: "Famille",
        icon: Home02,
        headline: {
            prefix: "Pilotez le",
            highlight: "budget familial",
            suffix: "sereinement",
        },
        features: [
            "Vue consolidée de tous les comptes",
            "Suivi des dépenses par enfant",
            "Planification des vacances",
            "Anticipation des grosses dépenses",
        ],
        stat: {
            value: "450€",
            label: "économisés en moyenne par an",
        },
    },
    {
        id: "etudiant",
        title: "Étudiant",
        icon: GraduationHat01,
        headline: {
            prefix: "Apprenez à",
            highlight: "gérer votre argent",
            suffix: "dès maintenant",
        },
        features: [
            "Interface simple et intuitive",
            "Alertes avant découvert",
            "Suivi des aides et bourses",
            "100% gratuit, sans engagement",
        ],
        stat: {
            value: "0€",
            label: "de frais cachés, jamais",
        },
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
                aria-label={`Voir le cas ${useCases[index].title}`}
                className={cx(
                    "h-2 rounded-full transition-all duration-300",
                    index === current ? "w-6 bg-brand-600 dark:bg-brand-400" : "w-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500",
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
            aria-label={direction === "left" ? "Cas précédent" : "Cas suivant"}
            className={cx("flex size-10 items-center justify-center rounded-full", "text-tertiary transition-all duration-200", "hover:bg-secondary hover:text-primary")}
        >
            <Icon className="size-5" />
        </button>
    );
};

// =============================================================================
// MINI DASHBOARD MOCKUP - Style cohérent avec OykoUsersChart
// =============================================================================

const MiniDashboard = () => {
    return (
        <div
            className={cx(
                "flex h-full flex-col overflow-hidden rounded-2xl",
                "bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10",
            )}
        >
            {/* Header - même style que OykoUsersChart */}
            <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-tertiary">Solde total</p>
                        <p className="text-lg font-semibold text-primary">8 234,50 €</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 dark:bg-success-900/30">
                        <svg className="size-3 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-xs font-medium text-success-700 dark:text-success-400">+3.2%</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-3 p-4">
                {/* Mini stats row */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-800/50">
                        <div className="flex size-7 items-center justify-center rounded-md bg-brand-100 dark:bg-brand-900/50">
                            <svg className="size-3.5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] text-tertiary">Revenus</p>
                            <p className="text-xs font-semibold text-primary">2 800 €</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-800/50">
                        <div className="flex size-7 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                            <svg className="size-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] text-tertiary">Dépenses</p>
                            <p className="text-xs font-semibold text-primary">1 950 €</p>
                        </div>
                    </div>
                </div>

                {/* Budget progress - style cohérent */}
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/30">
                    <p className="mb-2 text-xs font-medium text-primary">Budgets</p>
                    <div className="space-y-2">
                        <div>
                            <div className="flex items-center justify-between text-[10px] mb-1">
                                <span className="text-secondary">Alimentation</span>
                                <span className="text-tertiary">280€ / 350€</span>
                            </div>
                            <div className="h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                <div className="h-full w-[80%] rounded-full bg-brand-500" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-[10px] mb-1">
                                <span className="text-secondary">Transport</span>
                                <span className="text-tertiary">65€ / 120€</span>
                            </div>
                            <div className="h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                <div className="h-full w-[54%] rounded-full bg-teal-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transactions - style cohérent */}
                <div className="flex-1">
                    <p className="mb-2 text-xs font-medium text-primary">Récent</p>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2">
                                <div className="flex size-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                    <svg className="size-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-primary">Courses</p>
                                    <p className="text-[10px] text-tertiary">Alimentation</p>
                                </div>
                            </div>
                            <p className="text-xs font-medium text-primary">-42,30 €</p>
                        </div>
                        <div className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2">
                                <div className="flex size-6 items-center justify-center rounded-full bg-success-100 dark:bg-success-900/30">
                                    <svg className="size-3 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-primary">Salaire</p>
                                    <p className="text-[10px] text-tertiary">Revenus</p>
                                </div>
                            </div>
                            <p className="text-xs font-medium text-success-600">+2 800 €</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// USE CASE CARD - Split Layout Style
// =============================================================================

const UseCaseCard = ({ useCase }: { useCase: UseCase }) => {
    return (
        <div className="mx-auto w-full max-w-4xl px-4">
            <div
                className={cx(
                    "overflow-hidden rounded-3xl",
                    "bg-white shadow-2xl ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800",
                )}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Left side - Content */}
                    <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                        {/* Badge */}
                        <div className="mb-4">
                            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-900/50 dark:text-brand-400">
                                {useCase.title}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-semibold text-primary sm:text-3xl">
                            {useCase.headline.prefix}{" "}
                            <span className="text-brand-600 dark:text-brand-400">{useCase.headline.highlight}</span>{" "}
                            {useCase.headline.suffix}
                        </h3>

                        {/* Features */}
                        <ul className="mt-6 space-y-3">
                            {useCase.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/50">
                                        <svg className="size-3 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-secondary">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Stat */}
                        <div className="mt-8 flex items-baseline gap-2">
                            <span className="text-display-sm font-bold text-brand-600 dark:text-brand-400">
                                {useCase.stat.value}
                            </span>
                            <span className="text-sm text-tertiary">{useCase.stat.label}</span>
                        </div>
                    </div>

                    {/* Right side - Visual */}
                    <div className="relative min-h-[280px] bg-gray-100 dark:bg-gray-800 lg:min-h-0">
                        <div className="absolute inset-4 lg:inset-6">
                            <MiniDashboard />
                        </div>

                        {/* Decorative gradient overlay */}
                        <div
                            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent"
                            aria-hidden="true"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// DECORATIVE ELEMENTS
// =============================================================================

const RainbowGradientBar = () => (
    <div
        className={cx(
            "pointer-events-none absolute -bottom-6 left-1/2",
            "h-24 w-full max-w-xl",
            "rounded-[32px]",
            "bg-gradient-to-r from-amber-200/50 via-pink-300/50 via-50% to-cyan-300/50",
            "blur-3xl",
        )}
        style={{
            animation: "gradient-pulse 4s ease-in-out infinite",
        }}
        aria-hidden="true"
    />
);

// =============================================================================
// TAB SELECTOR
// =============================================================================

const TabSelector = ({ useCases, currentIndex, onSelect }: { useCases: UseCase[]; currentIndex: number; onSelect: (index: number) => void }) => (
    <div className="flex flex-wrap justify-center gap-2">
        {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
                <button
                    key={useCase.id}
                    onClick={() => onSelect(index)}
                    className={cx(
                        "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                        index === currentIndex
                            ? "bg-brand-600 text-white shadow-md"
                            : "bg-secondary text-secondary hover:bg-tertiary hover:text-primary"
                    )}
                >
                    <Icon className="size-4" />
                    {useCase.title}
                </button>
            );
        })}
    </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const FeaturesCarousel = () => {
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
        setCurrentIndex((prev) => (prev - 1 + useCases.length) % useCases.length);
    }, []);

    const goToNext = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % useCases.length);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % useCases.length);
        }, 6000);

        return () => clearInterval(timer);
    }, []);

    const currentUseCase = useCases[currentIndex];

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 100 : -100,
            opacity: 0,
        }),
    };

    return (
        <section className="relative bg-primary py-16 md:py-24">
            <div className="mx-auto w-full max-w-container px-4 md:px-8">
                {/* Header */}
                <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
                    <span className="text-sm font-semibold text-brand-secondary md:text-md">Pour qui ?</span>
                    <h2 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">
                        Oyko s'adapte à votre situation
                    </h2>
                    <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">
                        Que vous soyez seul, en couple ou en famille, Oyko répond à vos besoins.
                    </p>
                </div>

                {/* Tab selector (desktop) */}
                <div className="mt-10 hidden md:block">
                    <TabSelector useCases={useCases} currentIndex={currentIndex} onSelect={goToSlide} />
                </div>

                {/* Animated headline */}
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
                            {currentUseCase.headline.prefix}{" "}
                            <span className="font-semibold text-brand-600 dark:text-brand-400">{currentUseCase.headline.highlight}</span>{" "}
                            {currentUseCase.headline.suffix}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Card carousel with decorative elements */}
                <div className="relative mt-8 overflow-visible pb-8 md:mt-10">
                    <div className="relative z-10">
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
                            >
                                <UseCaseCard useCase={currentUseCase} />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <RainbowGradientBar />
                </div>

                {/* Navigation (mobile) */}
                <div className="mt-8 flex items-center justify-center gap-3 md:hidden">
                    <CarouselArrow direction="left" onClick={goToPrevious} />
                    <CarouselDots total={useCases.length} current={currentIndex} onSelect={goToSlide} />
                    <CarouselArrow direction="right" onClick={goToNext} />
                </div>
            </div>
        </section>
    );
};
