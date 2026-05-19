"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/lib/data/dashboard";
import { queryKeys } from "@/lib/api/query-keys";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: () => getDashboardData(),
  });
}
