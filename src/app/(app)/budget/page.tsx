import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "@/lib/api/get-query-client";
import { queryKeys } from "@/lib/api/query-keys";
import { getBudgetData } from "@/lib/data/budget";
import { getDepensesData } from "@/lib/data/depenses";
import { getChargesFixesData } from "@/lib/data/charges-fixes";
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

    const queryClient = getQueryClient();

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: queryKeys.budget.monthly(month, year),
            queryFn: () => getBudgetData(month, year),
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.transactions.all({ period: periode }),
            queryFn: () => getDepensesData(periode),
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.recurringCharges.all,
            queryFn: () => getChargesFixesData(),
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MonBudgetClient
                activeTab={tab}
                currentMonth={month}
                currentYear={year}
                transactionsPeriode={periode}
            />
        </HydrationBoundary>
    );
}
