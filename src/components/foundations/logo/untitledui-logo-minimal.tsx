"use client";

import type { SVGProps } from "react";
import { cx } from "@/utils/cx";

export const UntitledLogoMinimal = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg
            viewBox="0 0 40 48"
            fill="none"
            {...props}
            className={cx("h-8 w-auto", props.className)}
        >
            {/* Big octagon with diamond cutout - Oyko icon */}
            <path
                d="m27.6627 4h-15.3253l-12.3374 12.3373v15.3253l12.3374 12.3374h15.3253l12.3373-12.3374v-15.3253zm-13.2049 27.8554-7.90357-7.9036 7.90357-7.9036c2.988-2.988 7.9037-2.988 10.8916 0l7.9036 7.9036-7.9036 7.9036c-2.9879 2.988-7.8072 2.988-10.8916 0z"
                className="fill-fg-primary"
            />
        </svg>
    );
};
