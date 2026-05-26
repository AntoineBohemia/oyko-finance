"use client";

import dynamic from "next/dynamic";

const ChartLoading = () => (
  <div className="flex h-64 w-full items-center justify-center">
    <div className="h-full w-full animate-pulse rounded-lg bg-gray-100" />
  </div>
);

export const LazyResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false, loading: ChartLoading }
);

export const LazyAreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  { ssr: false }
);

export const LazyPieChart = dynamic(
  () => import("recharts").then((mod) => mod.PieChart),
  { ssr: false }
);

export const LazyBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
);

export const LazyRadialBarChart = dynamic(
  () => import("recharts").then((mod) => mod.RadialBarChart),
  { ssr: false }
);

// These are lightweight sub-components, import them normally
// since they're only used inside the lazy-loaded chart containers
export {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PolarAngleAxis,
  RadialBar,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
