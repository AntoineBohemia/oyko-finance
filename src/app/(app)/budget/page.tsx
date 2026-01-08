import { getBudgetData } from "@/lib/data/budget";
import BudgetClient from "./budget-client";

interface PageProps {
    searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function BudgetPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const today = new Date();
    const month = params.month ? parseInt(params.month) : today.getMonth();
    const year = params.year ? parseInt(params.year) : today.getFullYear();

    const data = await getBudgetData(month, year);

    // Sérialiser les dates pour le transfert client
    const serializedData = {
        ...data,
        transactions: data.transactions.map((t) => ({
            ...t,
            date: t.date.toISOString(),
        })),
    };

    return (
        <BudgetClient
            initialData={serializedData}
            initialMonth={month}
            initialYear={year}
        />
    );
}
