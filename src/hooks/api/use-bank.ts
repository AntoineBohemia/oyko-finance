"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";

export function useConnectBank() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/bank/connect", { method: "POST" });
      if (!res.ok) throw new Error("Erreur de connexion bancaire");
      return res.json() as Promise<{ connect_url: string }>;
    },
  });
}

export function useSyncBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/bank/sync", { method: "POST" });
      if (!res.ok) throw new Error("Erreur de synchronisation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
    },
  });
}
