import type { DashboardData, CategorieVariable, ChargeFixAvecDate, TransactionAvecCategorie, PatrimoineData, PatrimoineRepartition } from "@/lib/data/dashboard";
import type { BudgetData, Enveloppe, ChargeFixBudget, TransactionBudget } from "@/lib/data/budget";
import type { DepensesData, CompteDepense, CategorieDepense, TransactionDepense } from "@/lib/data/depenses";
import type { PatrimoineData as PatrimoinePageData, ComptePatrimoine, InvestissementPatrimoine, DettePatrimoine, EvolutionPatrimoine, TotauxPatrimoine } from "@/lib/data/patrimoine";
import type { InvestissementsData, InvestissementPortfolio, EvolutionPortfolio, RepartitionType, TotauxInvestissements, PerformanceAnnuelle } from "@/lib/data/investissements";
import type { DettesPageData, DetteData } from "@/lib/data/dettes";
import type { ChargesFixesData, ChargeFixePortfolio, RepartitionCategorie, TotauxChargesFixes } from "@/lib/data/charges-fixes";
import type { ParametresData, CategorieParametres, ChargeFixParametres, CompteParametres } from "@/lib/data/parametres";
import type { Profile } from "@/types/api";

// ============================================
// PROFIL MOCK
// ============================================

const mockProfile: Profile = {
    id: "dev-user-00000",
    prenom: "Antoine",
    nom: "Dev",
    email: "dev@oyko.space",
    revenus_mensuels: 3200,
    objectif_epargne: 400,
    mode_gestion: "semaine",
    avatar_url: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-06-01T00:00:00Z",
    salaire_attendu: 3200,
    salaire_patterns: ["VIREMENT SALAIRE"],
    salaire_recu_ce_mois: true,
    premier_jour_semaine: 1,
} as Profile;

// ============================================
// HELPERS
// ============================================

function daysAgo(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(12, 0, 0, 0);
    return d;
}

function futureDay(day: number): Date {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    if (d <= now) d.setMonth(d.getMonth() + 1);
    return d;
}

const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

// ============================================
// DASHBOARD MOCK
// ============================================

const mockCategories: CategorieVariable[] = [
    { id: "cat-1", nom: "Alimentation", icone: "🍔", couleur: "#f97316", budgetMensuel: 400 },
    { id: "cat-2", nom: "Transport", icone: "🚇", couleur: "#3b82f6", budgetMensuel: 100 },
    { id: "cat-3", nom: "Loisirs", icone: "🎮", couleur: "#8b5cf6", budgetMensuel: 150 },
    { id: "cat-4", nom: "Vêtements", icone: "👕", couleur: "#ec4899", budgetMensuel: 100 },
    { id: "cat-5", nom: "Imprévus", icone: "🚨", couleur: "#ef4444", budgetMensuel: 100 },
];

const mockChargesFixes: ChargeFixAvecDate[] = [
    { id: "cf-1", nom: "Loyer", montant: 850, icone: "🏠", dateProchain: futureDay(5) },
    { id: "cf-2", nom: "Électricité", montant: 65, icone: "⚡", dateProchain: futureDay(10) },
    { id: "cf-3", nom: "Téléphone", montant: 19.99, icone: "📱", dateProchain: futureDay(15) },
    { id: "cf-4", nom: "Internet", montant: 29.99, icone: "🌐", dateProchain: futureDay(15) },
    { id: "cf-5", nom: "Netflix", montant: 13.49, icone: "📺", dateProchain: futureDay(20) },
    { id: "cf-6", nom: "Spotify", montant: 9.99, icone: "🎵", dateProchain: futureDay(20) },
    { id: "cf-7", nom: "Salle de sport", montant: 39.99, icone: "💪", dateProchain: futureDay(1) },
    { id: "cf-8", nom: "Assurance habitation", montant: 25, icone: "🛡️", dateProchain: futureDay(8) },
];

