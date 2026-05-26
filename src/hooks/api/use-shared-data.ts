"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Profile, Compte } from "@/types/api";

// These queries are shared across all pages.
// They're fetched once and cached for 5 min (default staleTime).
// Every page that needs profile/categories/accounts reads from this cache.

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api<Profile>("/api/v1/profile"),
  });
}

interface CategoryRaw {
  id: string;
  nom: string;
  icone: string;
  couleur: string;
  type: string;
  budgetMensuelCents?: number;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const raw = await api<{ categories: CategoryRaw[] }>("/api/v1/categories");
      return Array.isArray(raw) ? raw : raw.categories ?? [];
    },
  });
}

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const raw = await api<{ comptes: Compte[] }>("/api/v1/accounts");
      return Array.isArray(raw) ? raw : raw.comptes ?? [];
    },
  });
}
