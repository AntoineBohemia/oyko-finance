import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  createAccountSchema,
  createTransactionSchema,
  createRecurringChargeSchema,
} from "../schemas";

describe("loginSchema", () => {
  it("should validate a correct login", () => {
    const result = loginSchema.safeParse({
      email: "test@email.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@email.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("should validate a correct registration", () => {
    const result = registerSchema.safeParse({
      email: "test@email.com",
      password: "password123",
      prenom: "Antoine",
      nom: "Test",
    });
    expect(result.success).toBe(true);
  });

  it("should reject short password", () => {
    const result = registerSchema.safeParse({
      email: "test@email.com",
      password: "short",
      prenom: "Antoine",
      nom: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty prenom", () => {
    const result = registerSchema.safeParse({
      email: "test@email.com",
      password: "password123",
      prenom: "",
      nom: "Test",
    });
    expect(result.success).toBe(false);
  });
});

describe("createAccountSchema", () => {
  it("should validate a correct account", () => {
    const result = createAccountSchema.safeParse({
      nom: "Compte courant",
      type: "courant",
      solde: 1000,
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid type", () => {
    const result = createAccountSchema.safeParse({
      nom: "Compte",
      type: "invalid",
      solde: 1000,
    });
    expect(result.success).toBe(false);
  });
});

describe("createTransactionSchema", () => {
  it("should validate a correct transaction", () => {
    const result = createTransactionSchema.safeParse({
      montant: -42.3,
      compteId: "cpt-1",
      type: "depense",
      dateTransaction: "2025-06-01",
    });
    expect(result.success).toBe(true);
  });

  it("should reject zero amount", () => {
    const result = createTransactionSchema.safeParse({
      montant: 0,
      compteId: "cpt-1",
      type: "depense",
      dateTransaction: "2025-06-01",
    });
    expect(result.success).toBe(false);
  });
});

describe("createRecurringChargeSchema", () => {
  it("should validate a correct charge", () => {
    const result = createRecurringChargeSchema.safeParse({
      nom: "Netflix",
      montant: 13.49,
      frequence: "mensuel",
    });
    expect(result.success).toBe(true);
  });

  it("should reject zero amount", () => {
    const result = createRecurringChargeSchema.safeParse({
      nom: "Netflix",
      montant: 0,
      frequence: "mensuel",
    });
    expect(result.success).toBe(false);
  });
});
