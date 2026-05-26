"use client";

import { useProfile, useCategories, useAccounts } from "@/hooks/api/use-shared-data";

/**
 * Invisible component that prefetches shared data on app mount.
 * Profile, categories, and accounts are used across all pages.
 * By fetching them once here, they're cached for 5 min and
 * available instantly on any page navigation.
 */
export function AppDataPrefetch() {
  useProfile();
  useCategories();
  useAccounts();
  return null;
}
