import type { QueryClient } from "@tanstack/react-query";
import type { Hex } from "viem";

/**
 * A data-injector function should receive a query-client,
 * set the query information (side effect) and return the same
 * instance of query-client so it is pipeable to the next data-injectors.
 */
export type DataInjector = (queryClient: QueryClient) => QueryClient;

export interface UseCaseApplication {
    appName: string;
    appAddress: Hex;
    setData: DataInjector;
}
