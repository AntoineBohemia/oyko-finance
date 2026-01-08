import { getDashboardData } from "@/lib/data/dashboard";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
    const data = await getDashboardData();

    // Sérialiser les dates pour le transfert client
    const serializedData = {
        ...data,
        chargesFixes: data.chargesFixes.map((cf) => ({
            ...cf,
            dateProchain: cf.dateProchain.toISOString(),
        })),
        transactions: data.transactions.map((t) => ({
            ...t,
            date: t.date.toISOString(),
        })),
    };

    return <DashboardClient initialData={serializedData} />;
}
