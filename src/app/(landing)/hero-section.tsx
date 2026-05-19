"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "@untitledui/icons";
import Link from "next/link";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { MockFrame } from "react-mockframe";
import "react-mockframe/styles/mockframe-laptops.min.css";
import { BadgeGroup } from "@/components/base/badges/badge-groups";
import { Button } from "@/components/base/buttons/button";
import { OykoDesktopScreen } from "@/components/shared-assets/oyko-desktop-screen";

// =============================================================================
// WORD-BY-WORD TEXT REVEAL
// =============================================================================

const WordReveal = ({ children, className, delay = 0 }: { children: string; className?: string; delay?: number }) => {
    const words = children.split(" ");
    return (
        <span className={className}>
            {words.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden">
                    <motion.span
                        className="inline-block"
                        initial={{ y: "110%", rotateX: 40 }}
                        animate={{ y: "0%", rotateX: 0 }}
                        transition={{
                            duration: 0.7,
                            delay: delay + i * 0.05,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                    >
                        {word}
                    </motion.span>
                    {i < words.length - 1 && "\u00A0"}
                </span>
            ))}
        </span>
    );
};

// =============================================================================
// HERO SECTION
// =============================================================================

export const HeroSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });

    // Parallax: text moves slower, mockup moves faster
    const textY = useTransform(scrollYProgress, [0, 1], [0, -60]);
    const mockupY = useTransform(scrollYProgress, [0, 1], [0, -120]);
    const mockupScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

    // Floating idle animation for mockup
    const floatY = useMotionValue(0);
    const smoothFloat = useSpring(floatY, { damping: 20, stiffness: 100 });

    useEffect(() => {
        let frame: number;
        const animate = () => {
            floatY.set(Math.sin(Date.now() / 2000) * 6);
            frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [floatY]);

    return (
        <section ref={sectionRef} className="relative overflow-hidden pt-6 pb-12 md:py-16 md:pb-24">
            <div className="mx-auto grid max-w-container grid-cols-1 items-center justify-items-center gap-10 px-4 md:gap-16 md:px-8 lg:grid-cols-2 lg:justify-items-start">
                {/* Contenu texte — parallax layer */}
                <motion.div
                    className="flex max-w-3xl flex-col items-center text-center lg:items-start lg:text-left"
                    style={{ y: textY }}
                >
                    {/* Badge — slide down + fade */}
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Link href="#features" className="group -m-2 rounded-full p-2 active:opacity-80">
                            <BadgeGroup
                                className="hidden transition-transform duration-150 group-active:scale-[0.98] md:flex"
                                size="lg"
                                addonText="Nouveau"
                                iconTrailing={ArrowRight}
                                theme="light"
                                color="brand"
                            >
                                Synchronisation bancaire
                            </BadgeGroup>
                            <BadgeGroup
                                className="transition-transform duration-150 group-active:scale-[0.98] md:hidden"
                                size="md"
                                addonText="Nouveau"
                                iconTrailing={ArrowRight}
                                theme="light"
                                color="brand"
                            >
                                Synchronisation bancaire
                            </BadgeGroup>
                        </Link>
                    </motion.div>

                    {/* Title — word-by-word reveal */}
                    <h1 className="mt-4 text-display-sm font-semibold text-primary md:text-display-lg lg:text-display-xl [perspective:800px]">
                        <WordReveal delay={0.3}>Gérez vos finances personnelles simplement</WordReveal>
                    </h1>

                    {/* Subtitle — line fade-in */}
                    <motion.p
                        className="mt-3 max-w-lg text-md text-tertiary md:mt-6 md:text-xl"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        Suivez vos dépenses, gérez votre budget et faites grandir votre patrimoine. Tout en un seul endroit.
                    </motion.p>

                    {/* Buttons — staggered pop-in */}
                    <motion.div
                        className="mt-6 flex w-full flex-row items-stretch justify-center gap-3 md:mt-12 md:w-auto md:justify-start"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Link href="/login" className="shrink-0">
                            <Button color="secondary" size="lg" className="md:size-xl">
                                Se connecter
                            </Button>
                        </Link>
                        <Link href="/signup" className="shrink-0">
                            <Button iconTrailing={ArrowRight} size="lg" className="md:size-xl">
                                Commencer
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* MacBook Pro mockup — 3D entrance + parallax + float */}
                <motion.div
                    className="relative w-full lg:h-full lg:min-h-177"
                    style={{ y: useTransform(() => mockupY.get() + smoothFloat.get()), scale: mockupScale }}
                    initial={{ opacity: 0, x: 80, rotateY: -8 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="inset-0 [perspective:1200px] lg:absolute">
                        <MockFrame device="MacBook Pro 2020">
                            <OykoDesktopScreen />
                        </MockFrame>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
