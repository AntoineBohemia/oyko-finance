// ─── Demo seed data ─────────────────────────────────────────────────────────
// Fictional user: Camille, 38 ans, cadre — realistic French personal finance.
// Used by the "demo mode" onboarding flow.
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_PROFILE = {
    revenus_mensuels: 4200,
    objectif_epargne: 600,
    mode_gestion: "complet",
};

export const DEMO_COMPTES = [
    { nom: "Compte courant", banque: "BNP Paribas", type: "courant", solde: 2450 },
    { nom: "Livret A", banque: "BNP Paribas", type: "epargne", solde: 8500 },
    { nom: "Compte joint", banque: "Boursorama", type: "courant", solde: 1850 },
    { nom: "Cash", banque: "", type: "cash", solde: 350 },
];

export const DEMO_CHARGES_FIXES = [
    { nom: "Loyer", montant: 950, jour_prelevement: 5 },
    { nom: "Électricité", montant: 65, jour_prelevement: 10 },
    { nom: "Forfait mobile", montant: 19.99, jour_prelevement: 15 },
    { nom: "Netflix", montant: 13.49, jour_prelevement: 20 },
    { nom: "Salle de sport", montant: 39.99, jour_prelevement: 25 },
];

export const DEMO_ENVELOPPES = [
    { nom: "Alimentation", budget: 450 },
    { nom: "Transport", budget: 120 },
    { nom: "Loisirs", budget: 200 },
    { nom: "Vêtements", budget: 100 },
    { nom: "Imprévus", budget: 80 },
];

// ─── Transactions ────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
}

export function getDemoTransactions(): Array<{
    description: string;
    montant: number;
    type: "DEBIT" | "CREDIT";
    categorie: string;
    dateTransaction: string;
}> {
    return [
        // Salaire
        { description: "Virement Salaire", montant: 4200, type: "CREDIT", categorie: "Salaire", dateTransaction: daysAgo(11) },

        // Alimentation (~8)
        { description: "Carrefour Market", montant: -85.40, type: "DEBIT", categorie: "Alimentation", dateTransaction: daysAgo(1) },
        { description: "Monoprix", montant: -42.30, type: "DEBIT", categorie: "Alimentation", dateTransaction: daysAgo(3) },
        { description: "Boulangerie Paul", montant: -8.50, type: "DEBIT", categorie: "Alimentation", dateTransaction: daysAgo(5) },
        { description: "Uber Eats", montant: -22.90, type: "DEBIT", categorie: "Alimentation", dateTransaction: daysAgo(7) },
        { description: "Picard Surgelés", montant: -34.60, type: "DEBIT", categorie: "Alimentation", dateTransaction: daysAgo(10) },
        { description: "Lidl", montant: -53.20, type: "DEBIT", categorie: "Alimentation", dateTransaction: daysAgo(14) },
        { description: "Carrefour Express", montant: -18.70, type: "DEBIT", categorie: "Alimentation", dateTransaction: daysAgo(19) },
        { description: "Monoprix", montant: -67.80, type: "DEBIT", categorie: "Alimentation", dateTransaction: daysAgo(24) },

        // Transport (~4)
        { description: "RATP Navigo", montant: -86.40, type: "DEBIT", categorie: "Transport", dateTransaction: daysAgo(2) },
        { description: "Uber", montant: -14.50, type: "DEBIT", categorie: "Transport", dateTransaction: daysAgo(8) },
        { description: "Total Energies (essence)", montant: -62.30, type: "DEBIT", categorie: "Transport", dateTransaction: daysAgo(16) },
        { description: "SNCF Voyages", montant: -6.40, type: "DEBIT", categorie: "Transport", dateTransaction: daysAgo(22) },

        // Loisirs (~6)
        { description: "Fnac", montant: -29.90, type: "DEBIT", categorie: "Loisirs", dateTransaction: daysAgo(2) },
        { description: "Amazon", montant: -45.00, type: "DEBIT", categorie: "Loisirs", dateTransaction: daysAgo(6) },
        { description: "Cinéma Pathé", montant: -12.50, type: "DEBIT", categorie: "Loisirs", dateTransaction: daysAgo(9) },
        { description: "Spotify Premium", montant: -10.99, type: "DEBIT", categorie: "Loisirs", dateTransaction: daysAgo(13) },
        { description: "Steam", montant: -19.99, type: "DEBIT", categorie: "Loisirs", dateTransaction: daysAgo(18) },
        { description: "UGC Illimité", montant: -21.90, type: "DEBIT", categorie: "Loisirs", dateTransaction: daysAgo(26) },

        // Vêtements (~3)
        { description: "Zara", montant: -59.90, type: "DEBIT", categorie: "Vêtements", dateTransaction: daysAgo(4) },
        { description: "H&M", montant: -25.00, type: "DEBIT", categorie: "Vêtements", dateTransaction: daysAgo(12) },
        { description: "Nike Store", montant: -89.00, type: "DEBIT", categorie: "Vêtements", dateTransaction: daysAgo(21) },

        // Imprévus (~3)
        { description: "Pharmacie Monge", montant: -18.50, type: "DEBIT", categorie: "Imprévus", dateTransaction: daysAgo(3) },
        { description: "Serrurier Dépannage", montant: -65.00, type: "DEBIT", categorie: "Imprévus", dateTransaction: daysAgo(15) },
        { description: "Pressing 5 à Sec", montant: -12.00, type: "DEBIT", categorie: "Imprévus", dateTransaction: daysAgo(23) },

        // Restaurants (~5)
        { description: "McDonald's", montant: -12.40, type: "DEBIT", categorie: "Restaurants", dateTransaction: daysAgo(1) },
        { description: "Sushi Shop", montant: -28.90, type: "DEBIT", categorie: "Restaurants", dateTransaction: daysAgo(5) },
        { description: "Pizza Hut", montant: -22.50, type: "DEBIT", categorie: "Restaurants", dateTransaction: daysAgo(11) },
        { description: "Bistrot du Coin", montant: -35.00, type: "DEBIT", categorie: "Restaurants", dateTransaction: daysAgo(17) },
        { description: "Flunch", montant: -14.90, type: "DEBIT", categorie: "Restaurants", dateTransaction: daysAgo(27) },

        // Extra day-to-day transactions to reach ~40
        { description: "Boulangerie du Marais", montant: -9.20, type: "DEBIT", categorie: "Alimentation", dateTransaction: daysAgo(0) },
        { description: "Relay (presse)", montant: -6.50, type: "DEBIT", categorie: "Loisirs", dateTransaction: daysAgo(4) },
        { description: "Deliveroo", montant: -19.80, type: "DEBIT", categorie: "Restaurants", dateTransaction: daysAgo(8) },
        { description: "Decathlon", montant: -34.90, type: "DEBIT", categorie: "Loisirs", dateTransaction: daysAgo(20) },
        { description: "Pharmacie Lafayette", montant: -14.30, type: "DEBIT", categorie: "Imprévus", dateTransaction: daysAgo(25) },
        { description: "Franprix", montant: -27.60, type: "DEBIT", categorie: "Alimentation", dateTransaction: daysAgo(28) },
        { description: "Bolt", montant: -9.80, type: "DEBIT", categorie: "Transport", dateTransaction: daysAgo(29) },
        { description: "Le Petit Cler", montant: -32.00, type: "DEBIT", categorie: "Restaurants", dateTransaction: daysAgo(13) },
    ];
}

