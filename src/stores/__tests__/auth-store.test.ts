import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../auth-store";

describe("auth-store", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isLoading: true });
  });

  it("should start with null user and loading true", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it("should set user and stop loading", () => {
    const mockUser = {
      id: "1",
      email: "test@test.com",
      prenom: "Test",
      nom: "User",
      revenus_mensuels: null,
      objectif_epargne: null,
      mode_gestion: null,
      avatar_url: null,
      created_at: null,
      updated_at: null,
      salaire_attendu: null,
      salaire_patterns: null,
      salaire_recu_ce_mois: null,
      premier_jour_semaine: null,
    };

    useAuthStore.getState().setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isLoading).toBe(false);
  });

  it("should clear user", () => {
    useAuthStore.getState().setUser({
      id: "1",
      email: "test@test.com",
      prenom: null,
      nom: null,
      revenus_mensuels: null,
      objectif_epargne: null,
      mode_gestion: null,
      avatar_url: null,
      created_at: null,
      updated_at: null,
      salaire_attendu: null,
      salaire_patterns: null,
      salaire_recu_ce_mois: null,
      premier_jour_semaine: null,
    });
    useAuthStore.getState().clearUser();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
  });
});
