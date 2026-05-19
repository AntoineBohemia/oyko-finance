"use client";

import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cx } from "@/utils/cx";

/**
 * Oyko Card — Flat + border fine + rounded-lg
 * No shadows, no gradients, no skeuomorphism.
 * The content creates the hierarchy.
 */

const cardVariants = cva("relative overflow-hidden rounded-lg border border-[#E5E2DC] bg-white transition-all duration-200", {
    variants: {
        variant: {
            default: "",
            flat: "border-0 bg-transparent p-0",
            elevated: "shadow-sm",
            subtle: "border-[#E5E2DC]/60",
        },
        size: {
            sm: "p-4",
            default: "p-6",
            lg: "p-8",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});

// ============================================================================
// Card Root
// ============================================================================

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
    /** @deprecated No highlight in Oyko identity */
    noHighlight?: boolean;
    /** @deprecated Use className instead */
    wrapperClassName?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, variant, size, children, noHighlight: _, wrapperClassName: __, ...props }, ref) => {
    return (
        <div ref={ref} className={cx(cardVariants({ variant, size }), className)} {...props}>
            {children}
        </div>
    );
});
Card.displayName = "Card";

// ============================================================================
// Card Header
// ============================================================================

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cx("flex flex-col space-y-1.5", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

// ============================================================================
// Card Title
// ============================================================================

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
    <h3 ref={ref} className={cx("font-display text-lg font-semibold leading-none tracking-tight text-gray-900", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

// ============================================================================
// Card Description
// ============================================================================

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
    <p ref={ref} className={cx("text-sm text-gray-500", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

// ============================================================================
// Card Content
// ============================================================================

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cx("pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// ============================================================================
// Card Footer
// ============================================================================

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cx("flex items-center pt-4", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

// ============================================================================
// Exports — keep backward compatibility
// ============================================================================

const cardWrapperVariants = cardVariants;
const cardContentVariants = cardVariants;

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardWrapperVariants, cardContentVariants };
