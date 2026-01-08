"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import { cx } from "@/utils/cx";

// =============================================================================
// TYPES
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

// =============================================================================
// DATA
// =============================================================================

const slides: FeatureSlide[] = [
    {
        headline: {
            prefix: "An",
            highlight: "in-line copy editor",
            suffix: "to avoid the messy copy-paste",
        },
        image: "https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-light.webp",
        alt: "In-line copy editor feature",
    },
    {
        headline: {
            prefix: "An",
            highlight: "extra set of eyes",
            suffix: "to always hit your quality bar",
        },
        image: "https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-light.webp",
        alt: "Quality review feature",
    },
    {
        headline: {
            prefix: "The",
            highlight: "perfect word",
            suffix: "always at your fingertips",
        },
        image: "https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-light.webp",
        alt: "Word suggestion feature",
    },
    {
        headline: {
            prefix: "Your",
            highlight: "writing style",
            suffix: "consistently maintained",
        },
        image: "https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-light.webp",
        alt: "Writing style feature",
    },
    {
        headline: {
            prefix: "Smart",
            highlight: "context awareness",
            suffix: "for better suggestions",
        },
        image: "https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-light.webp",
        alt: "Context awareness feature",
    },
];

// =============================================================================
// COMPONENTS
// =============================================================================

const CarouselDots = ({ total, current, onSelect }: { total: number; current: number; onSelect: (index: number) => void }) => {
    return (
        <div className="flex items-center gap-2">
            {Array.from({ length: total }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={cx("h-2 rounded-full transition-all duration-300", index === current ? "w-8 bg-gray-800" : "w-2 bg-gray-300 hover:bg-gray-400")}
                />
            ))}
        </div>
    );
};

const CarouselArrow = ({ direction, onClick, disabled }: { direction: "left" | "right"; onClick: () => void; disabled?: boolean }) => {
    const Icon = direction === "left" ? ChevronLeft : ChevronRight;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={direction === "left" ? "Previous slide" : "Next slide"}
            className={cx(
                "flex size-10 items-center justify-center rounded-full",
                "border border-gray-200 bg-white",
                "text-gray-400 transition-all duration-200",
                "hover:border-gray-300 hover:text-gray-600",
                "disabled:cursor-not-allowed disabled:opacity-40",
            )}
        >
            <Icon className="size-5" />
        </button>
    );
};

// Decorative side panels
const LeftDecorativePanel = () => (
    <div className="absolute top-1/2 left-0 z-0 hidden -translate-y-1/2 lg:block">
        <div className="relative">
            {/* Yellow/Orange gradient card */}
            <div className={cx("h-96 w-40 rounded-r-3xl", "bg-gradient-to-br from-amber-200 via-yellow-300 to-orange-300", "shadow-lg")} />
            {/* Small badge */}
            <div className={cx("absolute -top-4 left-8", "rounded-lg bg-gray-700 px-3 py-1.5", "text-xs font-medium text-white", "shadow-md")}>1.00</div>
        </div>
    </div>
);

const RightDecorativePanel = () => (
    <div className="absolute top-1/2 right-0 z-0 hidden -translate-y-1/2 lg:block">
        <div className={cx("h-96 w-40 rounded-l-3xl", "bg-gradient-to-br from-blue-100 via-blue-200 to-indigo-200", "shadow-lg")} />
    </div>
);

// Rainbow gradient bar at the bottom
const RainbowGradientBar = () => (
    <div
        className={cx(
            "absolute bottom-0 left-1/2 z-10",
            "-translate-x-1/2",
            "h-24 w-[80%] max-w-4xl",
            "rounded-t-3xl",
            "bg-gradient-to-r from-yellow-300 via-pink-300 via-50% to-cyan-300",
            "opacity-60 blur-sm",
        )}
    />
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
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(currentIndex - 1);
        }
    }, [currentIndex]);

    const goToNext = useCallback(() => {
        if (currentIndex < slides.length - 1) {
            setDirection(1);
            setCurrentIndex(currentIndex + 1);
        }
    }, [currentIndex]);

    // Auto-advance slides
    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const currentSlide = slides[currentIndex];

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    };

    return (
        <section className="relative overflow-hidden bg-gray-50 py-16 md:py-24">
            <div className="mx-auto w-full max-w-container px-4 md:px-8">
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                    <h2 className="text-display-sm font-semibold md:text-display-lg">
                        <span className="text-brand-600">Untitled</span>
                        <span className="text-gray-900"> is for Teams</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-500 md:text-xl">A collaboration partner in every workflow</p>
                </div>

                {/* Carousel navigation */}
                <div className="mt-8 flex items-center justify-center gap-4">
                    <CarouselArrow direction="left" onClick={goToPrevious} disabled={currentIndex === 0} />
                    <CarouselDots total={slides.length} current={currentIndex} onSelect={goToSlide} />
                    <CarouselArrow direction="right" onClick={goToNext} disabled={currentIndex === slides.length - 1} />
                </div>

                {/* Slide content */}
                <div className="relative mt-8 md:mt-12">
                    {/* Headline with animation */}
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.p
                            key={currentIndex + "-headline"}
                            custom={direction}
                            variants={{
                                enter: { opacity: 0, y: 20 },
                                center: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: -20 },
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="text-center text-lg text-gray-600 md:text-xl"
                        >
                            {currentSlide.headline.prefix} <span className="font-semibold text-brand-600">{currentSlide.headline.highlight}</span>{" "}
                            {currentSlide.headline.suffix}
                        </motion.p>
                    </AnimatePresence>

                    {/* Image container with decorative elements */}
                    <div className="relative mt-8 flex items-center justify-center md:mt-12">
                        {/* Decorative panels */}
                        <LeftDecorativePanel />
                        <RightDecorativePanel />

                        {/* Main image */}
                        <div className="relative z-10 w-full max-w-3xl">
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
                                    className="relative"
                                >
                                    {/* Shadow/glow effect */}
                                    <div
                                        className={cx(
                                            "absolute inset-0 z-0",
                                            "rounded-2xl",
                                            "bg-gradient-to-b from-transparent via-transparent to-gray-200/50",
                                            "blur-xl",
                                        )}
                                    />

                                    <img
                                        src={currentSlide.image}
                                        alt={currentSlide.alt}
                                        className="relative z-10 h-auto w-full rounded-xl object-contain shadow-2xl"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Rainbow gradient at bottom */}
                            <RainbowGradientBar />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
