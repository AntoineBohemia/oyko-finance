"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Oyko Stagger List — Items appear in cascade.
 * Wrap a list of items to get staggered entrance animation.
 * Each child appears 50ms after the previous one.
 */

export function StaggerList({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.05 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
