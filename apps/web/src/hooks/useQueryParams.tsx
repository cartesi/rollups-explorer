import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export const useQueryParams = () => {
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
        [pathName, router],
    );

    return [query, updateQueryParams] as const;
};

export default useQueryParams;