const mockTransactions: TransactionAvecCategorie[] = [
    { id: "tx-1", description: "Carrefour Market", montant: -42.30, date: daysAgo(0), categorieId: "cat-1", type: "variable" },
    { id: "tx-2", description: "RATP Navigo", montant: -86.40, date: daysAgo(1), categorieId: "cat-2", type: "fixe" },
    { id: "tx-3", description: "Amazon Prime", montant: -6.99, date: daysAgo(1), categorieId: "cat-3", type: "variable" },
    { id: "tx-4", description: "Boulangerie Paul", montant: -8.50, date: daysAgo(2), categorieId: "cat-1", type: "variable" },
    { id: "tx-5", description: "Uber Eats", montant: -22.90, date: daysAgo(2), categorieId: "cat-1", type: "variable" },
    { id: "tx-6", description: "Zara", montant: -59.99, date: daysAgo(3), categorieId: "cat-4", type: "variable" },
    { id: "tx-7", description: "Pharmacie", montant: -15.80, date: daysAgo(4), categorieId: "cat-5", type: "variable" },
    { id: "tx-8", description: "Monoprix", montant: -67.20, date: daysAgo(5), categorieId: "cat-1", type: "variable" },
    { id: "tx-9", description: "Fnac", montant: -34.99, date: daysAgo(6), categorieId: "cat-3", type: "variable" },
    { id: "tx-10", description: "Virement salaire", montant: 3200, date: daysAgo(8), categorieId: "", type: "revenu" },
];

const mockPatrimoine: PatrimoineData = {
    valeurNette: 42350,
    totalLiquidites: 8200,
    totalInvestissements: 38500,
    totalDettes: 4350,
    variationMois: 2.3,
    repartition: [
        { name: "Liquidités", value: 8200, className: "text-asset-liquidity" },
        { name: "ETF", value: 22000, className: "text-asset-stocks" },
        { name: "Crypto", value: 8500, className: "text-asset-crypto" },
        { name: "Immobilier", value: 5000, className: "text-asset-real-estate" },
        { name: "Épargne", value: 3000, className: "text-asset-savings" },
    ],
};

const mockComptes = [
    { id: "cpt-1", user_id: "dev-user-00000", nom: "Compte courant", banque: "BNP Paribas", type: "courant", solde: 2450, est_actif: true, ordre: 1, icone: "🏦", couleur: "#3b82f6", created_at: "", updated_at: "" },
    { id: "cpt-2", user_id: "dev-user-00000", nom: "Livret A", banque: "BNP Paribas", type: "epargne", solde: 3000, est_actif: true, ordre: 2, icone: "🐷", couleur: "#10b981", created_at: "", updated_at: "" },
    { id: "cpt-3", user_id: "dev-user-00000", nom: "Compte joint", banque: "Boursorama", type: "courant", solde: 1850, est_actif: true, ordre: 3, icone: "🏦", couleur: "#6366f1", created_at: "", updated_at: "" },
    { id: "cpt-4", user_id: "dev-user-00000", nom: "Cash", banque: "", type: "cash", solde: 900, est_actif: true, ordre: 4, icone: "💵", couleur: "#f59e0b", created_at: "", updated_at: "" },
];

export function getMockDashboardData(): DashboardData {
    return {
        profile: mockProfile,
        comptes: mockComptes as any,
        categories: mockCategories,
        chargesFixes: mockChargesFixes,
        transactions: mockTransactions,
        patrimoine: mockPatrimoine,
    };
}

// ============================================
// BUDGET MOCK
// ============================================

const mockEnveloppes: Enveloppe[] = mockCategories.map((c) => ({
    id: c.id,
    nom: c.nom,
    icone: c.icone,
    couleur: c.couleur,
    budgetMensuel: c.budgetMensuel,
}));

const mockChargesFixesBudget: ChargeFixBudget[] = mockChargesFixes.map((cf, i) => ({
    id: cf.id,
    nom: cf.nom,
    icone: cf.icone,
    montant: cf.montant,
    jourPrelevement: 5 + i * 3,
    estPreleve: i < 3,
}));

const mockTransactionsBudget: TransactionBudget[] = mockTransactions.map((t) => ({
    id: t.id,
    description: t.description,
    montant: t.montant,
    date: t.date,
    categorieId: t.categorieId,
    type: t.type,
}));

export function getMockBudgetData(): BudgetData {
    const totalChargesFixes = mockChargesFixesBudget.reduce((acc, c) => acc + c.montant, 0);
    return {
        profile: mockProfile,
        revenusMois: 3200,
        enveloppes: mockEnveloppes,
        chargesFixes: mockChargesFixesBudget,
        transactions: mockTransactionsBudget,
        totalChargesFixes,
    };
}

// ============================================
// DEPENSES MOCK
// ============================================

const mockComptesDepense: CompteDepense[] = mockComptes.map((c) => ({
    id: c.id,
    nom: c.nom,
    banque: c.banque,
}));

