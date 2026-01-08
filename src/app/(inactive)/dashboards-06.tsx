"use client";

import { useMemo, useState } from "react";
import {
    BarChartSquare02,
    CheckDone01,
    Edit01,
    FilterLines,
    HomeLine,
    PieChart03,
    Plus,
    Rows01,
    SearchLg,
    Trash01,
    UploadCloud02,
    Users01,
    XClose,
} from "@untitledui/icons";
import type { SortDescriptor } from "react-aria-components";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    PolarAngleAxis,
    RadialBar,
    RadialBarChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
} from "recharts";
import { SidebarNavigationSlim } from "@/components/application/app-navigation/sidebar-navigation/sidebar-slim";
import { ChartLegendContent, ChartTooltipContent } from "@/components/application/charts/charts-base";
import { PaginationCardMinimal } from "@/components/application/pagination/pagination";
import { Table, TableCard, TableRowActionsDropdown } from "@/components/application/table/table";
import { Avatar } from "@/components/base/avatar/avatar";
import { BadgeWithButton, BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { cx } from "@/utils/cx";

const radialData = [
    {
        name: "2023",
        value: 660,
        className: "text-utility-brand-400",
    },
    {
        name: "2024",
        value: 774,
        className: "text-utility-brand-600",
    },
    {
        name: "2025",
        value: 866,
        className: "text-utility-brand-700",
    },
];

const lineData = [
    {
        date: "2025-01-01",
        A: 600,
        B: 400,
        C: 100,
    },
    {
        date: "2025-02-01",
        A: 620,
        B: 405,
        C: 160,
    },
    {
        date: "2025-03-01",
        A: 630,
        B: 400,
        C: 170,
    },
    {
        date: "2025-04-01",
        A: 650,
        B: 410,
        C: 190,
    },
    {
        date: "2025-05-01",
        A: 600,
        B: 320,
        C: 200,
    },
    {
        date: "2025-06-01",
        A: 650,
        B: 430,
        C: 230,
    },
    {
        date: "2025-07-01",
        A: 620,
        B: 400,
        C: 200,
    },
    {
        date: "2025-08-01",
        A: 750,
        B: 540,
        C: 300,
    },
    {
        date: "2025-09-01",
        A: 780,
        B: 490,
        C: 390,
    },
    {
        date: "2025-10-01",
        A: 750,
        B: 450,
        C: 300,
    },
    {
        date: "2025-11-01",
        A: 780,
        B: 480,
        C: 340,
    },
    {
        date: "2025-12-01",
        A: 820,
        B: 500,
        C: 450,
    },
];

const customers = [
    {
        id: "customer-01",
        company: {
            name: "Ephemeral",
            website: "ephemeral.io",
            imageUrl: "https://www.untitledui.com/logos/images/Ephemeral.jpg",
        },
        about: {
            title: "Content curating app",
            description: "Brings all your news into one place",
        },
        license_use: 70,
        status: "customer",
    },
    {
        id: "customer-02",
        company: {
            name: "Stack3d Lab",
            website: "stack3dlab.com",
            imageUrl: "https://www.untitledui.com/logos/images/Stack3d Lab.jpg",
        },
        about: {
            title: "Design software",
            description: "Super lightweight design app",
        },
        license_use: 60,
        status: "churned",
    },
    {
        id: "customer-03",
        company: {
            name: "Warpspeed",
            website: "getwarpspeed.com",
            imageUrl: "https://www.untitledui.com/logos/images/Warpspeed.jpg",
        },
        about: {
            title: "Data prediction",
            description: "AI and machine learning data",
        },
        license_use: 30,
        status: "customer",
    },
    {
        id: "customer-04",
        company: {
            name: "CloudWatch",
            website: "cloudwatch.app",
            imageUrl: "https://www.untitledui.com/logos/images/CloudWatch.jpg",
        },
        about: {
            title: "Productivity app",
            description: "Time management and productivity",
        },
        license_use: 80,
        status: "customer",
    },
    {
        id: "customer-05",
        company: {
            name: "ContrastAI",
            website: "contrastai.com",
            imageUrl: "https://www.untitledui.com/logos/images/ContrastAI.jpg",
        },
        about: {
            title: "Web app integrations",
            description: "Connect web apps seamlessly",
        },
        license_use: 20,
        status: "churned",
    },
    {
        id: "customer-06",
        company: {
            name: "Convergence",
            website: "convergence.io",
            imageUrl: "https://www.untitledui.com/logos/images/Convergence.jpg",
        },
        about: {
            title: "Sales CRM",
            description: "Web-based sales doc management",
        },
        license_use: 10,
        status: "customer",
    },
    {
        id: "customer-07",
        company: {
            name: "Sisyphus",
            website: "sisyphus.com",
            imageUrl: "https://www.untitledui.com/logos/images/Sisyphus.jpg",
        },
        about: {
            title: "Automation and workflow",
            description: "Time tracking, invoicing and expenses",
        },
        license_use: 40,
        status: "customer",
    },
];

const styles = {
    innerRadius: 64,
    outerRadius: 122,

    titleDY: "1.2em",
    subtitleDY: "-1.6em",

    title: "text-display-sm font-semibold",
    subtitle: "text-sm font-medium",
};

const colors: Record<string, string> = {
    A: "text-utility-brand-600",
    B: "text-utility-brand-400",
    C: "text-utility-brand-700",
};

export const Dashboard06 = () => {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();

    const sortedItems = useMemo(() => {
        if (!sortDescriptor) return customers;

        return customers.toSorted((a, b) => {
            let first = a[sortDescriptor.column as keyof typeof a];
            let second = b[sortDescriptor.column as keyof typeof b];

            // Extract name from objects if needed
            if (typeof first === "object" && first && "name" in first) {
                first = first.name;
            }
            if (typeof second === "object" && second && "name" in second) {
                second = second.name;
            }

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
        <div className="flex flex-col bg-primary lg:flex-row">
            <SidebarNavigationSlim
                hideRightBorder
                activeUrl="/dashboard"
                items={[
                    {
                        label: "Home",
                        href: "/",
                        icon: HomeLine,
                    },
                    {
                        label: "Dashboard",
                        href: "/dashboard",
                        icon: BarChartSquare02,
                    },
                    {
                        label: "Projects",
                        href: "/projects",
                        icon: Rows01,
                    },
                    {
                        label: "Tasks",
                        href: "/tasks",
                        icon: CheckDone01,
                    },
                    {
                        label: "Reporting",
                        href: "/reporting",
                        icon: PieChart03,
                    },
                    {
                        label: "Users",
                        href: "/users",
                        icon: Users01,
                    },
                ]}
            />
            <main className="min-w-0 flex-1 lg:pt-1 lg:pl-1">
                <div className="flex h-full flex-col gap-8 border-secondary pt-8 pb-12 shadow-xs lg:rounded-tl-xl lg:border-t lg:border-l">
                    <div className="flex flex-col justify-between gap-4 px-4 lg:flex-row lg:px-8">
                        <p className="text-xl font-semibold text-primary lg:text-display-xs">Customers</p>
                        <div className="flex gap-3">
                            <Button size="md" color="secondary" iconLeading={UploadCloud02}>
                                Import
                            </Button>
                            <Button size="md" iconLeading={Plus}>
                                Add customer
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 px-4 lg:flex-row lg:gap-16 lg:px-8">
                        <div className="flex flex-col gap-6 lg:w-60">
                            <div className="flex items-start justify-between border-b border-secondary pb-5">
                                <p className="text-lg font-semibold text-primary">Active now</p>
                                <TableRowActionsDropdown />
                            </div>

                            {/* ActivityGauge */}
                            <div className="h-60 w-60">
                                <ResponsiveContainer>
                                    <RadialBarChart
                                        data={radialData}
                                        accessibilityLayer
                                        innerRadius={styles.innerRadius}
                                        outerRadius={styles.outerRadius}
                                        // This is needed to start the chart at the top and go clockwise
                                        startAngle={90}
                                        endAngle={360 + 90}
                                        className="font-medium text-tertiary [&_.recharts-polar-grid]:text-utility-gray-100 [&_.recharts-text]:text-sm"
                                    >
                                        <PolarAngleAxis tick={false} domain={[0, 1000]} type="number" reversed />

                                        <RechartsTooltip content={<ChartTooltipContent isRadialChart />} />

                                        <RadialBar
                                            isAnimationActive={false}
                                            dataKey="value"
                                            cornerRadius={99}
                                            fill="currentColor"
                                            background={{
                                                className: "fill-utility-gray-100",
                                            }}
                                        />

                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                                            <tspan x="50%" dy="1%" className={cx("fill-current text-primary", styles.title)}>
                                                316
                                            </tspan>
                                        </text>
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col gap-6">
                            <div className="flex items-start justify-between border-b border-secondary pb-5">
                                <p className="text-lg font-semibold text-primary">Total customers</p>
                                <TableRowActionsDropdown />
                            </div>
                            <div className="flex h-60 w-full flex-col gap-2">
                                <ResponsiveContainer className="h-full">
                                    <AreaChart data={lineData} className="text-tertiary [&_.recharts-text]:text-xs">
                                        <defs>
                                            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="currentColor" className="text-utility-brand-700" stopOpacity="0.7" />
                                                <stop offset="95%" stopColor="currentColor" className="text-utility-brand-700" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid vertical={false} stroke="currentColor" className="text-utility-gray-100" />

                                        <Legend
                                            itemSorter="dataKey"
                                            verticalAlign="top"
                                            align="right"
                                            layout="horizontal"
                                            content={<ChartLegendContent className="-translate-y-2" />}
                                        />

                                        <XAxis
                                            fill="currentColor"
                                            axisLine={false}
                                            tickLine={false}
                                            tickMargin={10}
                                            padding={{ left: 10, right: 10 }}
                                            interval="preserveStartEnd"
                                            dataKey="date"
                                            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: "short" })}
                                        />

                                        <RechartsTooltip
                                            content={<ChartTooltipContent />}
                                            labelFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: "long" })}
                                            cursor={{
                                                className: "stroke-utility-brand-600 stroke-2",
                                            }}
                                        />

                                        <Area
                                            isAnimationActive={false}
                                            className={cx(
                                                colors["A"],
                                                "[&_.recharts-area-area]:translate-y-[6px] [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]",
                                            )}
                                            dataKey="A"
                                            name="2025"
                                            type="linear"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            fill="url(#gradient)"
                                            fillOpacity={0.1}
                                            activeDot={{
                                                className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                                            }}
                                        />

                                        <Area
                                            isAnimationActive={false}
                                            className={cx(
                                                colors["B"],
                                                "[&_.recharts-area-area]:translate-y-[6px] [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]",
                                            )}
                                            dataKey="B"
                                            name="2024"
                                            type="linear"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            fill="none"
                                            strokeDasharray="0.1 8"
                                            strokeLinecap="round"
                                            activeDot={{
                                                className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                                            }}
                                        />

                                        <Area
                                            isAnimationActive={false}
                                            className={cx(
                                                colors["C"],
                                                "[&_.recharts-area-area]:translate-y-[6px] [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]",
                                            )}
                                            dataKey="C"
                                            name="2023"
                                            type="linear"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            fill="none"
                                            strokeDasharray="0.1 8"
                                            strokeLinecap="round"
                                            activeDot={{
                                                className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                                            }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-6 px-4 lg:px-8">
                        <div className="hidden justify-between gap-4 lg:flex">
                            <div className="flex gap-3">
                                <Button iconTrailing={XClose} size="md" color="secondary">
                                    All time
                                </Button>
                                <Button iconTrailing={XClose} size="md" color="secondary">
                                    US, AU, +4
                                </Button>
                                <Button iconLeading={FilterLines} size="md" color="secondary">
                                    More filters
                                </Button>
                            </div>
                            <Input icon={SearchLg} shortcut aria-label="Search" placeholder="Search" size="sm" className="w-80" />
                        </div>
                        <div className="flex flex-col gap-3 lg:hidden">
                            <Input icon={SearchLg} shortcut aria-label="Search" placeholder="Search" size="sm" />
                            <Button iconLeading={FilterLines} size="md" color="secondary">
                                More filters
                            </Button>
                            <div className="flex gap-3">
                                <BadgeWithButton color="gray" size="md" type="modern" buttonLabel="Clear" onButtonClick={() => {}}>
                                    All time
                                </BadgeWithButton>
                                <BadgeWithButton color="gray" size="md" type="modern" buttonLabel="Clear" onButtonClick={() => {}}>
                                    US, AU, +4
                                </BadgeWithButton>
                            </div>
                        </div>

                        <TableCard.Root className="-mx-4 rounded-none lg:mx-0 lg:rounded-xl">
                            <Table
                                aria-label="Trades"
                                selectionMode="multiple"
                                defaultSelectedKeys={["customer-01", "customer-02", "customer-03", "customer-06", "customer-07"]}
                                sortDescriptor={sortDescriptor}
                                onSortChange={setSortDescriptor}
                            >
                                <Table.Header>
                                    <Table.Head id="company" isRowHeader allowsSorting label="Company" className="w-full" />
                                    <Table.Head id="status" label="Status" />
                                    <Table.Head id="about" label="About" />
                                    <Table.Head id="users" label="Users" allowsSorting />
                                    <Table.Head id="license_use" label="License use" className="min-w-44" />
                                    <Table.Head id="actions" />
                                </Table.Header>
                                <Table.Body items={sortedItems}>
                                    {(customer) => (
                                        <Table.Row id={customer.id} highlightSelectedRow={false}>
                                            <Table.Cell>
                                                <div className="group flex items-center gap-3">
                                                    <Avatar src={customer.company.imageUrl} alt={customer.company.name} size="md" />
                                                    <div>
                                                        <p className="text-sm font-medium text-primary">{customer.company.name}</p>
                                                        <p className="text-sm text-tertiary">{customer.company.website}</p>
                                                    </div>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <BadgeWithDot
                                                    size="sm"
                                                    type="modern"
                                                    color={customer.status === "customer" ? "success" : "gray"}
                                                    className="capitalize"
                                                >
                                                    {customer.status}
                                                </BadgeWithDot>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div>
                                                    <p className="text-sm font-medium text-primary">{customer.about.title}</p>
                                                    <p className="text-sm text-nowrap text-tertiary">{customer.about.description}</p>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="flex -space-x-1">
                                                    <Avatar
                                                        className="ring-[1.5px] ring-bg-primary"
                                                        size="xs"
                                                        src="https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80"
                                                        alt="Olivia Rhye"
                                                    />
                                                    <Avatar
                                                        className="ring-[1.5px] ring-bg-primary"
                                                        size="xs"
                                                        src="https://www.untitledui.com/images/avatars/phoenix-baker?fm=webp&q=80"
                                                        alt="Phoenix Baker"
                                                    />
                                                    <Avatar
                                                        className="ring-[1.5px] ring-bg-primary"
                                                        size="xs"
                                                        src="https://www.untitledui.com/images/avatars/lana-steiner?fm=webp&q=80"
                                                        alt="Lana Steiner"
                                                    />
                                                    <Avatar
                                                        className="ring-[1.5px] ring-bg-primary"
                                                        size="xs"
                                                        src="https://www.untitledui.com/images/avatars/demi-wilkinson?fm=webp&q=80"
                                                        alt="Demi Wilkinson"
                                                    />

                                                    <Avatar
                                                        className="ring-[1.5px] ring-bg-primary"
                                                        size="xs"
                                                        src="https://www.untitledui.com/images/avatars/candice-wu?fm=webp&q=80"
                                                        alt="Candice Wu"
                                                    />
                                                    <Avatar
                                                        size="xs"
                                                        className="ring-[1.5px] ring-bg-primary"
                                                        placeholder={
                                                            <span className="flex items-center justify-center text-xs font-semibold text-quaternary">+5</span>
                                                        }
                                                    />
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <ProgressBar min={0} max={100} value={customer.license_use} />
                                            </Table.Cell>
                                            <Table.Cell className="px-4">
                                                <div className="flex justify-end gap-0.5">
                                                    <ButtonUtility size="xs" color="tertiary" tooltip="Delete" icon={Trash01} />
                                                    <ButtonUtility size="xs" color="tertiary" tooltip="Edit" icon={Edit01} />
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table>
                            <PaginationCardMinimal page={1} total={10} align="center" />
                        </TableCard.Root>
                    </div>
                </div>
            </main>
        </div>
    );
};
