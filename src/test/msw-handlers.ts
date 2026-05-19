import { http, HttpResponse } from "msw";

const mockProfile = {
  id: "test-user-id",
  email: "test@oyko.space",
  prenom: "Test",
  nom: "User",
  revenus_mensuels: 3200,
  objectif_epargne: 400,
  mode_gestion: "semaine",
  avatar_url: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-06-01T00:00:00Z",
  salaire_attendu: 3200,
  salaire_patterns: null,
  salaire_recu_ce_mois: true,
  premier_jour_semaine: 1,
};

const mockDashboard = {
  profile: mockProfile,
  comptes: [
    {
      id: "cpt-1",
      nom: "Compte courant",
      banque: "BNP",
      type: "courant",
      solde: 2450,
      icone: null,
      couleur: null,
      est_actif: true,
      ordre: 1,
      created_at: null,
      updated_at: null,
    },
  ],
  categories: [
    {
      id: "cat-1",
      nom: "Alimentation",
      icone: "food",
      couleur: "#f97316",
      budgetMensuel: 400,
    },
  ],
  chargesFixes: [],
  transactions: [],
  patrimoine: {
    valeurNette: 42350,
    totalLiquidites: 8200,
    totalInvestissements: 38500,
    totalDettes: 4350,
    variationMois: 2.3,
    repartition: [],
  },
};

export const handlers = [
  // Auth
  http.get("*/api/v1/me", () => {
    return HttpResponse.json(mockProfile);
  }),

  http.post("*/api/auth/login", () => {
    return HttpResponse.json({ user: mockProfile });
  }),

  http.post("*/api/auth/logout", () => {
    return HttpResponse.json({ success: true });
  }),

  http.post("*/api/auth/refresh", () => {
    return HttpResponse.json({ user: mockProfile });
  }),

  // Dashboard
  http.get("*/api/v1/dashboard", () => {
    return HttpResponse.json(mockDashboard);
  }),

  // Budget
  http.get("*/api/v1/budget", () => {
    return HttpResponse.json({
      profile: mockProfile,
      revenusMois: 3200,
      enveloppes: [],
      chargesFixes: [],
      transactions: [],
      totalChargesFixes: 0,
    });
  }),

  // Transactions
  http.get("*/api/v1/transactions", () => {
    return HttpResponse.json({
      profile: mockProfile,
      comptes: [],
      categoriesDepense: [],
      categoriesRevenu: [],
      transactions: [],
    });
  }),

  http.post("*/api/v1/transactions", () => {
    return HttpResponse.json({ id: "new-tx-id" }, { status: 201 });
  }),

  http.delete("*/api/v1/transactions/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("*/api/v1/transactions/import", () => {
    return HttpResponse.json({ imported: 5, errors: [] });
  }),

  http.post("*/api/v1/transactions/bulk-delete", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Recurring charges
  http.get("*/api/v1/recurring-charges", () => {
    return HttpResponse.json({
      profile: mockProfile,
      chargesFixes: [],
      comptes: [],
      categories: [],
      timeline: [],
      repartitionCategories: [],
      totaux: {
        nombreActifs: 0,
        nombreInactifs: 0,
        totalMensuel: 0,
        totalAnnuel: 0,
        prochainPrelevement: null,
      },
    });
  }),

  http.post("*/api/v1/recurring-charges", () => {
    return HttpResponse.json({ id: "new-cf-id" }, { status: 201 });
  }),

  http.put("*/api/v1/recurring-charges/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete("*/api/v1/recurring-charges/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch("*/api/v1/recurring-charges/:id/toggle", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Categories
  http.put("*/api/v1/categories/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("*/api/v1/categories", () => {
    return HttpResponse.json({ id: "new-cat-id" }, { status: 201 });
  }),

  http.delete("*/api/v1/categories/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Investments
  http.get("*/api/v1/investments", () => {
    return HttpResponse.json({
      profile: mockProfile,
      investissements: [],
      evolutionPortfolio: [],
      repartitionParType: [],
      totaux: {
        totalInvesti: 0,
        totalActuel: 0,
        plusValue: 0,
        plusValuePercent: 0,
        nombreActifs: 0,
      },
      performanceAnnuelle: [],
    });
  }),

  http.post("*/api/v1/investments", () => {
    return HttpResponse.json({ id: "new-inv-id" }, { status: 201 });
  }),

  http.put("*/api/v1/investments/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete("*/api/v1/investments/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Liabilities
  http.get("*/api/v1/liabilities", () => {
    return HttpResponse.json({
      profile: mockProfile,
      dettes: [],
      comptes: [],
    });
  }),

  http.post("*/api/v1/liabilities", () => {
    return HttpResponse.json({ id: "new-det-id" }, { status: 201 });
  }),

  http.put("*/api/v1/liabilities/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete("*/api/v1/liabilities/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Accounts
  http.get("*/api/v1/accounts", () => {
    return HttpResponse.json([]);
  }),

  http.put("*/api/v1/accounts/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("*/api/v1/accounts", () => {
    return HttpResponse.json({ id: "new-cpt-id" }, { status: 201 });
  }),

  http.delete("*/api/v1/accounts/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Profile
  http.get("*/api/v1/profile", () => {
    return HttpResponse.json(mockProfile);
  }),

  http.put("*/api/v1/profile", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Profile reset
  http.post("*/api/v1/profile/reset", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Bank
  http.post("*/api/bank/connect", () => {
    return HttpResponse.json({ connect_url: "https://bank.example.com" });
  }),

  http.post("*/api/bank/sync", () => {
    return HttpResponse.json({ synced: 10, accounts: 2 });
  }),
];
