"use client";

import { type MouseEvent, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "@untitledui/icons";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import { MockFrame } from "react-mockframe";
import "react-mockframe/styles/mockframe-iphones.min.css";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

// =============================================================================
// OYKO SCREEN — Dashboard content (bg-gray-900 to blend with card)
// =============================================================================

const OykoScreen = () => (
    <div className="flex h-full flex-col bg-gray-900 px-5 pt-14 pb-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#BEFF00]/15 ring-1 ring-[#BEFF00]/20">
                    <span className="text-xs font-bold text-[#BEFF00]">A</span>
                </div>
                <div>
                    <p className="text-[11px] text-gray-500">Bonjour, Antoine</p>
                    <p className="text-sm font-semibold text-white">Mon Dashboard</p>
                </div>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-white/[0.06]">
                <svg className="size-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
            </div>
        </div>

        <div className="mt-5 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/[0.06]">
            <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500">Solde disponible</p>
            <div className="mt-1.5 flex items-baseline gap-0.5">
                <span className="font-mono text-3xl font-bold tracking-tight text-white">1 247</span>
                <span className="font-mono text-lg font-bold text-gray-600">,50 €</span>
            </div>
            <div className="mt-3.5 flex items-center gap-2.5">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-800">
                    <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-[#BEFF00] to-[#9ACC00]" />
                </div>
                <span className="font-mono text-[10px] font-semibold text-[#BEFF00]">62%</span>
            </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
            {[
                { emoji: "🍔", name: "Alimentation", spent: "280 €", pct: 70 },
                { emoji: "🚇", name: "Transport", spent: "65 €", pct: 35 },
                { emoji: "🎮", name: "Loisirs", spent: "175 €", pct: 88 },
                { emoji: "👕", name: "Vêtements", spent: "45 €", pct: 20 },
            ].map((env) => (
                <div key={env.name} className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/[0.05]">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs">{env.emoji}</span>
                        <span className="text-[10px] font-medium text-gray-300">{env.name}</span>
                    </div>
                    <p className="mt-1 font-mono text-xs font-semibold text-white">{env.spent}</p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-800">
                        <div
                            className={cx("h-full rounded-full", env.pct > 80 ? "bg-amber-500" : "bg-gradient-to-r from-white/70 to-white/40")}
                            style={{ width: `${env.pct}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-4">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-gray-500">Récent</p>
            <div className="flex flex-col divide-y divide-white/[0.04]">
                {[
                    { name: "Carrefour Market", cat: "Alimentation", amount: "-47,32 €", positive: false },
                    { name: "Salaire Mai", cat: "Revenus", amount: "+2 800 €", positive: true },
                    { name: "Netflix", cat: "Abonnement", amount: "-13,99 €", positive: false },
                    { name: "SNCF", cat: "Transport", amount: "-35,00 €", positive: false },
                ].map((tx) => (
                    <div key={tx.name} className="flex items-center justify-between py-2.5">
                        <div className="flex items-center gap-2.5">
                            <div className={cx("flex size-6 items-center justify-center rounded-full text-[9px]", tx.positive ? "bg-[#BEFF00]/10 text-[#BEFF00]" : "bg-white/[0.04] text-gray-500")}>
                                {tx.positive ? "↓" : "↑"}
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-gray-200">{tx.name}</p>
                                <p className="text-[9px] text-gray-600">{tx.cat}</p>
                            </div>
                        </div>
                        <span className={cx("font-mono text-[11px] font-medium", tx.positive ? "text-[#BEFF00]" : "text-gray-400")}>{tx.amount}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// =============================================================================
// MAIN CTA SECTION
// =============================================================================

const ease = [0.16, 1, 0.3, 1] as const;

export const CtaSection = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    // 3D Tilt — copied from BentoCard pattern
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), { damping: 30, stiffness: 200 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { damping: 30, stiffness: 200 });

    // Cursor glow position
    const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), { damping: 30, stiffness: 200 });
    const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), { damping: 30, stiffness: 200 });

    const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    }, [mouseX, mouseY]);

    const handleMouseLeave = useCallback(() => {
        mouseX.set(0);
        mouseY.set(0);
    }, [mouseX, mouseY]);

    // Float idle for iPhone mockup — RAF loop from Hero
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
        <section className="relative bg-primary py-16 md:py-24">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 40, scale: 0.98 }}
                    animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{ rotateX, rotateY, transformPerspective: 1200 }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="group relative min-h-[480px] overflow-hidden rounded-2xl bg-gray-900 ring-1 ring-white/[0.06] md:rounded-3xl"
                >
                    {/* Cursor-following glow */}
                    <motion.div
                        className="pointer-events-none absolute -inset-px z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                            background: useTransform(
                                () => `radial-gradient(400px circle at ${glowX.get()}% ${glowY.get()}%, rgba(190,255,0,0.07), transparent 60%)`,
                            ),
                        }}
                        aria-hidden="true"
                    />

                    {/* Pulsing background glow */}
                    <motion.div
                        className="pointer-events-none absolute inset-0"
                        style={{ background: "radial-gradient(ellipse 50% 60% at 25% 50%, rgba(190,255,0,0.07), transparent 60%)" }}
                        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        aria-hidden="true"
                    />

                    {/* Content — text is in normal flow, phone is absolute */}
                    <div className="relative z-10 px-6 py-10 md:px-12 md:py-14 lg:px-16 lg:py-16">
                        {/* Text content — constrained to left half on desktop */}
                        <div className="flex flex-col items-center text-center lg:max-w-[50%] lg:items-start lg:text-left">
                            <motion.h2
                                className="text-display-xs font-semibold text-white md:text-display-md lg:text-display-lg"
                                initial={{ opacity: 0, y: 24 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, ease, delay: 0.15 }}
                            >
                                Prêt à reprendre le contrôle&nbsp;?
                            </motion.h2>

                            <motion.p
                                className="mt-4 max-w-md text-md leading-relaxed text-gray-400 md:mt-5 md:text-lg"
                                initial={{ opacity: 0, y: 24 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, ease, delay: 0.25 }}
                            >
                                Rejoignez des milliers d'utilisateurs qui gèrent leurs finances simplement. Aucune carte bancaire requise.
                            </motion.p>

                            <motion.div
                                className="mt-8 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start"
                                initial={{ opacity: 0, y: 24 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, ease, delay: 0.35 }}
                            >
                                {[
                                    { icon: "🔐", label: "Chiffré AES-256" },
                                    { icon: "🇫🇷", label: "Hébergé en France" },
                                    { icon: "✓", label: "Conforme RGPD" },
                                ].map((badge) => (
                                    <div key={badge.label} className="flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5 text-xs text-gray-400 ring-1 ring-white/[0.06]">
                                        <span className="text-[11px]">{badge.icon}</span>
                                        <span>{badge.label}</span>
                                    </div>
                                ))}
                            </motion.div>

                            <motion.div
                                className="mt-8 flex flex-row items-center gap-3 md:mt-10"
                                initial={{ opacity: 0, y: 24 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, ease, delay: 0.45 }}
                            >
                                <Link href="/signup">
                                    <Button iconTrailing={ArrowRight} size="lg" className="md:size-xl">
                                        Commencer gratuitement
                                    </Button>
                                </Link>
                                <Link href="mailto:contact@oyko.fr">
                                    <Button size="lg" color="tertiary" className="md:size-xl text-gray-400 hover:text-white">
                                        Contact
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>

                    {/* Phone — absolute, anchored bottom-right, entrance + float */}
                    <div className="pointer-events-none absolute right-20 -bottom-44 z-10 hidden lg:block xl:right-28 [perspective:1200px]">
                        <motion.div
                            style={{
                                y: smoothFloat,
                                transform: "scale(0.75)",
                                transformOrigin: "bottom right",
                            }}
                            initial={{ opacity: 0, x: 120, rotateY: -12 }}
                            animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : {}}
                            transition={{ duration: 1, ease, delay: 0.4 }}
                        >
                            <MockFrame device="iPhone 17" color="black">
                                <OykoScreen />
                            </MockFrame>
                        </motion.div>
                    </div>

                    {/* Fade at bottom of phone area */}
                    <div
                        className="pointer-events-none absolute right-0 bottom-0 z-20 hidden h-24 w-1/2 lg:block"
                        style={{ background: "linear-gradient(to top, rgb(17 24 39) 10%, transparent)" }}
                        aria-hidden="true"
                    />
                </motion.div>
            </div>
        </section>
    );
};
