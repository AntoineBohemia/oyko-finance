"use client";

import { motion } from "motion/react";
import { cx } from "@/utils/cx";

/**
 * GradientBackground — Oyko identity
 * Subtle warm stone + lime tints on pierre background
 */

type GradientVariant = "mesh" | "radial" | "linear" | "aurora";

interface GradientBackgroundProps {
    variant?: GradientVariant;
    noise?: boolean;
    noiseOpacity?: number;
    className?: string;
    children?: React.ReactNode;
}

const NoiseSvg = ({ opacity = 0.03 }: { opacity?: number }) => (
    <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" style={{ opacity }} aria-hidden="true">
        <filter id="noise-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-filter)" />
    </svg>
);

/* Mesh: subtle lime tint top-left + warm stone top-right — breathing + drift */
const MeshGradient = () => (
    <>
        <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
                background: "radial-gradient(ellipse 80% 60% at 0% 0%, rgba(190,255,0,0.18), transparent 55%)",
            }}
            animate={{
                scale: [1, 1.08, 1],
                opacity: [1, 0.7, 1],
                x: [0, 15, -10, 0],
                y: [0, -10, 8, 0],
            }}
            transition={{
                scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                x: { duration: 20, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 20, repeat: Infinity, ease: "easeInOut" },
            }}
            aria-hidden="true"
        />
        <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
                background: "radial-gradient(ellipse 60% 50% at 100% 10%, rgba(190,255,0,0.12), transparent 50%)",
            }}
            animate={{
                scale: [1, 1.08, 1],
                opacity: [1, 0.7, 1],
                x: [0, -10, 15, 0],
                y: [0, 8, -10, 0],
            }}
            transition={{
                scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                x: { duration: 25, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 25, repeat: Infinity, ease: "easeInOut" },
            }}
            aria-hidden="true"
        />
    </>
);

/* Radial: centered lime glow */
const RadialGradient = () => (
    <div
        className="pointer-events-none absolute inset-0"
        style={{
            background: "radial-gradient(ellipse at center, rgba(190,255,0,0.06) 0%, transparent 70%)",
        }}
        aria-hidden="true"
    />
);

/* Linear: warm stone diagonal */
const LinearGradient = () => (
    <div
        className="pointer-events-none absolute inset-0"
        style={{
            background: "linear-gradient(to bottom right, rgba(245,243,239,0.7), transparent 50%, rgba(250,255,228,0.15))",
        }}
        aria-hidden="true"
    />
);

/* Aurora: very subtle conic with lime + stone */
const AuroraGradient = () => (
    <div
        className="pointer-events-none absolute inset-0 blur-[100px]"
        style={{
            background:
                "conic-gradient(from 230.29deg at 51.63% 52.16%, rgba(190,255,0,0.06) 0deg, rgba(214,211,209,0.08) 67.5deg, rgba(190,255,0,0.06) 198.75deg, rgba(214,211,209,0.08) 251.25deg, rgba(190,255,0,0.06) 301.88deg, rgba(214,211,209,0.06) 360deg)",
        }}
        aria-hidden="true"
    />
);

const GradientComponents: Record<GradientVariant, React.FC> = {
    mesh: MeshGradient,
    radial: RadialGradient,
    linear: LinearGradient,
    aurora: AuroraGradient,
};

export const GradientBackground = ({ variant = "mesh", noise = true, noiseOpacity = 0.02, className, children }: GradientBackgroundProps) => {
    const Gradient = GradientComponents[variant];

    return (
        <div className={cx("relative overflow-hidden bg-primary", className)}>
            <Gradient />
            {noise && <NoiseSvg opacity={noiseOpacity} />}
            <div className="relative z-[2]">{children}</div>
        </div>
    );
};
