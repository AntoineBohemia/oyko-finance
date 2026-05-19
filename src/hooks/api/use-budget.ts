"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBudgetData, updateCategoryBudget } from "@/lib/data/budget";
import { queryKeys } from "@/lib/api/query-keys";

export function useBudget(month: number, year: number) {
  return useQuery({
    queryKey: queryKeys.budget.monthly(month, year),
    queryFn: () => getBudgetData(month, year),
  });
}

export function useUpdateCategoryBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      budget,
    }: {
      categoryId: string;
      budget: number;
    }) => updateCategoryBudget(categoryId, budget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
    },
  });
}
