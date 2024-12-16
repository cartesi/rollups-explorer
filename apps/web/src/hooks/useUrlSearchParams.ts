import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { pathOr } from "ramda";
import { useCallback, useMemo } from "react";

export const limitBounds = {
    "10": 10,
    "20": 20,
    "30": 30,
} as const;

export type LimitBound = (typeof limitBounds)[keyof typeof limitBounds];

export type UsePaginationReturn = [
    { limit: LimitBound; page: number; query: string },
    (page: number, limit: LimitBound, query: string) => void,
];

export const useUrlSearchParams = (): UsePaginationReturn => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathName = usePathname();
    const urlSearchParams = new URLSearchParams(searchParams);
    const pg = parseInt(urlSearchParams.get("pg") ?? "");
    const lt = urlSearchParams.get("lt") ?? limitBounds[10];
    const limit = pathOr(limitBounds[10], [lt], limitBounds);
    const page = isNaN(pg) ? 1 : pg;
    const query = urlSearchParams.get("query") ?? "";

    const updateParams = useCallback(
        (page: number, limit: number, query: string): void => {
            const urlSearchParams = new URLSearchParams({
                query: query.toString(),
                pg: page.toString(),
                lt: limit.toString(),
            });

            router.push(`${pathName}?${urlSearchParams.toString()}`, {
                scroll: false,
            });
        },
        [router, pathName],
    );

    return useMemo(
        () => [{ page, limit, query }, updateParams],
        [page, limit, query, updateParams],
    );
};