const mockCategoriesDepense: CategorieDepense[] = mockCategories.map((c) => ({
    id: c.id,
    nom: c.nom,
    icone: c.icone,
    couleur: c.couleur,
}));

const mockCategoriesRevenu: CategorieDepense[] = [
    { id: "cat-rev-1", nom: "Salaire", icone: "💰", couleur: "#10b981" },
    { id: "cat-rev-2", nom: "Freelance", icone: "💻", couleur: "#6366f1" },
];

const mockTransactionsDepense: TransactionDepense[] = mockTransactions.map((t) => {
    const cat = mockCategories.find((c) => c.id === t.categorieId);
    return {
        id: t.id,
        description: t.description,
        montant: t.montant,
        date: t.date,
        categorieId: t.categorieId || null,
        compteId: "cpt-1",
        type: t.type === "revenu" ? "revenu" : t.type === "fixe" ? "fixe" : "depense",
        categorieNom: cat?.nom ?? (t.type === "revenu" ? "Salaire" : null),
        categorieIcone: cat?.icone ?? (t.type === "revenu" ? "💰" : null),
        compteNom: "Compte courant",
    };
});

export function getMockDepensesData(): DepensesData {
    return {
        profile: mockProfile,
        comptes: mockComptesDepense,
        categoriesDepense: mockCategoriesDepense,
        categoriesRevenu: mockCategoriesRevenu,
        transactions: mockTransactionsDepense,
    };
}

// ============================================
// PATRIMOINE MOCK
// ============================================

const mockComptesPatrimoine: ComptePatrimoine[] = mockComptes.map((c) => ({
    id: c.id,
    nom: c.nom,
    type: c.type as any,
    banque: c.banque,
    solde: c.solde,
    icone: c.icone,
    couleur: c.couleur,
}));

const mockInvestissementsPatrimoine: InvestissementPatrimoine[] = [
    { id: "inv-1", nom: "MSCI World ETF", ticker: "CW8", type: "ETF", valeurActuelle: 12000, plusValue: 1800, plusValuePercent: 17.6, imageUrl: null },
    { id: "inv-2", nom: "S&P 500 ETF", ticker: "ESE", type: "ETF", valeurActuelle: 10000, plusValue: 2200, plusValuePercent: 28.2, imageUrl: null },
    { id: "inv-3", nom: "Bitcoin", ticker: "BTC", type: "Crypto", valeurActuelle: 5500, plusValue: 1500, plusValuePercent: 37.5, imageUrl: null },
    { id: "inv-4", nom: "Ethereum", ticker: "ETH", type: "Crypto", valeurActuelle: 3000, plusValue: -200, plusValuePercent: -6.25, imageUrl: null },
    { id: "inv-5", nom: "SCPI Corum", ticker: "", type: "Immobilier", valeurActuelle: 5000, plusValue: 250, plusValuePercent: 5.26, imageUrl: null },
    { id: "inv-6", nom: "Assurance Vie Linxea", ticker: "", type: "Assurance-vie", valeurActuelle: 3000, plusValue: 120, plusValuePercent: 4.17, imageUrl: null },
];

const mockDettesPatrimoine: DettePatrimoine[] = [
    { id: "det-1", nom: "Prêt étudiant", type: "etudiant", capitalRestant: 3200, capitalInitial: 8000, mensualite: 150, prochainPrelevement: futureDay(5), preteur: "BNP Paribas", imageUrl: null },
    { id: "det-2", nom: "Crédit conso", type: "conso", capitalRestant: 1150, capitalInitial: 3000, mensualite: 120, prochainPrelevement: futureDay(10), preteur: "Cetelem", imageUrl: null },
];

const mockEvolutionPatrimoine: EvolutionPatrimoine[] = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentYear, currentMonth - 11 + i, 1);
    const factor = 0.85 + i * 0.014;
    return {
        date: date.toISOString().split("T")[0],
        actifs: Math.round(46700 * factor),
        passifs: Math.round(6000 - i * 180),
        net: Math.round(46700 * factor - (6000 - i * 180)),
    };
});

