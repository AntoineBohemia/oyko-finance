"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import {
  updateCompteSolde,
} from "@/lib/data/patrimoine";
import {
  addCompte,
  deleteCompte,
} from "@/lib/data/parametres";
import { queryKeys } from "@/lib/api/query-keys";

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof addCompte>[0]) => addCompte(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.patrimoine.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.parametres.all });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      solde,
    }: {
      id: string;
      solde: number;
    }) => updateCompteSolde(id, solde),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.patrimoine.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.parametres.all });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCompte(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.patrimoine.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.parametres.all });
    },
  });
}