// ─── Investissements ─────────────────────────────────────────────────────────

export const DEMO_INVESTISSEMENTS = [
    { nom: "MSCI World ETF", ticker: "CW8", type: "ETF", plateforme: "Boursorama PEA", quantite: 15, prixAchatUnitaire: 380, prixActuel: 420, dateAchat: "2024-03-15" },
    { nom: "S&P 500 ETF", ticker: "ESE", type: "ETF", plateforme: "Boursorama PEA", quantite: 10, prixAchatUnitaire: 350, prixActuel: 390, dateAchat: "2024-06-01" },
    { nom: "Bitcoin", ticker: "BTC", type: "CRYPTO", plateforme: "Binance", quantite: 0.15, prixAchatUnitaire: 28000, prixActuel: 38000, dateAchat: "2023-11-20" },
    { nom: "Ethereum", ticker: "ETH", type: "CRYPTO", plateforme: "Binance", quantite: 2, prixAchatUnitaire: 1800, prixActuel: 1650, dateAchat: "2024-01-10" },
    { nom: "SCPI Corum", ticker: "CORUM", type: "REAL_ESTATE", plateforme: "Corum", quantite: 1, prixAchatUnitaire: 5000, prixActuel: 5200, dateAchat: "2023-06-01" },
    { nom: "Assurance Vie Linxea", ticker: "AV", type: "INSURANCE", plateforme: "Linxea", quantite: 1, prixAchatUnitaire: 3000, prixActuel: 3100, dateAchat: "2022-01-15" },
];

// ─── Dettes ──────────────────────────────────────────────────────────────────

export const DEMO_DETTES = [
    { nom: "Prêt étudiant", type: "STUDENT", preteur: "BNP Paribas", capitalInitial: 8000, capitalRestant: 3200, mensualite: 150, jourPrelevement: 5, dateDebut: "2022-09-01" },
    { nom: "Crédit consommation", type: "CONSUMER", preteur: "Cetelem", capitalInitial: 3000, capitalRestant: 1150, mensualite: 120, jourPrelevement: 10, dateDebut: "2024-06-01" },
];
