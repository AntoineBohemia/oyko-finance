export const queryKeys = {
  auth: { me: ["auth", "me"] as const },
  profile: { detail: ["profile"] as const },
  accounts: {
    all: ["accounts"] as const,
    detail: (id: string) => ["accounts", id] as const,
  },
  categories: {
    all: (type?: string) => ["categories", { type }] as const,
  },
  transactions: {
    all: (filters?: Record<string, unknown>) =>
      ["transactions", filters] as const,
    detail: (id: string) => ["transactions", id] as const,
  },
  recurringCharges: {
    all: ["recurring-charges"] as const,
    detail: (id: string) => ["recurring-charges", id] as const,
  },
  budget: {
    monthly: (month?: number, year?: number) =>
      ["budget", { month, year }] as const,
  },
  dashboard: { overview: ["dashboard"] as const },
  investments: {
    all: ["investments"] as const,
    detail: (id: string) => ["investments", id] as const,
  },
  liabilities: {
    all: ["liabilities"] as const,
    detail: (id: string) => ["liabilities", id] as const,
  },
  patrimoine: { all: ["patrimoine"] as const },
  parametres: { all: ["parametres"] as const },
  bank: { all: ["bank"] as const },
} as const;
