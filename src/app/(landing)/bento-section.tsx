"use client";

import { type MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import { cx } from "@/utils/cx";

// =============================================================================
// 3D TILT CARD WITH CURSOR GLOW
// =============================================================================

const BentoCard = ({
    children,
    className,
    dark = false,
    glow,
    index = 0,
}: {
    children: React.ReactNode;
    className?: string;
    dark?: boolean;
    glow?: "lime" | "amber";
    index?: number;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    // Mouse position for 3D tilt + cursor glow
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), { damping: 30, stiffness: 200 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { damping: 30, stiffness: 200 });

    const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    }, [mouseX, mouseY]);

    const handleMouseLeave = useCallback(() => {
        mouseX.set(0);
        mouseY.set(0);
    }, [mouseX, mouseY]);

    // Cursor glow position
    const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), { damping: 30, stiffness: 200 });
    const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), { damping: 30, stiffness: 200 });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
            style={{ rotateX, rotateY, transformPerspective: 1200 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cx(
                "group relative overflow-hidden rounded-2xl",
                "transition-shadow duration-300 ease-out",
                dark
                    ? "bg-[#111318] ring-1 ring-white/[0.06] hover:ring-white/[0.12]"
                    : "bg-white shadow-sm ring-1 ring-gray-200/60 hover:shadow-lg",
                className,
            )}
        >
            {/* Cursor-following glow */}
            <motion.div
                className="pointer-events-none absolute -inset-px z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: useTransform(
                        () => `radial-gradient(400px circle at ${glowX.get()}% ${glowY.get()}%, ${dark ? "rgba(190,255,0,0.07)" : "rgba(0,0,0,0.03)"}, transparent 60%)`,
                    ),
                }}
                aria-hidden="true"
            />

            {/* Static glow overlay */}
            {glow && (
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            glow === "lime"
                                ? "radial-gradient(ellipse 70% 50% at 20% 50%, rgba(190,255,0,0.06), transparent 60%)"
                                : "radial-gradient(ellipse 60% 50% at 80% 80%, rgba(251,191,36,0.05), transparent 60%)",
                    }}
                    aria-hidden="true"
                />
            )}

            {/* Shine effect on hover */}
            <motion.div
                className="pointer-events-none absolute -inset-full z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)",
                    transform: "translateX(-100%)",
                }}
                aria-hidden="true"
            />

            <div className="relative z-10">{children}</div>
        </motion.div>
    );
};

// =============================================================================
// SMOOTH COUNTING NUMBER
// =============================================================================

const CountUp = ({ value, className, suffix = "" }: { value: number; className?: string; suffix?: string }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const motionVal = useMotionValue(0);
    const spring = useSpring(motionVal, { damping: 40, stiffness: 120 });
    const [display, setDisplay] = useState("0");

    useEffect(() => {
        if (isInView) motionVal.set(value);
    }, [isInView, motionVal, value]);

    useEffect(() => {
        const unsubscribe = spring.on("change", (v) => {
            setDisplay(Math.round(v).toLocaleString("fr-FR"));
        });
        return unsubscribe;
    }, [spring]);

    return (
        <span ref={ref} className={className}>
            {display}{suffix}
        </span>
    );
};

// =============================================================================
// SVG PATH DRAW CHART
// =============================================================================

