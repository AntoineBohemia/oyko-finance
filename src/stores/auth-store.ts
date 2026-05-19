import { create } from "zustand";
import type { MeResponse } from "@/types/api";

interface AuthState {
  user: MeResponse | null;
  isLoading: boolean;
  setUser: (user: MeResponse) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  clearUser: () => set({ user: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
