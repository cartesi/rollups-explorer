import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export type UseQueryParamsReturn = {
    query: string;
    updateQueryParams: (value: string) => void;
};

export const useQueryParams = (): UseQueryParamsReturn => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathName = usePathname();
    const urlSearchParams = new URLSearchParams(searchParams);
    const query = urlSearchParams.get("query") ?? "";
    const updateQueryParams = useCallback(
        (value: string): void => {
            const urlSearchParams = new URLSearchParams(searchParams);
            if (value) {
                urlSearchParams.set("query", value);
            } else {
                urlSearchParams.delete("query");
            }
            router.push(`${pathName}?${urlSearchParams.toString()}`, {
                scroll: false,
            });
        },
        [router, pathName],
    );
    return useMemo(
        () => ({ query, updateQueryParams }),
        [query, updateQueryParams],
    );
};
