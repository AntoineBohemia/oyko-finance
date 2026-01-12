"use client";

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, DetailedHTMLProps, FC, ReactNode } from "react";
import { isValidElement } from "react";
import type { Placement } from "react-aria";
import type { ButtonProps as AriaButtonProps } from "react-aria-components";
import { Button as AriaButton, Link as AriaLink } from "react-aria-components";
import { Tooltip } from "@/components/base/tooltip/tooltip";
import { cx } from "@/utils/cx";
import { isReactComponent } from "@/utils/is-react-component";

export const styles = {
    secondary:
        "bg-primary text-fg-quaternary shadow-xs-skeumorphic ring-1 ring-primary ring-inset hover:bg-primary_hover hover:text-fg-quaternary_hover disabled:shadow-xs disabled:ring-disabled_subtle",
    tertiary: "text-fg-quaternary hover:bg-primary_hover hover:text-fg-quaternary_hover",
};

/**
 * Common props shared between button and anchor variants
 */
export interface CommonProps {
    /** Disables the button and shows a disabled state */
    isDisabled?: boolean;
    /** The size variant of the button */
    size?: "xs" | "sm" | "md";
    /** The color variant of the button */
    color?: "secondary" | "tertiary";
    /** The icon to display in the button */
    icon?: FC<{ className?: string }> | ReactNode;
    /** The tooltip to display when hovering over the button */
    tooltip?: string;
    /** The placement of the tooltip */
    tooltipPlacement?: Placement;
}

/**
 * Props for the button variant (non-link)
 */
export interface ButtonProps extends CommonProps, DetailedHTMLProps<Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color" | "slot">, HTMLButtonElement> {
    /** Slot name for react-aria component */
    slot?: AriaButtonProps["slot"];
}

/**
 * Props for the link variant (anchor tag)
 */
interface LinkProps extends CommonProps, DetailedHTMLProps<Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color">, HTMLAnchorElement> {}

/** Union type of button and link props */
export type Props = ButtonProps | LinkProps;

export const ButtonUtility = ({
    tooltip,
    className,
    isDisabled,
    icon: Icon,
    size = "sm",
    color = "secondary",
    tooltipPlacement = "top",
    ...otherProps
}: Props) => {
    const href = "href" in otherProps ? otherProps.href : undefined;
    const Component = href ? AriaLink : AriaButton;

    let props = {};

    if (href) {
        props = {
            ...otherProps,

            href: isDisabled ? undefined : href,

            // Since anchor elements do not support the `disabled` attribute and state,
            // we need to specify `data-rac` and `data-disabled` in order to be able
            // to use the `disabled:` selector in classes.
            ...(isDisabled ? { "data-rac": true, "data-disabled": true } : {}),
        };
    } else {
        props = {
            ...otherProps,

            type: otherProps.type || "button",
            isDisabled,
        };
    }

    const content = (
        <Component
            aria-label={tooltip}
            {...props}
            className={cx(
                "group relative inline-flex h-max cursor-pointer items-center justify-center rounded-md outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:text-fg-disabled_subtle",
                styles[color],

                // Size styles
                size === "xs" && "p-1.5",
                size === "sm" && "p-1.5",
                size === "md" && "p-2",

                // Icon styles
                "*:data-icon:pointer-events-none *:data-icon:shrink-0 *:data-icon:text-current *:data-icon:transition-inherit-all",
                size === "xs" && "*:data-icon:size-4",
                size === "sm" && "*:data-icon:size-5",
                size === "md" && "*:data-icon:size-6",

                className,
            )}
        >
            {isReactComponent(Icon) && <Icon data-icon />}
            {isValidElement(Icon) && Icon}
        </Component>
    );

    if (tooltip) {
        return (
            <Tooltip title={tooltip} placement={tooltipPlacement} isDisabled={isDisabled} offset={size === "xs" ? 4 : size === "sm" ? 6 : 8}>
                {content}
            </Tooltip>
        );
    }

    return content;
};
