"use client";

import { useQuery } from "@tanstack/react-query";
import { getPatrimoineData } from "@/lib/data/patrimoine";
import { queryKeys } from "@/lib/api/query-keys";

export function usePatrimoine() {
  return useQuery({
    queryKey: queryKeys.patrimoine.all,
    queryFn: () => getPatrimoineData(),
  });
}
