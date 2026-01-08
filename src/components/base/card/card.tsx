"use client";

import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cx } from "@/utils/cx";

const cardWrapperVariants = cva("relative rounded-[40px] p-3.5 transition-all duration-200", {
    variants: {
        variant: {
            default: [
                "bg-gradient-to-b from-muted/50 to-muted/60",
                "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.4)_inset]",
                "dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)_inset]",
            ],
            flat: ["bg-transparent", "p-0"],
            elevated: [
                "bg-gradient-to-b from-muted/60 to-muted/70",
                "shadow-[0_35px_60px_-15px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.5)_inset]",
                "dark:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)_inset]",
            ],
            subtle: [
                "bg-gradient-to-b from-muted/30 to-muted/40",
                "shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.3)_inset]",
                "dark:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.03)_inset]",
            ],
        },
        size: {
            sm: "p-2 rounded-[28px]",
            default: "p-3.5 rounded-[40px]",
            lg: "p-5 rounded-[48px]",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});

const cardContentVariants = cva("relative overflow-hidden bg-card transition-all duration-200", {
    variants: {
        variant: {
            default: [
                "shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)]",
                "dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.05)]",
            ],
            flat: ["shadow-none", "border border-border"],
            elevated: [
                "shadow-[0_4px_12px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)]",
                "dark:shadow-[0_4px_12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.06)]",
            ],
            subtle: [
                "shadow-[0_1px_4px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.03)]",
                "dark:shadow-[0_1px_4px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.04)]",
            ],
        },
        size: {
            sm: "rounded-[20px] p-4",
            default: "rounded-[28px] p-7",
            lg: "rounded-[36px] p-9",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});

// ============================================================================
// Card Root (Wrapper)
// ============================================================================

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardWrapperVariants> {
    /** Disable the inner highlight effect */
    noHighlight?: boolean;
    /** Custom wrapper className */
    wrapperClassName?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, wrapperClassName, variant, size, noHighlight = false, children, ...props }, ref) => {
    // For flat variant, skip the wrapper entirely
    if (variant === "flat") {
        return (
            <div ref={ref} className={cx(cardContentVariants({ variant, size }), className)} {...props}>
                {children}
            </div>
        );
    }

    return (
        <div className={cx(cardWrapperVariants({ variant, size }), wrapperClassName)}>
            {/* Inner highlight effect */}
            {!noHighlight && (
                <div
                    className="from-background/60 dark:from-background/30 pointer-events-none absolute inset-[1px] rounded-[inherit] bg-gradient-to-b to-transparent"
                    style={{ height: "50%", borderRadius: "inherit" }}
                    aria-hidden="true"
                />
            )}

            <div ref={ref} className={cx(cardContentVariants({ variant, size }), className)} {...props}>
                {children}
            </div>
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
    <h3 ref={ref} className={cx("text-card-foreground text-2xl leading-none font-semibold tracking-tight", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

// ============================================================================
// Card Description
// ============================================================================

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
    <p ref={ref} className={cx("text-muted-foreground text-sm", className)} {...props} />
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
// Exports
// ============================================================================

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardWrapperVariants, cardContentVariants };
