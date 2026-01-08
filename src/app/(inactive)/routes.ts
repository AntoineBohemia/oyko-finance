/**
 * STRUCTURE DES ROUTES - APPLICATION FINANCE
 * ==========================================
 *
 * Cette application utilise le App Router de Next.js avec un groupe de routes (app).
 *
 * STRUCTURE DES FICHIERS:
 *
 * app/
 * ├── (app)/                          # Groupe de routes (pas d'impact sur l'URL)
 * │   ├── layout.tsx                  # Layout partagé avec sidebar navigation
 * │   ├── dashboard/
 * │   │   └── page.tsx                # /dashboard - Vue d'ensemble
 * │   ├── transactions/
 * │   │   └── page.tsx                # /transactions - Liste des transactions
 * │   ├── comptes/
 * │   │   └── page.tsx                # /comptes - Gestion des comptes
 * │   ├── budget/
 * │   │   └── page.tsx                # /budget - Suivi des budgets
 * │   ├── investissements/
 * │   │   └── page.tsx                # /investissements - Portfolio
 * │   ├── abonnements/
 * │   │   └── page.tsx                # /abonnements - Prélèvements récurrents
  * │   ├── dettes/
 * │   │   └── page.tsx                # /dettes - Emprunts et remboursements
 * │   └── settings/
 * │       └── page.tsx                # /settings - Paramètres
 * └── page.tsx                        # Redirect vers /dashboard
 *
 *
 * NAVIGATION:
 * -----------
 *
 * Sidebar (desktop): SidebarNavigationSlim avec icônes
 * Mobile: Drawer navigation avec menu hamburger
 *
 * Items principaux:
 * - Dashboard (HomeLine)
 * - Transactions (Receipt) - avec badge count
 * - Comptes (CreditCard01)
 * - Budget (PieChart03)
 * - Investissements (LineChartUp03)
 * - Abonnements (RefreshCcw01)
  * - Dettes (Wallet02)
 *
 * Items footer:
 * - Support (LifeBuoy01)
 * - Paramètres (Settings01)
 */

export const routes = {
    dashboard: "/dashboard",
    transactions: "/transactions",
    comptes: "/comptes",
    budget: "/budget",
    investissements: "/investissements",
    abonnements: "/abonnements",
        dettes: "/dettes",
    settings: "/settings",
    support: "/support",
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];
