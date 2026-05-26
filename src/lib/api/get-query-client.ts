import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";
import { ApiError } from "./client";

// One QueryClient per request (React cache deduplicates within a single render)
const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          retry: (count, error) => {
            if (error instanceof ApiError) {
              if ([401, 403, 404].includes(error.status)) return false;
            }
            return count < 2;
          },
        },
      },
    }),
);

export default getQueryClient;
