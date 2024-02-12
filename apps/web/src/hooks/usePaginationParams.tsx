import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { pathOr } from "ramda";
import { useCallback } from "react";
import { useQueryParams } from "./useQueryParams";
export const limitBounds = {
    "10": 10,
    "20": 20,
    "30": 30,
} as const;

export type LimitBound = (typeof limitBounds)[keyof typeof limitBounds];

export type UsePaginationReturn = [
    { limit: LimitBound; page: number },
    (page: number, limit: LimitBound) => void,
];

export const usePaginationParams = (): UsePaginationReturn => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathName = usePathname();
    const { query } = useQueryParams();
    const urlSearchParams = new URLSearchParams(searchParams);
    const pg = parseInt(urlSearchParams.get("pg") ?? "");
    const lt = urlSearchParams.get("lt") ?? limitBounds[10];
    const limit = pathOr(limitBounds[10], [lt], limitBounds);
    const page = isNaN(pg) ? 1 : pg;

    const updateParams = useCallback(
        (page: number, limit: number): void => {
            const urlSearchParams = new URLSearchParams({
                query,
                pg: page.toString(),
                lt: limit.toString(),
            });

            router.push(`${pathName}?${urlSearchParams.toString()}`, {
                scroll: false,
            });
        },
        [router, pathName],
    );
    return [{ page, limit }, updateParams];
};
