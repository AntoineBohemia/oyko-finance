"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getParametresData, updateProfile } from "@/lib/data/parametres";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";

export function useParametres() {
  return useQuery({
    queryKey: queryKeys.parametres.all,
    queryFn: () => getParametresData(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof updateProfile>[0]) =>
      updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parametres.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
    },
  });
}

export function useResetData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password: string) =>
      api("/api/v1/profile/reset", { method: "POST", body: { password } }),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
