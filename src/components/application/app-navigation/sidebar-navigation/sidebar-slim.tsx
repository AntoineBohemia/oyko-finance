"use client";

import type { FC } from "react";
import { useState } from "react";
import { LogOut01, Settings01 } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { Button as AriaButton, DialogTrigger as AriaDialogTrigger, Popover as AriaPopover } from "react-aria-components";
import { Avatar } from "@/components/base/avatar/avatar";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
import { Button } from "@/components/base/buttons/button";
import { UntitledLogoMinimal } from "@/components/foundations/logo/untitledui-logo-minimal";
import { useAuth } from "@/hooks/use-auth";
import { cx } from "@/utils/cx";
import { MobileNavigationHeader } from "../base-components/mobile-header";
import { NavAccountMenu } from "../base-components/nav-account-card";
import { NavItemBase } from "../base-components/nav-item";
import { NavList } from "../base-components/nav-list";
import type { NavItemType } from "../config";

/**
 * Oyko Sidebar — Dark permanent (anthracite #1C1917)
 * Active state: lime indicator bar + lime icon
 * Inactive: stone-500 icons
 */

interface SidebarNavigationSlimProps {
    activeUrl?: string;
    items: (NavItemType & { icon: FC<{ className?: string }> })[];
    footerItems?: (NavItemType & { icon: FC<{ className?: string }> })[];
    hideBorder?: boolean;
    hideRightBorder?: boolean;
}

// Dark sidebar nav button
const SidebarNavButton = ({
    icon: Icon,
    label,
    href,
    current,
    hasNotification,
    onClick,
}: {
    icon: FC<{ className?: string }>;
    label: string;
    href?: string;
    current?: boolean;
    hasNotification?: boolean;
    onClick?: () => void;
}) => {
    return (
        <Link
            href={href || "/"}
            aria-label={label}
            title={label}
            onClick={onClick}
            className={cx(
                "relative flex w-full cursor-pointer items-center justify-center rounded-lg p-2.5 transition duration-150 ease-out select-none",
                current
                    ? "text-[#BEFF00]"
                    : "text-gray-500 hover:text-gray-300",
            )}
        >
            {/* Active indicator — lime bar on left */}
            {current && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#BEFF00]" />
            )}
            <Icon aria-hidden="true" className="size-5 shrink-0 transition-colors duration-150" />
            {hasNotification && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#BEFF00]" />
            )}
        </Link>
    );
};