const AreaChart = () => {
    const ref = useRef<SVGSVGElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <svg ref={ref} viewBox="0 0 280 100" className="h-full w-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="bento-area-light" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#BEFF00" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#BEFF00" stopOpacity="0" />
                </linearGradient>
            </defs>
            <line x1="0" y1="25" x2="280" y2="25" stroke="black" strokeOpacity="0.04" />
            <line x1="0" y1="50" x2="280" y2="50" stroke="black" strokeOpacity="0.04" />
            <line x1="0" y1="75" x2="280" y2="75" stroke="black" strokeOpacity="0.04" />
            <motion.path
                d="M0,78 C15,75 30,70 50,64 C70,58 85,56 105,48 C125,42 140,40 160,34 C180,28 200,22 220,16 C240,12 260,8 280,6 L280,100 L0,100 Z"
                fill="url(#bento-area-light)"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 1.2, delay: 0.5 }}
            />
            <motion.path
                d="M0,78 C15,75 30,70 50,64 C70,58 85,56 105,48 C125,42 140,40 160,34 C180,28 200,22 220,16 C240,12 260,8 280,6"
                fill="none"
                stroke="#84A300"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            />
            <motion.circle
                cx="280" cy="6" r="4" fill="#84A300"
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ type: "spring", damping: 10, stiffness: 300, delay: 2 }}
            />
            <motion.circle
                cx="280" cy="6" r="10" fill="#84A300" opacity="0.15"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: [0, 1.5, 1] } : {}}
                transition={{ duration: 0.6, delay: 2 }}
            />
        </svg>
    );
};

// =============================================================================
// ANIMATED BAR CHART
// =============================================================================

const BarChart = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const bars = [35, 52, 28, 65, 42, 78, 55, 30, 48, 60, 38, 72];

    return (
        <div ref={ref} className="flex h-full items-end gap-[3px]">
            {bars.map((h, i) => (
                <motion.div
                    key={i}
                    className="flex-1 rounded-t"
                    initial={{ scaleY: 0 }}
                    animate={isInView ? { scaleY: 1 } : {}}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.05 }}
                    style={{
                        height: `${h}%`,
                        transformOrigin: "bottom",
                        background:
                            i === 5
                                ? "linear-gradient(to top, #8CBF00, #BEFF00)"
                                : "linear-gradient(to top, rgba(255,255,255,0.04), rgba(255,255,255,0.1))",
                    }}
                />
            ))}
        </div>
    );
};

// =============================================================================
// ANIMATED PROGRESS BAR
// =============================================================================

const AnimatedBar = ({ pct, warn }: { pct: number; warn?: boolean }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-30px" });

    return (
        <div ref={ref} className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={isInView ? { width: `${pct}%` } : {}}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                style={{
                    background: warn
                        ? "linear-gradient(90deg, #F59E0B, #D97706)"
                        : "linear-gradient(90deg, #1F2937, #374151)",
                }}
            />
        </div>
    );
};

// =============================================================================
// ENVELOPE ROW
// =============================================================================

const EnvelopeRow = ({ emoji, name, spent, total }: { emoji: string; name: string; spent: number; total: number }) => {
    const pct = Math.round((spent / total) * 100);
    const isWarn = pct > 80;
    return (
        <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gray-50 text-sm ring-1 ring-gray-100">{emoji}</div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">{name}</span>
                    <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-gray-400">{spent} / {total} €</span>
                        <span className={cx("font-mono text-[10px] font-semibold", isWarn ? "text-amber-600" : "text-gray-400")}>{pct}%</span>
                    </div>
                </div>
                <AnimatedBar pct={pct} warn={isWarn} />
            </div>
        </div>
    );
};

// =============================================================================
// TRANSACTION ROW
// =============================================================================

const TxRow = ({ name, cat, amount, positive }: { name: string; cat: string; amount: string; positive?: boolean }) => (
    <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
        <div className="flex items-center gap-3">
            <div className={cx("flex size-7 items-center justify-center rounded-full text-xs", positive ? "bg-[#BEFF00]/10 text-[#BEFF00]" : "bg-white/[0.04] text-gray-500")}>
                {positive ? "↓" : "↑"}
            </div>
            <div>
                <span className="text-sm font-medium text-gray-200">{name}</span>
                <p className="text-[11px] text-gray-600">{cat}</p>
            </div>
        </div>
        <span className={cx("font-mono text-sm font-medium", positive ? "text-[#BEFF00]" : "text-gray-400")}>{amount}</span>
    </div>
);

// =============================================================================
// DONUT — animated ring
// =============================================================================

