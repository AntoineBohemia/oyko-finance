import MonBudgetClient from "./mon-budget-client";

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

    return (
        <MonBudgetClient
            activeTab={tab}
            currentMonth={month}
            currentYear={year}
            transactionsPeriode={periode}
        />
    );
}
