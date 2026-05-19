"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const { user, isLoading, setUser, clearUser, setLoading } = useAuthStore();
  const router = useRouter();

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ detail: "Erreur de connexion" }));
        throw new Error(error.detail || "Erreur de connexion");
      }
      const data = await res.json();
      setUser(data.user);
      return data;
    },
    [setUser],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      prenom: string,
      nom: string,
    ) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, prenom, nom }),
      });
      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ detail: "Erreur d'inscription" }));
        throw new Error(error.detail || "Erreur d'inscription");
      }
      return res.json();
    },
    [],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    clearUser();
    router.push("/login");
  }, [clearUser, router]);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/me");
      if (res.ok) {
        setUser(await res.json());
      } else {
        clearUser();
      }
    } catch {
      clearUser();
    }
  }, [setUser, clearUser, setLoading]);

  // Hydrater le user au mount
  useEffect(() => {
    if (!user && isLoading) {
      fetchUser();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    user,
    loading: isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    fetchUser,
  };
}
