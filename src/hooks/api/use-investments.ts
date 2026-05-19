"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInvestissementsData,
  addInvestissement,
  updateInvestissement,
  deleteInvestissement,
} from "@/lib/data/investissements";
import { queryKeys } from "@/lib/api/query-keys";

export function useInvestments() {
  return useQuery({
    queryKey: queryKeys.investments.all,
    queryFn: () => getInvestissementsData(),
  });
}

export function useCreateInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof addInvestissement>[0]) =>
      addInvestissement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.patrimoine.all });
    },
  });
}

export function useUpdateInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateInvestissement>[1];
    }) => updateInvestissement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.patrimoine.all });
    },
  });
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInvestissement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.patrimoine.all });
    },
  });
}
