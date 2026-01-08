"use client";

import { cx } from "@/utils/cx";
import { useCarousel } from "./carousel-base";

interface CarouselIndicatorProps {
    /** The size of the carousel indicator. */
    size?: "md" | "lg";
    /** Whether the indicator uses brand colors. */
    isBrand?: boolean;
    /** Whether the indicator is displayed in a framed container. */
    framed?: boolean;
    /** Additional class name for the root element. */
    className?: string;
}

export const CarouselIndicator = ({ framed, className, size = "md", isBrand }: CarouselIndicatorProps) => {
    const { scrollSnaps, selectedIndex, api } = useCarousel();

    const sizes = {
        md: {
            root: cx("gap-3", framed && "p-2"),
            button: "h-2 w-2 after:-inset-x-1.5 after:-inset-y-2",
        },
        lg: {
            root: cx("gap-4", framed && "p-3"),
            button: "h-2.5 w-2.5 after:-inset-x-2 after:-inset-y-3",
        },
    };

    const handleClick = (index: number) => {
        api?.scrollTo(index);
    };

    return (
        <nav
            className={cx(
                "flex h-max w-max",
                sizes[size].root,
                framed && "rounded-full bg-alpha-white/90 backdrop-blur",
                className,
            )}
        >
            {scrollSnaps.map((_, index) => (
                <button
                    key={index}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={selectedIndex === index ? "true" : undefined}
                    onClick={() => handleClick(index)}
                    className={cx(
                        "relative cursor-pointer rounded-full bg-quaternary outline-focus-ring after:absolute focus-visible:outline-2 focus-visible:outline-offset-2",
                        sizes[size].button,
                        selectedIndex === index && "bg-fg-brand-primary_alt",
                        isBrand && "bg-fg-brand-secondary",
                        isBrand && selectedIndex === index && "bg-fg-white",
                    )}
                />
            ))}
        </nav>
    );
};
