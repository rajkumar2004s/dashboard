import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: "always",
      staleTime: 1000 * 30,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});
