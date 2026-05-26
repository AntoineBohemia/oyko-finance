import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "@/lib/api/get-query-client";
import { queryKeys } from "@/lib/api/query-keys";
import { getParametresData } from "@/lib/data/parametres";
import ParametresClient from "./parametres-client";

export default async function ParametresPage() {
    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
        queryKey: queryKeys.parametres.all,
        queryFn: () => getParametresData(),
    });
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ParametresClient />
        </HydrationBoundary>
    );
}
