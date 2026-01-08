"use client";

import { useMemo, useState } from "react";
import { ChevronDown, CurrencyDollarCircle, Edit01, Eye, FilterLines, SearchLg, Trash01, UserCircle, Zap } from "@untitledui/icons";
import type { SortDescriptor } from "react-aria-components";
import { Bar, CartesianGrid, ComposedChart, Line, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis } from "recharts";
import { HeaderNavigationBase } from "@/components/application/app-navigation/header-navigation";
import { ChartTooltipContent } from "@/components/application/charts/charts-base";
import { MetricChangeIndicator, MetricsIcon03 } from "@/components/application/metrics/metrics";
import { PaginationPageMinimalCenter } from "@/components/application/pagination/pagination";
import { Table, TableRowActionsDropdown } from "@/components/application/table/table";
import { TabList, Tabs } from "@/components/application/tabs/tabs";
import { Avatar } from "@/components/base/avatar/avatar";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { InputBase } from "@/components/base/input/input";

// Helper functions for formatting
const formatCurrency = (amount: number): string => amount.toLocaleString("en-US", { style: "currency", currency: "USD" });

const formatDate = (timestamp: number): string =>
    new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

const data = [
    { date: "2025-01-01", A: 633, B: 190 },
    { date: "2025-01-06", A: 443, B: 228 },
    { date: "2025-01-12", A: 506, B: 225 },
    { date: "2025-01-18", A: 316, B: 227 },
    { date: "2025-01-24", A: 760, B: 209 },
    { date: "2025-02-01", A: 950, B: 220 },
    { date: "2025-02-05", A: 760, B: 224 },
    { date: "2025-02-11", A: 633, B: 285 },
    { date: "2025-02-17", A: 570, B: 279 },
    { date: "2025-02-23", A: 253, B: 296 },
    { date: "2025-03-01", A: 380, B: 263 },
    { date: "2025-03-07", A: 443, B: 333 },
    { date: "2025-03-13", A: 506, B: 335 },
    { date: "2025-03-19", A: 443, B: 306 },
    { date: "2025-03-25", A: 316, B: 315 },
    { date: "2025-04-01", A: 190, B: 325 },
    { date: "2025-04-06", A: 316, B: 343 },
    { date: "2025-04-12", A: 380, B: 367 },
    { date: "2025-04-18", A: 506, B: 372 },
    { date: "2025-04-24", A: 443, B: 374 },
    { date: "2025-05-01", A: 696, B: 278 },
    { date: "2025-05-06", A: 950, B: 258 },
    { date: "2025-05-12", A: 823, B: 341 },
    { date: "2025-05-18", A: 633, B: 357 },
    { date: "2025-05-24", A: 570, B: 372 },
    { date: "2025-06-01", A: 253, B: 404 },
    { date: "2025-06-06", A: 316, B: 314 },
    { date: "2025-06-11", A: 443, B: 344 },
    { date: "2025-06-17", A: 380, B: 359 },
    { date: "2025-06-23", A: 253, B: 400 },
    { date: "2025-07-01", A: 190, B: 381 },
    { date: "2025-07-05", A: 316, B: 427 },
    { date: "2025-07-11", A: 506, B: 494 },
    { date: "2025-07-17", A: 633, B: 371 },
    { date: "2025-07-23", A: 570, B: 382 },
    { date: "2025-08-01", A: 760, B: 383 },
    { date: "2025-08-06", A: 950, B: 361 },
    { date: "2025-08-10", A: 823, B: 358 },
    { date: "2025-08-16", A: 696, B: 405 },
    { date: "2025-08-22", A: 570, B: 400 },
    { date: "2025-09-01", A: 443, B: 391 },
    { date: "2025-09-03", A: 316, B: 425 },
    { date: "2025-09-09", A: 253, B: 406 },
    { date: "2025-09-15", A: 380, B: 472 },
    { date: "2025-09-21", A: 506, B: 441 },
    { date: "2025-10-01", A: 633, B: 477 },
    { date: "2025-10-03", A: 570, B: 465 },
    { date: "2025-10-09", A: 443, B: 488 },
    { date: "2025-10-15", A: 380, B: 501 },
    { date: "2025-10-21", A: 316, B: 615 },
    { date: "2025-11-01", A: 570, B: 612 },
    { date: "2025-11-02", A: 506, B: 673 },
    { date: "2025-11-08", A: 443, B: 630 },
    { date: "2025-11-14", A: 506, B: 575 },
    { date: "2025-11-20", A: 760, B: 630 },
    { date: "2025-11-26", A: 443, B: 597 },
    { date: "2025-12-02", A: 696, B: 618 },
    { date: "2025-12-08", A: 506, B: 572 },
    { date: "2025-12-14", A: 316, B: 636 },
    { date: "2025-12-20", A: 633, B: 664 },
    { date: "2025-12-25", A: 380, B: 742 },
    { date: "2025-12-31", A: 633, B: 808 },
];