export function getMockPatrimoineData(): PatrimoinePageData {
    const totalLiquidites = mockComptesPatrimoine.reduce((acc, c) => acc + c.solde, 0);
    const totalInvestissements = mockInvestissementsPatrimoine.reduce((acc, i) => acc + i.valeurActuelle, 0);
    const totalDettes = mockDettesPatrimoine.reduce((acc, d) => acc + d.capitalRestant, 0);
    const totalPlusValue = mockInvestissementsPatrimoine.reduce((acc, i) => acc + i.plusValue, 0);
    const totalInvestBase = totalInvestissements - totalPlusValue;

    return {
        profile: mockProfile,
        comptes: mockComptesPatrimoine,
        investissements: mockInvestissementsPatrimoine,
        dettes: mockDettesPatrimoine,
        evolutionPatrimoine: mockEvolutionPatrimoine,
        totaux: {
            totalLiquidites,
            totalInvestissements,
            totalActifs: totalLiquidites + totalInvestissements,
            totalDettes,
            valeurNette: totalLiquidites + totalInvestissements - totalDettes,
            totalPlusValue,
            totalPlusValuePercent: totalInvestBase > 0 ? (totalPlusValue / totalInvestBase) * 100 : 0,
            totalMensualitesDettes: mockDettesPatrimoine.reduce((acc, d) => acc + d.mensualite, 0),
        },
    };
}

// ============================================
// INVESTISSEMENTS MOCK
// ============================================

const mockInvestissementsPortfolio: InvestissementPortfolio[] = mockInvestissementsPatrimoine.map((inv) => {
    const prixAchat = inv.valeurActuelle - inv.plusValue;
    const quantite = inv.type === "Crypto" ? (inv.ticker === "BTC" ? 0.05 : 1.2) : (inv.type === "ETF" ? 25 : 1);
    return {
        id: inv.id,
        nom: inv.nom,
        ticker: inv.ticker,
        type: inv.type,
        plateforme: inv.type === "ETF" ? "Boursorama PEA" : inv.type === "Crypto" ? "Binance" : "Direct",
        quantite,
        prixAchat: prixAchat / quantite,
        prixActuel: inv.valeurActuelle / quantite,
        valeurAchat: prixAchat,
        valeurActuelle: inv.valeurActuelle,
        plusValue: inv.plusValue,
        plusValuePercent: inv.plusValuePercent,
        dateAchat: daysAgo(365 + Math.floor(Math.random() * 365)),
        imageUrl: null,
        notes: null,
    };
});

const mockEvolutionPortfolio: EvolutionPortfolio[] = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentYear, currentMonth - 11 + i, 1);
    const totalActuel = mockInvestissementsPatrimoine.reduce((acc, inv) => acc + inv.valeurActuelle, 0);
    return {
        date: date.toISOString().split("T")[0],
        valeur: Math.round(totalActuel * (0.82 + i * 0.016)),
        investi: Math.round((totalActuel - 5670) * (0.85 + i * 0.014)),
    };
});

const mockRepartitionType: RepartitionType[] = [
    { name: "ETF", value: 22000, className: "text-utility-brand-600" },
    { name: "Crypto", value: 8500, className: "text-utility-brand-400" },
    { name: "Immobilier", value: 5000, className: "text-utility-brand-500" },
    { name: "Assurance-vie", value: 3000, className: "text-utility-gray-400" },
];

export function getMockInvestissementsData(): InvestissementsData {
    const totalInvesti = mockInvestissementsPortfolio.reduce((acc, inv) => acc + inv.valeurAchat, 0);
    const totalActuel = mockInvestissementsPortfolio.reduce((acc, inv) => acc + inv.valeurActuelle, 0);
    const plusValue = totalActuel - totalInvesti;

    return {
        profile: mockProfile,
        investissements: mockInvestissementsPortfolio,
        evolutionPortfolio: mockEvolutionPortfolio,
        repartitionParType: mockRepartitionType,
        totaux: {
            totalInvesti,
            totalActuel,
            plusValue,
            plusValuePercent: totalInvesti > 0 ? (plusValue / totalInvesti) * 100 : 0,
            nombreActifs: mockInvestissementsPortfolio.length,
        },
        performanceAnnuelle: [
            { name: String(currentYear - 2), value: Math.round(totalActuel * 0.7), className: "text-utility-brand-400" },
            { name: String(currentYear - 1), value: Math.round(totalActuel * 0.85), className: "text-utility-brand-600" },
            { name: String(currentYear), value: totalActuel, className: "text-utility-brand-700" },
        ],
    };
}

// ============================================
// DETTES MOCK
// ============================================

