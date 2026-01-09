"use client";

import { cx } from "@/utils/cx";

/**
 * GradientBackground - Fond avec gradient subtil et effet grain
 */

type GradientVariant = "mesh" | "radial" | "linear" | "aurora";

interface GradientBackgroundProps {
    variant?: GradientVariant;
    noise?: boolean;
    noiseOpacity?: number;
    className?: string;
    children?: React.ReactNode;
}

// =============================================================================
// NOISE SVG
// =============================================================================

const NoiseSvg = ({ opacity = 0.03 }: { opacity?: number }) => (
    <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" style={{ opacity }} aria-hidden="true">
        <filter id="noise-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-filter)" />
    </svg>
);

// =============================================================================
// GRADIENT BLOBS - Composants réels au lieu de pseudo-éléments
// =============================================================================

const MeshGradient = () => (
    <>
        {/* Blob en haut à gauche - brand-200 */}
        <div
            className="pointer-events-none absolute inset-0"
            style={{
                background: "radial-gradient(ellipse 80% 60% at 0% 0%, rgba(233,215,254,0.5), transparent 50%)",
            }}
            aria-hidden="true"
        />
        {/* Blob en haut à droite - brand-100 */}
        <div
            className="pointer-events-none absolute inset-0"
            style={{
                background: "radial-gradient(ellipse 60% 50% at 100% 10%, rgba(244,235,255,0.4), transparent 45%)",
            }}
            aria-hidden="true"
        />
    </>
);

const MeshGradientDark = () => (
    <>
        {/* Blob en haut à gauche - brand-900 */}
        <div
            className="pointer-events-none absolute inset-0"
            style={{
                background: "radial-gradient(ellipse 80% 60% at 0% 0%, rgba(105,65,198,0.25), transparent 50%)",
            }}
            aria-hidden="true"
        />
        {/* Blob en haut à droite - brand-800 */}
        <div
            className="pointer-events-none absolute inset-0"
            style={{
                background: "radial-gradient(ellipse 60% 50% at 100% 10%, rgba(127,86,217,0.2), transparent 45%)",
            }}
            aria-hidden="true"
        />
    </>
);

const RadialGradient = () => (
    <div
        className="pointer-events-none absolute inset-0"
        style={{
            background: "radial-gradient(ellipse at center, rgba(158,119,237,0.15) 0%, transparent 70%)",
        }}
        aria-hidden="true"
    />
);

const RadialGradientDark = () => (
    <div
        className="pointer-events-none absolute inset-0"
        style={{
            background: "radial-gradient(ellipse at center, rgba(127,86,217,0.25) 0%, transparent 70%)",
        }}
        aria-hidden="true"
    />
);

const LinearGradient = () => (
    <div
        className="pointer-events-none absolute inset-0"
        style={{
            background: "linear-gradient(to bottom right, rgba(249,245,255,0.7), transparent 50%, rgba(239,246,255,0.5))",
        }}
        aria-hidden="true"
    />
);

const AuroraGradient = () => (
    <div
        className="pointer-events-none absolute inset-0 blur-[100px]"
        style={{
            background:
                "conic-gradient(from 230.29deg at 51.63% 52.16%, rgba(158,119,237,0.15) 0deg, rgba(59,130,246,0.08) 67.5deg, rgba(139,92,246,0.15) 198.75deg, rgba(59,130,246,0.08) 251.25deg, rgba(158,119,237,0.15) 301.88deg, rgba(139,92,246,0.08) 360deg)",
        }}
        aria-hidden="true"
    />
);

// =============================================================================
// GRADIENT COMPONENT MAP
// =============================================================================

const GradientComponents: Record<GradientVariant, { light: React.FC; dark: React.FC }> = {
    mesh: { light: MeshGradient, dark: MeshGradientDark },
    radial: { light: RadialGradient, dark: RadialGradientDark },
    linear: { light: LinearGradient, dark: LinearGradient },
    aurora: { light: AuroraGradient, dark: AuroraGradient },
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const GradientBackground = ({ variant = "mesh", noise = true, noiseOpacity = 0.02, className, children }: GradientBackgroundProps) => {
    const { light: LightGradient, dark: DarkGradient } = GradientComponents[variant];

    return (
        <div className={cx("relative overflow-hidden bg-primary", className)}>
            {/* Gradients - light mode */}
            <div className="dark:hidden">
                <LightGradient />
            </div>
            {/* Gradients - dark mode */}
            <div className="hidden dark:block">
                <DarkGradient />
            </div>
            {/* Noise overlay */}
            {noise && <NoiseSvg opacity={noiseOpacity} />}
            {/* Content */}
            <div className="relative z-[2]">{children}</div>
        </div>
    );
};

// =============================================================================
// USAGE EXAMPLES (commentés pour référence)
// =============================================================================

/*
// 1. Utilisation basique sur toute la page
<GradientBackground variant="mesh" noise>
    <Header />
    <main>...</main>
    <Footer />
</GradientBackground>

// 2. Seulement sur le hero
<GradientBackground variant="aurora" noiseOpacity={0.02} className="min-h-screen">
    <HeroSection />
</GradientBackground>

// 3. Sans noise
<GradientBackground variant="radial" noise={false}>
    ...
</GradientBackground>

// 4. Personnalisation des couleurs via className
<GradientBackground 
    variant="linear" 
    className="before:from-amber-50/50 before:to-rose-50/30"
>
    ...
</GradientBackground>

// 5. Composant wrapper réutilisable pour ton projet
export const PageWrapper = ({ children }) => (
    <GradientBackground variant="mesh" noise noiseOpacity={0.025}>
        {children}
    </GradientBackground>
);
*/