const customers = [
    {
        name: "Lily-Rose Chedjou",
        email: "lilyrose@gmail.com",
        username: "@lilyrose",
        avatarUrl: "https://www.untitledui.com/images/avatars/lily-rose-chedjou?fm=webp&q=80",
        date: new Date(2025, 0, 16).getTime(),
        status: "paid",
        amount: 100.14,
    },
    {
        name: "Caitlyn King",
        email: "hi@caitlynking.com",
        username: "@caitlynk",
        avatarUrl: "https://www.untitledui.com/images/avatars/caitlyn-king?fm=webp&q=80",
        date: new Date(2025, 0, 16).getTime(),
        status: "paid",
        amount: 96.32,
    },
    {
        name: "Fleur Cook",
        email: "fleurcook@icloud.com",
        username: "@fleur_cook",
        avatarUrl: "https://www.untitledui.com/images/avatars/fleur-cook?fm=webp&q=80",
        date: new Date(2025, 0, 15).getTime(),
        status: "paid",
        amount: 104.24,
    },
    {
        name: "Marco Kelly",
        email: "marco@marcokelly.co",
        username: "@marcokelly",
        avatarUrl: "https://www.untitledui.com/images/avatars/marco-kelly?fm=webp&q=80",
        date: new Date(2025, 0, 14).getTime(),
        status: "paid",
        amount: 88.48,
    },
    {
        name: "Lulu Meyers",
        email: "lulu@lulumeyers.com",
        username: "@lulu_meyers",
        avatarUrl: "https://www.untitledui.com/images/avatars/lulu-meyers?fm=webp&q=80",
        date: new Date(2025, 0, 14).getTime(),
        status: "paid",
        amount: 96.32,
    },
    {
        name: "Mikey Lawrence",
        email: "m.lawrence@gmail.com",
        username: "@mikeylawrence",
        avatarUrl: "https://www.untitledui.com/images/avatars/mikey-lawrence?fm=webp&q=80",
        date: new Date(2025, 0, 14).getTime(),
        status: "paid",
        amount: 107.1,
    },
    {
        name: "Freya Browning",
        email: "hey@freyabrowning.com",
        username: "@freya_b",
        avatarUrl: "https://www.untitledui.com/images/avatars/freya-browning?fm=webp&q=80",
        date: new Date(2025, 0, 14).getTime(),
        status: "paid",
        amount: 82.04,
    },
];

const getInitials = (name: string) => {
    const [firstName, lastName] = name.split(" ");

    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
};