const mockDettesDetaillees: DetteData[] = [
    {
        id: "det-1",
        nom: "Prêt étudiant",
        type: "etudiant",
        capitalInitial: 8000,
        capitalRestant: 3200,
        tauxAnnuel: 1.5,
        mensualite: 150,
        jourPrelevement: 5,
        dateDebut: new Date(2022, 0, 1),
        dateFin: new Date(2026, 6, 1),
        prochainPrelevement: futureDay(5),
        compteId: "cpt-1",
        compteNom: "Compte courant",
        preteur: "BNP Paribas",
        imageUrl: null,
        notes: "Prêt étudiant contracté en 2022",
    },
    {
        id: "det-2",
        nom: "Crédit conso TV",
        type: "conso",
        capitalInitial: 3000,
        capitalRestant: 1150,
        tauxAnnuel: 4.9,
        mensualite: 120,
        jourPrelevement: 10,
        dateDebut: new Date(2023, 5, 1),
        dateFin: new Date(2025, 11, 1),
        prochainPrelevement: futureDay(10),
        compteId: "cpt-1",
        compteNom: "Compte courant",
        preteur: "Cetelem",
        imageUrl: null,
        notes: null,
    },
];

export function getMockDettesData(): DettesPageData {
    return {
        profile: mockProfile,
        dettes: mockDettesDetaillees,
        comptes: mockComptes.map((c) => ({ id: c.id, nom: c.nom })),
    };
}

// ============================================
// CHARGES FIXES MOCK
// ============================================

const mockChargesFixesDetaillees: ChargeFixePortfolio[] = [
    { id: "cf-1", nom: "Loyer", montant: 850, frequence: "mensuel", jourPrelevement: 5, prochainPrelevement: futureDay(5), categorieId: null, categorieNom: "Logement", compteId: "cpt-1", compteNom: "Compte courant", estActif: true, dateDebut: new Date(2023, 0, 1), dateFin: null, notes: null, icone: "🏠", couleur: "#ef4444", coutMensuel: 850, coutAnnuel: 10200 },
    { id: "cf-2", nom: "Électricité", montant: 65, frequence: "mensuel", jourPrelevement: 10, prochainPrelevement: futureDay(10), categorieId: null, categorieNom: "Logement", compteId: "cpt-1", compteNom: "Compte courant", estActif: true, dateDebut: null, dateFin: null, notes: null, icone: "⚡", couleur: "#f59e0b", coutMensuel: 65, coutAnnuel: 780 },
    { id: "cf-3", nom: "Forfait mobile", montant: 19.99, frequence: "mensuel", jourPrelevement: 15, prochainPrelevement: futureDay(15), categorieId: null, categorieNom: "Telecom", compteId: "cpt-1", compteNom: "Compte courant", estActif: true, dateDebut: null, dateFin: null, notes: null, icone: "📱", couleur: "#10b981", coutMensuel: 19.99, coutAnnuel: 239.88 },
    { id: "cf-4", nom: "Internet Fibre", montant: 29.99, frequence: "mensuel", jourPrelevement: 15, prochainPrelevement: futureDay(15), categorieId: null, categorieNom: "Telecom", compteId: "cpt-1", compteNom: "Compte courant", estActif: true, dateDebut: null, dateFin: null, notes: null, icone: "🌐", couleur: "#10b981", coutMensuel: 29.99, coutAnnuel: 359.88 },
    { id: "cf-5", nom: "Netflix", montant: 13.49, frequence: "mensuel", jourPrelevement: 20, prochainPrelevement: futureDay(20), categorieId: null, categorieNom: "Streaming", compteId: "cpt-1", compteNom: "Compte courant", estActif: true, dateDebut: null, dateFin: null, notes: "Abonnement Standard", icone: "📺", couleur: "#7c3aed", coutMensuel: 13.49, coutAnnuel: 161.88 },
    { id: "cf-6", nom: "Spotify", montant: 9.99, frequence: "mensuel", jourPrelevement: 20, prochainPrelevement: futureDay(20), categorieId: null, categorieNom: "Musique", compteId: "cpt-1", compteNom: "Compte courant", estActif: true, dateDebut: null, dateFin: null, notes: null, icone: "🎵", couleur: "#ec4899", coutMensuel: 9.99, coutAnnuel: 119.88 },
    { id: "cf-7", nom: "Salle de sport", montant: 39.99, frequence: "mensuel", jourPrelevement: 1, prochainPrelevement: futureDay(1), categorieId: null, categorieNom: "Sport", compteId: "cpt-1", compteNom: "Compte courant", estActif: true, dateDebut: null, dateFin: null, notes: null, icone: "💪", couleur: "#f59e0b", coutMensuel: 39.99, coutAnnuel: 479.88 },
    { id: "cf-8", nom: "Assurance habitation", montant: 25, frequence: "mensuel", jourPrelevement: 8, prochainPrelevement: futureDay(8), categorieId: null, categorieNom: "Assurance", compteId: "cpt-1", compteNom: "Compte courant", estActif: true, dateDebut: null, dateFin: null, notes: null, icone: "🛡️", couleur: "#8b5cf6", coutMensuel: 25, coutAnnuel: 300 },
    { id: "cf-9", nom: "Amazon Prime", montant: 69.90, frequence: "annuel", jourPrelevement: 12, prochainPrelevement: futureDay(12), categorieId: null, categorieNom: "Streaming", compteId: "cpt-1", compteNom: "Compte courant", estActif: false, dateDebut: null, dateFin: null, notes: "Résilié", icone: "📦", couleur: "#6b7280", coutMensuel: 5.83, coutAnnuel: 69.90 },
];