const DonutChart = () => {
    const ref = useRef<SVGSVGElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <svg ref={ref} viewBox="0 0 80 80" className="size-16">
            <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
            <motion.circle
                cx="40" cy="40" r="30" fill="none" stroke="#BEFF00" strokeWidth="8" strokeLinecap="round"
                strokeDasharray="188.5"
                transform="rotate(-90 40 40)"
                initial={{ strokeDashoffset: 188.5 }}
                animate={isInView ? { strokeDashoffset: 71.6 } : {}}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            />
            <text x="40" y="42" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="14" fontWeight="700" fontFamily="ui-monospace, monospace">62</text>
        </svg>
    );
};

// =============================================================================
// SECTION HEADER — scroll reveal
// =============================================================================

const SectionHeader = ({ tag, title, subtitle }: { tag: string; title: string; subtitle: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            className="mb-12 flex flex-col lg:mb-16 lg:items-center lg:text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            <motion.span
                className="text-sm font-semibold text-brand-600"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                {tag}
            </motion.span>
            <h2 className="mt-2 text-display-xs font-semibold text-gray-900 md:text-display-md">{title}</h2>
            <p className="mt-3 max-w-xl text-md text-gray-500 md:mt-5 md:text-lg">{subtitle}</p>
        </motion.div>
    );
};

// =============================================================================
// MAIN BENTO SECTION
// =============================================================================