export const Dashboard04 = () => {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();

    const sortedItems = useMemo(() => {
        if (!sortDescriptor) return customers;

        return customers.toSorted((a, b) => {
            const first = a[sortDescriptor.column as keyof typeof a];
            const second = b[sortDescriptor.column as keyof typeof b];

            // Handle numbers
            if (typeof first === "number" && typeof second === "number") {
                return sortDescriptor.direction === "ascending" ? first - second : second - first;
            }

            // Handle strings
            if (typeof first === "string" && typeof second === "string") {
                const result = first.localeCompare(second);
                return sortDescriptor.direction === "ascending" ? result : -result;
            }

            return 0;
        });
    }, [sortDescriptor]);

    return (
        <div className="bg-primary">
            <HeaderNavigationBase
                items={[
                    { label: "Home", href: "/" },
                    {
                        label: "Dashboard",
                        href: "/dashboard",
                        current: true,
                        items: [
                            { label: "Overview", href: "#", current: true },
                            { label: "Notifications", href: "#" },
                            { label: "Analytics", href: "#" },
                            { label: "Saved reports", href: "#" },
                            { label: "Scheduled reports", href: "#" },
                            { label: "User reports", href: "#" },
                        ],
                    },
                    { label: "Projects", href: "/projects" },
                    { label: "Tasks", href: "/tasks" },
                    { label: "Reporting", href: "/reporting" },
                    { label: "Users", href: "/users" },
                ]}
                trailingContent={
                    <Button iconLeading={Zap} color="secondary" size="sm">
                        Upgrade now
                    </Button>
                }
            />

            <main className="bg-primary pt-8 pb-12 lg:pt-12 lg:pb-24">
                <div className="flex flex-col gap-8">
                    <div className="mx-auto flex w-full max-w-container flex-col gap-5 px-4 lg:px-8">
                        {/* Page header */}
                        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                            <h1 className="text-xl font-semibold text-primary lg:text-display-xs">My dashboard</h1>
                        </div>
                    </div>

                    <div className="-my-2 flex w-full max-w-full flex-col gap-4 overflow-x-auto px-4 py-2 md:mx-auto md:w-max md:flex-row md:flex-wrap md:items-start lg:w-full lg:max-w-container lg:gap-5 lg:px-8">
                        <MetricsIcon03
                            icon={CurrencyDollarCircle}
                            title="$8,746.22"
                            subtitle="All revenue"
                            change="2.4%"
                            changeTrend="positive"
                            actions={false}
                            className="flex-1 ring-2 ring-brand max-lg:**:data-featured-icon:hidden md:min-w-[320px]"
                        />
                        <MetricsIcon03
                            icon={Eye}
                            title="12,440"
                            subtitle="Page views"
                            change="6.2%"
                            changeTrend="positive"
                            actions={false}
                            className="flex-1 max-lg:**:data-featured-icon:hidden md:min-w-[320px]"
                        />
                        <MetricsIcon03
                            icon={UserCircle}
                            title="96"
                            subtitle="Active now"
                            change="0.8%"
                            changeTrend="positive"
                            actions={false}
                            className="flex-1 max-lg:**:data-featured-icon:hidden md:min-w-[320px]"
                        />
                    </div>

                    <div className="mx-auto flex w-full max-w-container flex-col gap-5 px-4 lg:px-8">
                        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-semibold text-tertiary">Net revenue</span>
                                    <ChevronDown size={16} className="text-fg-quaternary" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-display-sm font-semibold text-primary">$7,804.16</span>

                                    <MetricChangeIndicator type="trend" trend="positive" value="2.4%" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Tabs>
                                    <TabList
                                        type="button-minimal"
                                        items={[
                                            {
                                                id: "12months",
                                                label: (
                                                    <>
                                                        <span className="max-md:hidden">12 months</span>
                                                        <span className="md:hidden">12m</span>
                                                    </>
                                                ),
                                            },
                                            {
                                                id: "30days",
                                                label: (
                                                    <>
                                                        <span className="max-md:hidden">30 days</span>
                                                        <span className="md:hidden">30d</span>
                                                    </>
                                                ),
                                            },
                                            {
                                                id: "7days",
                                                label: (
                                                    <>
                                                        <span className="max-md:hidden">7 days</span>
                                                        <span className="md:hidden">7d</span>
                                                    </>
                                                ),
                                            },
                                            {
                                                id: "24hours",
                                                label: (
                                                    <>
                                                        <span className="max-md:hidden">24 hours</span>
                                                        <span className="md:hidden">24h</span>
                                                    </>
                                                ),
                                            },
                                        ]}
                                    />
                                </Tabs>

                                <Button size="sm" color="secondary" iconLeading={FilterLines}>
                                    Filters
                                </Button>
                            </div>
                        </div>

                        <div className="flex h-60 flex-col gap-2 lg:h-66">
                            <ResponsiveContainer className="h-full">
                                <ComposedChart
                                    data={data}
                                    margin={{
                                        top: 12,
                                    }}
                                    className="text-tertiary [&_.recharts-text]:text-xs"
                                >
                                    <CartesianGrid vertical={false} stroke="currentColor" className="text-utility-gray-100" />

                                    <XAxis
                                        // fill="currentColor"
                                        // axisLine={false}
                                        // tickLine={false}
                                        // tickMargin={10}
                                        // interval="preserveStartEnd"
                                        // tickFormatter={(value, index) => (index % 4 === 0 ? value : "")}
                                        hide
                                        dataKey="date"
                                    />

                                    <RechartsTooltip
                                        content={<ChartTooltipContent />}
                                        formatter={(value) => (value as number)?.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }) ?? ""}
                                        labelFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                                        cursor={{
                                            className: "stroke-utility-gray-300",
                                        }}
                                    />

                                    <Bar
                                        isAnimationActive={false}
                                        className="text-utility-brand-600_alt"
                                        name="Current period"
                                        dataKey="A"
                                        type="monotone"
                                        stackId="a"
                                        fill="currentColor"
                                        maxBarSize={12}
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Line
                                        isAnimationActive={false}
                                        className="text-utility-brand-400"
                                        dataKey="B"
                                        name="Previous period"
                                        type="monotone"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeDasharray="0.1 8"
                                        strokeLinecap="round"
                                        activeDot={false}
                                        dot={false}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>{" "}
                            <ul className="mt-auto flex justify-between px-2 lg:px-6">
                                <li className="text-xs text-tertiary">Jan</li>
                                <li className="hidden text-xs text-tertiary md:block">Feb</li>
                                <li className="text-xs text-tertiary">Mar</li>
                                <li className="hidden text-xs text-tertiary md:block">Apr</li>
                                <li className="text-xs text-tertiary">May</li>
                                <li className="hidden text-xs text-tertiary md:block">Jun</li>
                                <li className="text-xs text-tertiary">Jul</li>
                                <li className="hidden text-xs text-tertiary md:block">Aug</li>
                                <li className="text-xs text-tertiary">Sep</li>
                                <li className="hidden text-xs text-tertiary md:block">Oct</li>
                                <li className="text-xs text-tertiary">Nov</li>
                                <li className="text-xs text-tertiary">Dec</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-container flex-col gap-5 px-4 lg:px-8">
                        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
                            <p className="text-lg font-semibold text-primary">Customers</p>
                            <div className="w-full lg:max-w-xs">
                                <InputBase size="sm" type="search" shortcut aria-label="Search" placeholder="Search" icon={SearchLg} />
                            </div>
                        </div>

                        <div>
                            <Table
                                aria-label="Pages and screens"
                                selectionMode="multiple"
                                sortDescriptor={sortDescriptor}
                                onSortChange={setSortDescriptor}
                                className="bg-primary"
                            >
                                <Table.Header className="bg-primary [&_*:first-of-type]:pl-0!">
                                    <Table.Head id="name" label="Customer" isRowHeader allowsSorting className="w-full" />
                                    <Table.Head id="email" label="Email" allowsSorting className="max-lg:hidden" />
                                    <Table.Head id="date" label="Date" allowsSorting className="max-lg:hidden" />
                                    <Table.Head id="status" label="Status" allowsSorting className="max-lg:hidden" />
                                    <Table.Head id="amount" label="Amount" allowsSorting className="max-lg:hidden" />
                                    <Table.Head id="actions" />
                                </Table.Header>

                                <Table.Body items={sortedItems}>
                                    {(customer) => (
                                        <Table.Row id={customer.name} className="[&>*:first-of-type]:pl-0!">
                                            <Table.Cell className="text-nowrap">
                                                <div className="flex w-max items-center gap-3">
                                                    <Avatar src={customer.avatarUrl} initials={getInitials(customer.name)} alt={customer.name} size="md" />
                                                    <div>
                                                        <p className="text-sm font-medium text-primary">{customer.name}</p>
                                                        <p className="text-sm text-tertiary">{customer.username}</p>
                                                    </div>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell className="text-nowrap max-lg:hidden">{customer.email}</Table.Cell>
                                            <Table.Cell className="text-nowrap max-lg:hidden">{formatDate(customer.date)}</Table.Cell>
                                            <Table.Cell className="max-lg:hidden">
                                                <BadgeWithDot
                                                    color={customer.status === "paid" ? "success" : customer.status === "failed" ? "error" : "gray"}
                                                    type="modern"
                                                    size="sm"
                                                    className="capitalize"
                                                >
                                                    {customer.status}
                                                </BadgeWithDot>
                                            </Table.Cell>
                                            <Table.Cell className="max-lg:hidden">{formatCurrency(customer.amount)}</Table.Cell>

                                            <Table.Cell className="pr-0 pl-4">
                                                <div className="flex justify-end gap-0.5 max-lg:hidden">
                                                    <ButtonUtility size="xs" color="tertiary" tooltip="Delete" icon={Trash01} />
                                                    <ButtonUtility size="xs" color="tertiary" tooltip="Edit" icon={Edit01} />
                                                </div>
                                                <div className="flex items-center justify-end lg:hidden">
                                                    <TableRowActionsDropdown />
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table>
                            <PaginationPageMinimalCenter page={1} total={10} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