export const SidebarNavigationSlim = ({ activeUrl, items, footerItems = [], hideBorder, hideRightBorder }: SidebarNavigationSlimProps) => {
    const { logout } = useAuth();
    const [hoveredItem, setHoveredItem] = useState<(typeof items)[number] | null>(null);
    const [isHovering, setIsHovering] = useState(false);

    const isActive = (item: (typeof items)[number]) =>
        activeUrl === item.href || activeUrl?.startsWith(item.href + "/") || item.items?.some((sub) => sub.href === activeUrl);

    const secondarySource = hoveredItem && hoveredItem.items?.length ? hoveredItem : null;
    const isSecondarySidebarVisible = isHovering && Boolean(secondarySource);

    const MAIN_SIDEBAR_WIDTH = 68;
    const SECONDARY_SIDEBAR_WIDTH = 268;

    const mainSidebar = (
        <aside
            style={{ width: MAIN_SIDEBAR_WIDTH }}
            className="group flex h-full max-h-full max-w-full overflow-y-auto"
        >
            <div className="flex w-full flex-col items-center justify-between bg-gray-900 py-5">
                {/* Logo */}
                <div className="flex justify-center px-3">
                    <UntitledLogoMinimal className="size-8 text-white" />
                </div>

                {/* Nav items */}
                <ul className="mt-6 flex flex-col gap-1 px-2">
                    {items.map((item) => (
                        <li
                            key={item.label}
                            onPointerEnter={() => setHoveredItem(item)}
                        >
                            <SidebarNavButton
                                current={isActive(item)}
                                href={item.href}
                                label={item.label || ""}
                                icon={item.icon}
                                hasNotification={item.hasNotification}
                            />
                        </li>
                    ))}
                </ul>

                {/* Footer */}
                <div className="mt-auto flex flex-col items-center gap-3 px-2 pb-2">
                    {footerItems.map((item) => (
                        <SidebarNavButton
                            key={item.label}
                            current={isActive(item)}
                            label={item.label || ""}
                            href={item.href}
                            icon={item.icon}
                            hasNotification={item.hasNotification}
                        />
                    ))}

                    <AriaDialogTrigger>
                        <AriaButton
                            className={({ isPressed, isFocused }) =>
                                cx("group relative inline-flex rounded-full ring-offset-gray-900", (isPressed || isFocused) && "outline-2 outline-offset-2 outline-[#BEFF00]")
                            }
                        >
                            <Avatar status="online" size="md" alt="Antoine Moulin" initials="AM" />
                        </AriaButton>
                        <AriaPopover
                            placement="right bottom"
                            offset={8}
                            crossOffset={6}
                            className={({ isEntering, isExiting }) =>
                                cx(
                                    "will-change-transform",
                                    isEntering &&
                                        "duration-300 ease-out animate-in fade-in placement-right:slide-in-from-left-2 placement-top:slide-in-from-bottom-2 placement-bottom:slide-in-from-top-2",
                                    isExiting &&
                                        "duration-150 ease-in animate-out fade-out placement-right:slide-out-to-left-2 placement-top:slide-out-to-bottom-2 placement-bottom:slide-out-to-top-2",
                                )
                            }
                        >
                            <NavAccountMenu />
                        </AriaPopover>
                    </AriaDialogTrigger>
                </div>
            </div>
        </aside>
    );

    const secondarySidebar = (
        <AnimatePresence initial={false}>
            {isSecondarySidebarVisible && (
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: SECONDARY_SIDEBAR_WIDTH }}
                    exit={{ width: 0 }}
                    transition={{ type: "spring", damping: 26, stiffness: 220, bounce: 0 }}
                    className={cx(
                        "relative h-full overflow-x-hidden overflow-y-auto bg-white",
                        !(hideBorder || hideRightBorder) && "box-content border-r border-[#E5E2DC]",
                    )}
                >
                    <div style={{ width: SECONDARY_SIDEBAR_WIDTH }} className="flex h-full flex-col px-4 pt-6">
                        <h3 className="font-display text-sm font-semibold text-gray-900">{secondarySource?.label}</h3>
                        <ul className="py-2">
                            {secondarySource?.items?.map((item) => (
                                <li key={item.label} className="py-0.5">
                                    <NavItemBase current={activeUrl === item.href} href={item.href} icon={item.icon} badge={item.badge} type="link">
                                        {item.label}
                                    </NavItemBase>
                                </li>
                            ))}
                        </ul>
                        <div className="sticky bottom-0 mt-auto flex justify-between border-t border-[#E5E2DC] bg-white px-2 py-5">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Antoine Moulin</p>
                                <p className="text-sm text-gray-500">antoine@oyko.space</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            {/* Desktop sidebar navigation */}
            <div
                className="z-50 hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex"
                onPointerEnter={() => setIsHovering(true)}
                onPointerLeave={() => setIsHovering(false)}
            >
                {mainSidebar}
                {secondarySidebar}
            </div>

            {/* Placeholder for fixed sidebar */}
            <div
                style={{ paddingLeft: MAIN_SIDEBAR_WIDTH }}
                className="invisible hidden lg:sticky lg:top-0 lg:bottom-0 lg:left-0 lg:block"
            />

            {/* Mobile header navigation */}
            <MobileNavigationHeader>
                <aside className="group flex h-full max-h-full w-full max-w-full flex-col justify-between overflow-y-auto bg-gray-900 pt-4">
                    <div className="px-4">
                        <UntitledLogoMinimal className="h-8 text-white" />
                    </div>

                    {/* Mobile nav items */}
                    <nav className="mt-6 flex-1 px-3">
                        <ul className="flex flex-col gap-1">
                            {items.map((item) => {
                                const Icon = item.icon;
                                const active = activeUrl === item.href || activeUrl?.startsWith(item.href + "/");
                                return (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href || "/"}
                                            className={cx(
                                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                                active
                                                    ? "text-[#BEFF00]"
                                                    : "text-gray-400 hover:text-gray-200",
                                            )}
                                        >
                                            <Icon className="size-5" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="mt-auto flex flex-col gap-5 px-3 py-4">
                        <div className="flex flex-col gap-1">
                            {footerItems.map((item) => {
                                const Icon = item.icon;
                                const active = activeUrl === item.href;
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href || "/"}
                                        className={cx(
                                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                            active ? "text-[#BEFF00]" : "text-gray-400 hover:text-gray-200",
                                        )}
                                    >
                                        <Icon className="size-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="relative flex items-center gap-3 border-t border-gray-700 pt-6 pr-8 pl-2">
                            <AvatarLabelGroup
                                status="online"
                                size="md"
                                src=""
                                title="Antoine Moulin"
                                subtitle="antoine@oyko.space"
                            />

                            <div className="absolute top-1/2 right-0 -translate-y-1/2">
                                <Button
                                    size="sm"
                                    color="tertiary"
                                    iconLeading={<LogOut01 className="size-5 text-gray-500 transition-inherit-all group-hover:text-gray-300" />}
                                    className="p-1.5!"
                                    onClick={logout}
                                />
                            </div>
                        </div>
                    </div>
                </aside>
            </MobileNavigationHeader>
        </>
    );
};
