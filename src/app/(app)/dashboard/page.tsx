import { getDashboardData } from "@/lib/data/dashboard";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
    let data;
    try {
        data = await getDashboardData();
    } catch {
        data = {
            profile: null,
            comptes: [],
            categories: [],
            chargesFixes: [],
            transactions: [],
            patrimoine: { valeurNette: 0, totalLiquidites: 0, totalInvestissements: 0, totalDettes: 0, variationMois: 0, repartition: [] },
        };
    }

    const serializedData = {
        ...data,
        chargesFixes: (data.chargesFixes || []).map((cf) => ({
            ...cf,
            dateProchain: cf.dateProchain instanceof Date ? cf.dateProchain.toISOString() : (cf.dateProchain || new Date().toISOString()),
        })),
        transactions: (data.transactions || []).map((t) => ({
            ...t,
            date: t.date instanceof Date ? t.date.toISOString() : (t.date || new Date().toISOString()),
        })),
    };

    return <DashboardClient initialData={serializedData} />;
}