export function getMockChargesFixesData(): ChargesFixesData {
    const chargesActives = mockChargesFixesDetaillees.filter((cf) => cf.estActif);
    const totalMensuel = chargesActives.reduce((acc, cf) => acc + cf.coutMensuel, 0);
    const totalAnnuel = chargesActives.reduce((acc, cf) => acc + cf.coutAnnuel, 0);

    const timeline = chargesActives
        .sort((a, b) => a.prochainPrelevement.getTime() - b.prochainPrelevement.getTime())
        .slice(0, 10);

    const categorieGroups = chargesActives.reduce((acc, cf) => {
        acc[cf.categorieNom] = (acc[cf.categorieNom] || 0) + cf.coutMensuel;
        return acc;
    }, {} as Record<string, number>);

    const COLORS: Record<string, string> = {
        Logement: "#ef4444", Telecom: "#10b981", Streaming: "#7c3aed",
        Musique: "#ec4899", Sport: "#f59e0b", Assurance: "#8b5cf6", Autre: "#6b7280",
    };

    const repartitionCategories: RepartitionCategorie[] = Object.entries(categorieGroups)
        .map(([name, value]) => ({ name, value, color: COLORS[name] || COLORS.Autre }))
        .sort((a, b) => b.value - a.value);

    return {
        profile: mockProfile,
        chargesFixes: mockChargesFixesDetaillees,
        comptes: mockComptes as any,
        categories: mockCategories as any,
        timeline,
        repartitionCategories,
        totaux: {
            nombreActifs: chargesActives.length,
            nombreInactifs: mockChargesFixesDetaillees.filter((cf) => !cf.estActif).length,
            totalMensuel,
            totalAnnuel,
            prochainPrelevement: timeline[0] || null,
        },
    };
}

// ============================================
// PARAMETRES MOCK
// ============================================

const mockCategoriesParametres: CategorieParametres[] = mockCategories.map((c) => ({
    id: c.id,
    nom: c.nom,
    budget: c.budgetMensuel,
    icone: c.icone,
    couleur: c.couleur,
}));

const mockChargesFixesParametres: ChargeFixParametres[] = mockChargesFixesDetaillees.map((cf) => ({
    id: cf.id,
    nom: cf.nom,
    montant: cf.montant,
    jourPrelevement: cf.jourPrelevement,
    icone: cf.icone ?? "💸",
    couleur: cf.couleur ?? "#6b7280",
    categorieNom: cf.categorieNom,
    actif: cf.estActif,
}));

const mockComptesParametres: CompteParametres[] = mockComptes.map((c) => ({
    id: c.id,
    nom: c.nom,
    banque: c.banque,
    solde: c.solde,
    type: c.type as any,
}));

export function getMockParametresData(): ParametresData {
    const totalChargesFixes = mockChargesFixesParametres
        .filter((c) => c.actif)
        .reduce((acc, c) => acc + c.montant, 0);
    const totalComptes = mockComptesParametres.reduce((acc, c) => acc + c.solde, 0);

    return {
        profile: mockProfile,
        categories: mockCategoriesParametres,
        chargesFixes: mockChargesFixesParametres,
        comptes: mockComptesParametres,
        totaux: { totalChargesFixes, totalComptes },
    };
}
