"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDettesData,
  addDette,
  updateDette,
  deleteDette,
} from "@/lib/data/dettes";
import { queryKeys } from "@/lib/api/query-keys";

export function useLiabilities() {
  return useQuery({
    queryKey: queryKeys.liabilities.all,
    queryFn: () => getDettesData(),
  });
}

export function useCreateLiability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof addDette>[0]) => addDette(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liabilities"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.patrimoine.all });
    },
  });
}

export function useUpdateLiability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateDette>[1];
    }) => updateDette(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liabilities"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.patrimoine.all });
    },
  });
}

export function useDeleteLiability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDette(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liabilities"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.patrimoine.all });
    },
  });
}
