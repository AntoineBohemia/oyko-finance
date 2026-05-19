"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDepensesData,
  addTransaction,
  deleteTransaction,
} from "@/lib/data/depenses";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";

export function useTransactions(period?: string) {
  return useQuery({
    queryKey: queryKeys.transactions.all({ period }),
    queryFn: () => getDepensesData(period),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof addTransaction>[0]) =>
      addTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
    },
  });
}

export function useImportTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { transactions: Record<string, unknown>[] }) =>
      api("/api/v1/transactions/import", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
    },
  });
}

export function useBulkDeleteTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      api("/api/v1/transactions/bulk-delete", {
        method: "POST",
        body: { ids },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
    },
  });
}
