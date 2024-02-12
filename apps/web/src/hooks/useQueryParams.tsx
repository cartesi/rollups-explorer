import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

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
            const urlSearchParams = new URLSearchParams({
                query: value,
            });
            router.push(`${pathName}?${urlSearchParams.toString()}`, {
                scroll: false,
            });
        },
        [router, pathName],
    );

    return { query, updateQueryParams };
};
