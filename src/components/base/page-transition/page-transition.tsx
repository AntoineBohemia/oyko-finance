"use client";

import { motion, type Transition } from "motion/react";
import type { ReactNode } from "react";

/**
 * Oyko Page Transition — Fade + subtle scale
 * Wrap page content to get a smooth entrance animation.
 * Uses scale 0.98→1 for a "breathing" effect.
 */

const pageTransition: Transition = {
    duration: 0.25,
    ease: [0.25, 0.1, 0.25, 1],
};

export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={pageTransition}
            className={className}
        >
            {children}
        </motion.div>
    );
}
