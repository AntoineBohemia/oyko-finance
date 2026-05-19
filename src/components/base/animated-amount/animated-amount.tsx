"use client";

import NumberFlow from "@number-flow/react";
import { cx } from "@/utils/cx";

/**
 * Oyko AnimatedAmount — Morphing number transitions for financial amounts.
 * Uses @number-flow/react for smooth digit-by-digit animation.
 * Always rendered in Geist Mono with tabular-nums.
 */

interface AnimatedAmountProps {
    /** The numeric value to display */
    value: number;
    /** CSS class name */
    className?: string;
    /** Whether to show the + sign for positive values */
    showSign?: boolean;
    /** Whether this is a gain (lime) or loss (anthracite) or neutral */
    variant?: "gain" | "loss" | "neutral" | "default";
}

const variantClasses = {
    gain: "text-[#608B00]",      // lime-700 (accessible on light)
    loss: "text-gray-600",        // stone-600 (neutral, non-judgmental)
    neutral: "text-gray-500",     // stone-500
    default: "text-gray-900",     // anthracite
};

export function AnimatedAmount({
    value,
    className,
    showSign = false,
    variant = "default",
}: AnimatedAmountProps) {
    const prefix = showSign && value > 0 ? "+" : showSign && value < 0 ? "−" : "";
    const displayValue = showSign ? Math.abs(value) : value;

    return (
        <span className={cx("font-mono tabular-nums", variantClasses[variant], className)}>
            {prefix}
            <NumberFlow
                value={displayValue}
                format={{
                    style: "currency",
                    currency: "EUR",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }}
                locales="fr-FR"
            />
        </span>
    );
}
