"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChargesFixesData,
  addChargeFix,
  updateChargeFix,
  deleteChargeFix,
  toggleChargeFixActive,
} from "@/lib/data/charges-fixes";
import { queryKeys } from "@/lib/api/query-keys";

export function useRecurringCharges() {
  return useQuery({
    queryKey: queryKeys.recurringCharges.all,
    queryFn: () => getChargesFixesData(),
  });
}

export function useCreateRecurringCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof addChargeFix>[0]) =>
      addChargeFix(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-charges"] });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
    },
  });
}

export function useUpdateRecurringCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateChargeFix>[1];
    }) => updateChargeFix(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-charges"] });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
    },
  });
}

export function useDeleteRecurringCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteChargeFix(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-charges"] });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
    },
  });
}

export function useToggleRecurringCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estActif }: { id: string; estActif: boolean }) =>
      toggleChargeFixActive(id, estActif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-charges"] });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
    },
  });
}
