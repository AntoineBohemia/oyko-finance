import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const registerSchema = z.object({
  email: z.email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  prenom: z.string().min(1, "Prénom requis"),
  nom: z.string().min(1, "Nom requis"),
});

export const createTransactionSchema = z.object({
  montant: z.number().refine((v) => v !== 0, "Le montant ne peut pas être zéro"),
  compteId: z.string().min(1, "Compte requis"),
  description: z.string().optional(),
  type: z.enum(["depense", "revenu", "fixe"]),
  dateTransaction: z.string().min(1, "Date requise"),
  categorieId: z.string().optional(),
  notes: z.string().optional(),
});

export const createRecurringChargeSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  montant: z.number().min(0.01, "Montant minimum : 0,01 €"),
  frequence: z.enum(["hebdo", "mensuel", "trimestriel", "annuel"]),
  jourDuMois: z.number().min(1).max(31).optional(),
  categorieId: z.string().optional(),
  compteId: z.string().optional(),
  notes: z.string().optional(),
});

export const createInvestmentSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  type: z.string().min(1, "Type requis"),
  prixActuel: z.number().min(0, "Prix actuel invalide"),
  ticker: z.string().optional(),
  plateforme: z.string().optional(),
  quantite: z.number().optional(),
  prixAchatUnitaire: z.number().optional(),
  dateAchat: z.string().optional(),
  notes: z.string().optional(),
});

export const createLiabilitySchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  type: z.string().min(1, "Type requis"),
  capitalInitial: z.number().min(0, "Capital initial invalide"),
  capitalRestant: z.number().min(0, "Capital restant invalide"),
  preteur: z.string().optional(),
  tauxInteret: z.number().optional(),
  mensualite: z.number().optional(),
  jourPrelevement: z.number().min(1).max(31).optional(),
  notes: z.string().optional(),
});

export const createAccountSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  type: z.enum(["courant", "epargne", "cash", "investissement"]),
  solde: z.number(),
  banque: z.string().optional(),
});

export const createCategorySchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  type: z.string().min(1, "Type requis"),
  icone: z.string().optional(),
  couleur: z.string().optional(),
  budgetMensuel: z.number().optional(),
});

export const updateProfileSchema = z.object({
  prenom: z.string().optional(),
  nom: z.string().optional(),
  revenusMensuels: z.number().optional(),
  objectifEpargne: z.number().optional(),
  modeGestion: z.enum(["semaine", "mois"]).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
