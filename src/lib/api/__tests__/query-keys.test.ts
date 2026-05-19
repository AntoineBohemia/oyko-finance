import { describe, it, expect } from "vitest";
import { queryKeys } from "../query-keys";

describe("queryKeys", () => {
  it("should return auth me key", () => {
    expect(queryKeys.auth.me).toEqual(["auth", "me"]);
  });

  it("should return dashboard overview key", () => {
    expect(queryKeys.dashboard.overview).toEqual(["dashboard"]);
  });

  it("should return budget monthly key with params", () => {
    expect(queryKeys.budget.monthly(5, 2025)).toEqual([
      "budget",
      { month: 5, year: 2025 },
    ]);
  });

  it("should return transactions key with filters", () => {
    const filters = { period: "this-week" };
    expect(queryKeys.transactions.all(filters)).toEqual([
      "transactions",
      filters,
    ]);
  });

  it("should return transactions detail key", () => {
    expect(queryKeys.transactions.detail("tx-1")).toEqual([
      "transactions",
      "tx-1",
    ]);
  });

  it("should return accounts keys", () => {
    expect(queryKeys.accounts.all).toEqual(["accounts"]);
    expect(queryKeys.accounts.detail("acc-1")).toEqual(["accounts", "acc-1"]);
  });

  it("should return categories key with optional type", () => {
    expect(queryKeys.categories.all("depense")).toEqual([
      "categories",
      { type: "depense" },
    ]);
    expect(queryKeys.categories.all()).toEqual([
      "categories",
      { type: undefined },
    ]);
  });

  it("should return investments keys", () => {
    expect(queryKeys.investments.all).toEqual(["investments"]);
    expect(queryKeys.investments.detail("inv-1")).toEqual([
      "investments",
      "inv-1",
    ]);
  });

  it("should return liabilities keys", () => {
    expect(queryKeys.liabilities.all).toEqual(["liabilities"]);
  });

  it("should return recurring charges keys", () => {
    expect(queryKeys.recurringCharges.all).toEqual(["recurring-charges"]);
  });
});
