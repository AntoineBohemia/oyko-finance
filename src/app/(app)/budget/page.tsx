import { getBudgetData } from "@/lib/data/budget";
import { getDepensesData } from "@/lib/data/depenses";
import { getChargesFixesData } from "@/lib/data/charges-fixes";
import MonBudgetClient from "./mon-budget-client";
import type { Profile } from "@/types/api";

interface PageProps {
    searchParams: Promise<{
        tab?: string;
        month?: string;
        year?: string;
        periode?: string;
    }>;
}

export default async function BudgetPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const today = new Date();
    const month = params.month ? parseInt(params.month) : today.getMonth();
    const year = params.year ? parseInt(params.year) : today.getFullYear();
    const tab = (params.tab || "transactions") as "transactions" | "enveloppes" | "charges-fixes";
    const periode = params.periode || "this-week";

    // Fetcher toutes les données en parallele
    const [budgetData, depensesData, cfData] = await Promise.all([
        getBudgetData(month, year).catch(() => null),
        getDepensesData(periode).catch(() => null),
        getChargesFixesData().catch(() => null),
    ]);

    const emptyBudget = {
        profile: null as Profile | null,
        revenusMois: 0,
        totalChargesFixes: 0,
        enveloppes: [] as { id: string; nom: string; icone: string; couleur: string; budgetMensuel: number }[],
        transactions: [] as { id: string; description: string; montant: number; date: string; categorieId: string; type: "variable" | "fixe" | "revenu" }[],
    };

    const serializedBudgetSummary = budgetData ? {
        profile: budgetData.profile,
        revenusMois: budgetData.revenusMois,
        totalChargesFixes: budgetData.totalChargesFixes,
        enveloppes: budgetData.enveloppes,
        transactions: budgetData.transactions.map((t) => ({
            ...t,
            date: t.date.toISOString(),
        })),
    } : emptyBudget;

    const transactionsData = depensesData ? {
        ...depensesData,
        transactions: depensesData.transactions.map((t) => ({
            ...t,
            date: t.date.toISOString(),
        })),
    } : {
        profile: serializedBudgetSummary.profile,
        comptes: [],
        categoriesDepense: [],
        categoriesRevenu: [],
        transactions: [],
    };

    const enveloppesData = budgetData ? {
        profile: budgetData.profile,
        revenusMois: budgetData.revenusMois,
        enveloppes: budgetData.enveloppes,
        chargesFixes: budgetData.chargesFixes,
        transactions: budgetData.transactions.map((t) => ({
            ...t,
            date: t.date.toISOString(),
        })),
        totalChargesFixes: budgetData.totalChargesFixes,
    } : {
        profile: null,
        revenusMois: 0,
        enveloppes: [],
        chargesFixes: [],
        transactions: [],
        totalChargesFixes: 0,
    };

    const safeIso = (v: unknown): string => {
        if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString();
        if (typeof v === "string" && v) return v;
        return new Date().toISOString();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializeCf = (cf: any) => ({
        ...cf,
        prochainPrelevement: safeIso(cf.prochainPrelevement),
        dateDebut: cf.dateDebut ? safeIso(cf.dateDebut) : null,
        dateFin: cf.dateFin ? safeIso(cf.dateFin) : null,
    });

    const chargesFixesDataSerialized = cfData ? {
        ...cfData,
        chargesFixes: cfData.chargesFixes.map(serializeCf),
        timeline: cfData.timeline.map(serializeCf),
        totaux: {
            ...cfData.totaux,
            prochainPrelevement: cfData.totaux.prochainPrelevement
                ? serializeCf(cfData.totaux.prochainPrelevement)
                : null,
        },
    } : {
        profile: null,
        chargesFixes: [],
        comptes: [],
        categories: [],
        timeline: [],
        repartitionCategories: [],
        totaux: { nombreActifs: 0, nombreInactifs: 0, totalMensuel: 0, totalAnnuel: 0, prochainPrelevement: null },
    };

    return (
        <MonBudgetClient
            activeTab={tab}
            currentMonth={month}
            currentYear={year}
            budgetSummary={serializedBudgetSummary}
            transactionsData={transactionsData}
            transactionsPeriode={periode}
            enveloppesData={enveloppesData}
            chargesFixesData={chargesFixesDataSerialized}
        />
    );
}
