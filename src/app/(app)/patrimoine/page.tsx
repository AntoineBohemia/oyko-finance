import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "@/lib/api/get-query-client";
import { queryKeys } from "@/lib/api/query-keys";
import { getPatrimoineData } from "@/lib/data/patrimoine";
import PatrimoineClient from "./patrimoine-client";

export default async function PatrimoinePage() {
    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
        queryKey: queryKeys.patrimoine.all,
        queryFn: () => getPatrimoineData(),
    });
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PatrimoineClient />
        </HydrationBoundary>
    );
}
