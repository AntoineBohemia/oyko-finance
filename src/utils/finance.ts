import type { FC } from "react";

// ============================================
// ENUMS / TYPES LITTÉRAUX
// ============================================

export type TransactionType = "Dépense" | "Revenu" | "Transfert" | "Investissement" | "Remboursement";

export type CompteStatut = "Actif" | "Gelé" | "Fermé";

export type CompteType = "Courant" | "Épargne" | "Cash" | "Investissement";

export type Frequence = "Mensuel" | "Annuel" | "Trimestriel" | "Hebdo";

export type MoyenPaiement = "CB" | "Espèces" | "Virement" | "Prélèvement";

export type InvestissementType = "ETF" | "Actions" | "Crypto" | "Immobilier" | "Obligations";

export type DetteType = "Prêt étudiant" | "Prêt conso" | "Avance famille" | "Prêt immobilier";

export type DetteStatut = "En cours" | "Remboursé" | "En pause";

// ============================================
// INTERFACES - ENTITÉS PRINCIPALES
// ============================================

export interface Compte {
    id: string;
    nom: string;
    type: CompteType;
    banque: string;
    solde: number;
    soldeInitial: number;
    statut: CompteStatut;
    numeroCarte?: string;
    plafond?: number;
    icon: FC<{ className?: string }>;
    couleur: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Categorie {
    id: string;
    nom: string;
    type: "Dépense" | "Revenu";
    icone: string;
    couleur: string;
    budgetMensuel?: number;
}

export interface Transaction {
    id: string;
    description: string;
    initials: string;
    avatarUrl?: string;
    montant: number;
    date: Date;
    type: TransactionType;
    categorie: Categorie;
    compte: Compte;
    compteDestination?: Compte;
    moyenPaiement: MoyenPaiement;
    abonnement?: Abonnement;
    dette?: Dette;
    investissement?: Investissement;
    notes?: string;
    recu?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Investissement {
    id: string;
    nom: string;
    type: InvestissementType;
    ticker: string;
    plateforme: string;
    quantite: number;
    prixAchat: number;
    prixActuel: number;
    dateAchat: Date;
    strategie?: string;
    couleur: string;
    notes?: string;
}

export interface Abonnement {
    id: string;
    nom: string;
    montant: number;
    frequence: Frequence;
    jourPrelevement: number;
    dateProchain: Date;
    dateDebut: Date;
    actif: boolean;
    accepte: boolean;
    categorie: Categorie;
    compte: Compte;
    icone: string;
    urlGestion?: string;
    notes?: string;
}

export interface Dette {
    id: string;
    nom: string;
    type: DetteType;
    creancier: string;
    montantInitial: number;
    montantRestant: number;
    tauxInteret: number;
    mensualite: number;
    jourPrelevement: number;
    dateDebut: Date;
    dateFin?: Date;
    statut: DetteStatut;
    compte: Compte;
    notes?: string;
}

export interface Budget {
    id: string;
    categorie: Categorie;
    montant: number;
    mois: string; // Format "YYYY-MM"
    depense: number;
}

// ============================================
// INTERFACES - DONNÉES CALCULÉES
// ============================================

export interface ResumeFinancier {
    totalComptes: number;
    totalInvestissements: number;
    totalDettes: number;
    valeurNette: number;
    revenusMois: number;
    depensesMois: number;
    balanceMois: number;
    coutAbonnementsMensuel: number;
    detteMensuelle: number;
    plusValueInvestissements: number;
    plusValuePct: number;
    tauxEpargne: number;
}

export interface EvolutionPatrimoine {
    date: string;
    total: number;
    courant: number;
    epargne: number;
    investissement: number;
}

export interface DepenseCategorie {
    nom: string;
    montant: number;
    budget: number;
    couleur: string;
    icone: string;
    pourcentage: number;
}

export interface RevenuCategorie {
    nom: string;
    montant: number;
    couleur: string;
    icone: string;
}

export interface RepartitionPatrimoine {
    nom: string;
    montant: number;
    couleur: string;
    pourcentage: number;
}

// ============================================
// INTERFACES - FORMULAIRES
// ============================================

export interface NewTransactionForm {
    type: TransactionType;
    description: string;
    montant: string;
    date: Date;
    compteId: string;
    compteDestinationId?: string;
    categorieId: string;
    moyenPaiement: MoyenPaiement;
    abonnementId?: string;
    detteId?: string;
    investissementId?: string;
    notes: string;
    isRecurrent: boolean;
}

export interface NewCompteForm {
    nom: string;
    type: CompteType;
    banque: string;
    soldeInitial: string;
    numeroCarte?: string;
    plafond?: string;
    notes?: string;
}

export interface NewAbonnementForm {
    nom: string;
    montant: string;
    frequence: Frequence;
    jourPrelevement: string;
    dateProchain: Date;
    categorieId: string;
    compteId: string;
    urlGestion?: string;
    notes?: string;
}

export interface NewInvestissementForm {
    nom: string;
    type: InvestissementType;
    ticker: string;
    plateforme: string;
    quantite: string;
    prixAchat: string;
    dateAchat: Date;
    strategie?: string;
    notes?: string;
}

export interface NewDetteForm {
    nom: string;
    type: DetteType;
    creancier: string;
    montantInitial: string;
    tauxInteret: string;
    mensualite: string;
    jourPrelevement: string;
    dateDebut: Date;
    compteId: string;
    notes?: string;
}

// ============================================
// INTERFACES - FILTRES
// ============================================

export interface TransactionFilters {
    periode: string;
    type: string;
    categorieId: string;
    compteId: string;
    searchQuery: string;
}

export interface CompteFilters {
    statut: string;
    type: string;
}

export interface AbonnementFilters {
    statut: string;
    frequence: string;
    categorieId: string;
}

export interface InvestissementFilters {
    type: string;
    plateforme: string;
    strategie: string;
}

// ============================================
// DONNÉES PARTAGÉES - CATÉGORIES
// ============================================

export const categoriesData: Omit<Categorie, "budgetMensuel">[] = [
    { id: "cat-1", nom: "Alimentation", type: "Dépense", icone: "🍔", couleur: "#ef4444" },
    { id: "cat-2", nom: "Transport", type: "Dépense", icone: "🚇", couleur: "#f97316" },
    { id: "cat-3", nom: "Logement", type: "Dépense", icone: "🏠", couleur: "#eab308" },
    { id: "cat-4", nom: "Abonnements", type: "Dépense", icone: "📺", couleur: "#22c55e" },
    { id: "cat-5", nom: "Sorties", type: "Dépense", icone: "🎉", couleur: "#3b82f6" },
    { id: "cat-6", nom: "Santé", type: "Dépense", icone: "💊", couleur: "#8b5cf6" },
    { id: "cat-7", nom: "Vêtements", type: "Dépense", icone: "👕", couleur: "#ec4899" },
    { id: "cat-8", nom: "Investissement", type: "Dépense", icone: "📈", couleur: "#14b8a6" },
    { id: "cat-9", nom: "Courses", type: "Dépense", icone: "🛒", couleur: "#f43f5e" },
    { id: "cat-10", nom: "Salaire", type: "Revenu", icone: "💰", couleur: "#10b981" },
    { id: "cat-11", nom: "Freelance", type: "Revenu", icone: "💻", couleur: "#06b6d4" },
    { id: "cat-12", nom: "Aides", type: "Revenu", icone: "🏛️", couleur: "#6366f1" },
    { id: "cat-13", nom: "Remboursement", type: "Revenu", icone: "🔄", couleur: "#84cc16" },
];

// ============================================
// HELPERS - CALCULS FINANCIERS
// ============================================

/**
 * Calcule les totaux pour une liste de transactions
 */
export const calculateTotals = (items: { type: TransactionType; montant: number }[]) => {
    const revenus = items.filter((t) => t.type === "Revenu" || t.type === "Remboursement").reduce((acc, t) => acc + t.montant, 0);
    const depenses = items
        .filter((t) => t.type === "Dépense" || t.type === "Investissement")
        .reduce((acc, t) => acc + Math.abs(t.montant), 0);
    return { revenus, depenses, balance: revenus - depenses };
};

/**
 * Calcule la valeur totale d'un portefeuille d'investissements
 */
export const calculateInvestmentValue = (investments: Pick<Investissement, "quantite" | "prixActuel">[]) => {
    return investments.reduce((acc, inv) => acc + inv.quantite * inv.prixActuel, 0);
};

/**
 * Calcule la plus-value d'un investissement
 */
export const calculateInvestmentGain = (investment: Pick<Investissement, "quantite" | "prixAchat" | "prixActuel">) => {
    const valeurActuelle = investment.quantite * investment.prixActuel;
    const valeurInvestie = investment.quantite * investment.prixAchat;
    const gain = valeurActuelle - valeurInvestie;
    const gainPct = valeurInvestie > 0 ? (gain / valeurInvestie) * 100 : 0;
    return { valeurActuelle, valeurInvestie, gain, gainPct };
};

/**
 * Calcule le taux d'épargne
 */
export const calculateSavingsRate = (revenus: number, depenses: number): number => {
    if (revenus <= 0) return 0;
    return ((revenus - depenses) / revenus) * 100;
};

/**
 * Groupe les transactions par jour
 */
export const groupTransactionsByDay = <T extends { date: Date; montant: number }>(items: T[]) => {
    const groups: Record<string, T[]> = {};

    items.forEach((t) => {
        const dayKey = `${t.date.getFullYear()}-${t.date.getMonth()}-${t.date.getDate()}`;
        if (!groups[dayKey]) {
            groups[dayKey] = [];
        }
        groups[dayKey].push(t);
    });

    return Object.entries(groups)
        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
        .map(([date, transactions]) => ({
            date,
            label: new Date(transactions[0].date).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
            }),
            transactions,
            total: transactions.reduce((acc, t) => acc + t.montant, 0),
        }));
};

/**
 * Obtient les dépenses par catégorie
 */
export const getExpensesByCategory = <T extends { type: TransactionType; montant: number; categorie: { nom: string; icone: string; couleur: string } }>(
    items: T[],
    limit?: number,
) => {
    const categoriesMap = items
        .filter((t) => t.type === "Dépense")
        .reduce(
            (acc, t) => {
                const cat = t.categorie.nom;
                acc[cat] = (acc[cat] || 0) + Math.abs(t.montant);
                return acc;
            },
            {} as Record<string, number>,
        );

    const result = Object.entries(categoriesMap)
        .sort(([, a], [, b]) => b - a)
        .map(([nom, montant]) => {
            const categorie = categoriesData.find((c) => c.nom === nom);
            return { nom, montant, icone: categorie?.icone, couleur: categorie?.couleur };
        });

    return limit ? result.slice(0, limit) : result;
};
