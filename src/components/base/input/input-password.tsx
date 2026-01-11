"use client";

import { type ComponentType, type HTMLAttributes, type ReactNode, type Ref, useState } from "react";
import { Eye, EyeOff } from "@untitledui/icons";
import type { TextFieldProps as AriaTextFieldProps } from "react-aria-components";
import { Group as AriaGroup, Input as AriaInput, TextField as AriaTextField } from "react-aria-components";
import { HintText } from "@/components/base/input/hint-text";
import { Label } from "@/components/base/input/label";
import { cx, sortCx } from "@/utils/cx";

interface PasswordInputProps extends Omit<AriaTextFieldProps, "type"> {
    /** Label text for the input */
    label?: string;
    /** Helper text displayed below the input */
    hint?: ReactNode;
    /** Whether to hide required indicator from label */
    hideRequiredIndicator?: boolean;
    /**
     * Input size.
     * @default "sm"
     */
    size?: "sm" | "md";
    /** Placeholder text. */
    placeholder?: string;
    /** Class name for the icon. */
    iconClassName?: string;
    /** Class name for the input. */
    inputClassName?: string;
    /** Class name for the input wrapper. */
    wrapperClassName?: string;
    /** Icon component to display on the left side of the input. */
    icon?: ComponentType<HTMLAttributes<HTMLOrSVGElement>>;
    ref?: Ref<HTMLInputElement>;
    groupRef?: Ref<HTMLDivElement>;
}

export const PasswordInput = ({
    size = "sm",
    placeholder,
    icon: Icon,
    label,
    hint,
    hideRequiredIndicator,
    className,
    ref,
    groupRef,
    iconClassName,
    inputClassName,
    wrapperClassName,
    ...props
}: PasswordInputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    const hasLeadingIcon = Icon;

    const sizes = sortCx({
        sm: {
            root: cx("px-3 py-2 pr-10", hasLeadingIcon && "pl-10"),
            iconLeading: "left-3",
            iconTrailing: "right-3",
        },
        md: {
            root: cx("px-3.5 py-2.5 pr-10.5", hasLeadingIcon && "pl-10.5"),
            iconLeading: "left-3.5",
            iconTrailing: "right-3.5",
        },
    });

    return (
        <AriaTextField aria-label={!label ? placeholder : undefined} {...props} className={className}>
            {({ isRequired, isInvalid, isDisabled }) => (
                <div className="group flex h-max w-full flex-col items-start justify-start gap-1.5">
                    {label && <Label isRequired={hideRequiredIndicator ? !hideRequiredIndicator : isRequired}>{label}</Label>}

                    <AriaGroup
                        isDisabled={isDisabled}
                        isInvalid={isInvalid}
                        ref={groupRef}
                        className={({ isFocusWithin, isDisabled, isInvalid }) =>
                            cx(
                                "relative flex w-full flex-row place-content-center place-items-center rounded-lg bg-primary shadow-xs ring-1 ring-primary transition-shadow duration-100 ease-linear ring-inset",
                                isFocusWithin && !isDisabled && "ring-2 ring-brand",
                                isDisabled && "cursor-not-allowed bg-disabled_subtle ring-disabled",
                                isInvalid && "ring-error_subtle",
                                isInvalid && isFocusWithin && "ring-2 ring-error",
                                wrapperClassName,
                            )
                        }
                    >
                        {/* Leading icon */}
                        {Icon && (
                            <Icon
                                className={cx(
                                    "pointer-events-none absolute size-5 text-fg-quaternary",
                                    isDisabled && "text-fg-disabled",
                                    sizes[size].iconLeading,
                                    iconClassName,
                                )}
                            />
                        )}

                        {/* Input field */}
                        <AriaInput
                            ref={ref}
                            type={showPassword ? "text" : "password"}
                            placeholder={placeholder}
                            className={cx(
                                "m-0 w-full bg-transparent text-md text-primary ring-0 outline-hidden placeholder:text-placeholder autofill:rounded-lg autofill:text-primary",
                                isDisabled && "cursor-not-allowed text-disabled",
                                sizes[size].root,
                                inputClassName,
                            )}
                        />

                        {/* Toggle visibility button */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={cx(
                                "absolute flex items-center justify-center text-fg-quaternary transition-colors duration-150 hover:text-fg-secondary focus:outline-none",
                                sizes[size].iconTrailing,
                                isDisabled && "pointer-events-none text-fg-disabled",
                            )}
                            tabIndex={-1}
                            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                        </button>
                    </AriaGroup>

                    {hint && <HintText isInvalid={isInvalid}>{hint}</HintText>}
                </div>
            )}
        </AriaTextField>
    );
};

PasswordInput.displayName = "PasswordInput";