export const BentoSection = () => {
    return (
        <section className="relative bg-primary py-16 lg:py-24">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <SectionHeader
                    tag="Fonctionnalités"
                    title="Tout ce dont vous avez besoin"
                    subtitle="Un seul outil pour suivre vos dépenses, gérer votre budget et faire grandir votre patrimoine."
                />

                {/* Bento Grid */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-6 lg:grid-cols-12">

                    {/* CARD 1 — Solde hero (dark, 7 cols) */}
                    <BentoCard dark glow="lime" className="p-8 md:col-span-4 lg:col-span-7" index={0}>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#BEFF00]/60">Solde disponible</p>
                        <div className="mt-3 flex items-baseline gap-1">
                            <span className="font-mono text-5xl font-bold tracking-tighter text-white lg:text-6xl">
                                <CountUp value={1247} />
                            </span>
                            <span className="font-mono text-2xl font-bold text-gray-600 lg:text-3xl">,50 €</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">12 jours restants ce mois</p>

                        <div className="mt-8 flex items-center gap-4">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ background: "linear-gradient(90deg, #BEFF00, #8CBF00)" }}
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "62%" }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                                />
                            </div>
                            <DonutChart />
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            <span className="rounded-full bg-[#BEFF00]/10 px-2.5 py-1 font-mono text-xs font-semibold text-[#BEFF00]">+320 € ce mois</span>
                            <span className="text-xs text-gray-600">vs mois dernier</span>
                        </div>
                    </BentoCard>

                    {/* CARD 2 — Patrimoine + Chart (light, 5 cols) */}
                    <BentoCard className="flex flex-col justify-between p-8 md:col-span-2 lg:col-span-5" index={1}>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400">Patrimoine net</p>
                            <div className="mt-3 flex items-baseline gap-2.5">
                                <p className="font-mono text-3xl font-bold tracking-tight text-gray-900 lg:text-4xl">
                                    <CountUp value={48250} suffix=" €" />
                                </p>
                                <span className="rounded-full bg-[#BEFF00]/15 px-2 py-0.5 font-mono text-xs font-semibold text-[#5C7A00]">+2.3%</span>
                            </div>
                        </div>
                        <div className="mt-6 h-28 lg:h-32">
                            <AreaChart />
                        </div>
                        <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                            <span>Jan</span><span>Fév</span><span>Mar</span><span>Avr</span><span>Mai</span>
                        </div>
                    </BentoCard>

                    {/* CARD 3 — Enveloppes (light, 4 cols) */}
                    <BentoCard className="p-7 md:col-span-3 lg:col-span-4" index={2}>
                        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400">Enveloppes budget</p>
                        <div className="flex flex-col gap-4">
                            <EnvelopeRow emoji="🍔" name="Alimentation" spent={280} total={400} />
                            <EnvelopeRow emoji="🚇" name="Transport" spent={65} total={120} />
                            <EnvelopeRow emoji="🎮" name="Loisirs" spent={175} total={200} />
                            <EnvelopeRow emoji="👕" name="Vêtements" spent={45} total={100} />
                        </div>
                    </BentoCard>

                    {/* CARD 4 — Transactions (dark, 4 cols) */}
                    <BentoCard dark className="p-7 md:col-span-3 lg:col-span-4" index={3}>
                        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500">Transactions récentes</p>
                        <div className="flex flex-col divide-y divide-white/[0.04]">
                            <TxRow name="Carrefour Market" cat="Alimentation" amount="-47,32 €" />
                            <TxRow name="Salaire Mai" cat="Revenus" amount="+2 800 €" positive />
                            <TxRow name="Netflix" cat="Abonnement" amount="-13,99 €" />
                            <TxRow name="Virement reçu" cat="Épargne" amount="+150 €" positive />
                        </div>
                    </BentoCard>

                    {/* CARD 5 — Dépenses bar chart (dark, 4 cols) */}
                    <BentoCard dark glow="amber" className="flex flex-col p-7 md:col-span-6 lg:col-span-4" index={4}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500">Dépenses du mois</p>
                                <p className="mt-2 font-mono text-2xl font-bold text-white"><CountUp value={1847} suffix=" €" /></p>
                            </div>
                            <span className="rounded-full bg-white/[0.04] px-2.5 py-1 font-mono text-xs text-gray-500 ring-1 ring-white/[0.06]">Mai 2026</span>
                        </div>
                        <div className="mt-6 h-24 flex-1">
                            <BarChart />
                        </div>
                        <div className="mt-2 flex justify-between text-[10px] text-gray-600">
                            <span>1</span><span>8</span><span>15</span><span>22</span><span>31</span>
                        </div>
                    </BentoCard>

                    {/* CARD 6 — 350+ banques (dark, 5 cols) */}
                    <BentoCard dark className="flex flex-col justify-between p-8 md:col-span-3 lg:col-span-5" index={5}>
                        <div className="flex size-12 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06]">
                            <svg className="size-6 text-[#BEFF00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <div className="mt-8">
                            <p className="font-mono text-5xl font-bold tracking-tighter text-white">
                                <CountUp value={350} /><span className="text-[#BEFF00]">+</span>
                            </p>
                            <p className="mt-2 text-lg font-semibold text-gray-200">banques compatibles</p>
                            <p className="mt-2 text-sm leading-relaxed text-gray-500">BNP Paribas, Société Générale, Boursorama, N26, Revolut, Crédit Agricole...</p>
                        </div>
                    </BentoCard>

                    {/* CARD 7 — 100% gratuit (light, 7 cols) */}
                    <BentoCard className="p-8 md:col-span-3 lg:col-span-7" index={6}>
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                            <div className="max-w-sm">
                                <p className="font-mono text-5xl font-bold tracking-tighter text-[#5C7A00]">100%</p>
                                <p className="mt-2 text-xl font-semibold text-gray-900">Gratuit, pour toujours</p>
                                <p className="mt-3 text-sm leading-relaxed text-gray-500">
                                    Pas de version premium, pas de publicité, pas de revente de données. Oyko est un outil personnel, pas un produit financier.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 sm:pt-1">
                                {[
                                    { icon: "🔐", label: "Chiffrement AES-256" },
                                    { icon: "🇫🇷", label: "Hébergé en France" },
                                    { icon: "✓", label: "Conforme RGPD" },
                                    { icon: "↗", label: "Export à tout moment" },
                                ].map((badge) => (
                                    <div key={badge.label} className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3.5 py-2 ring-1 ring-gray-100 transition-colors duration-200 hover:bg-gray-100">
                                        <span className="text-sm">{badge.icon}</span>
                                        <span className="text-sm text-gray-700">{badge.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BentoCard>

                </div>
            </div>
        </section>
    );
};
