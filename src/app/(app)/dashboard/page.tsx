import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "@/lib/api/get-query-client";
import { queryKeys } from "@/lib/api/query-keys";
import { getDashboardData } from "@/lib/data/dashboard";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.overview,
        queryFn: () => getDashboardData(),
    });
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <DashboardClient />
        </HydrationBoundary>
    );
}
