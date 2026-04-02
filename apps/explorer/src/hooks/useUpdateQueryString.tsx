import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isNilOrEmpty } from "ramda-adjunct";
import { useCallback } from "react";

type QueryStringParam = { name: string; value: string };
type UseUpdateQueryStringReturn = [
    updateUrlQueryString: (params: QueryStringParam[]) => void,
    createQueryString: (params: QueryStringParam[]) => string,
];

const useUpdateQueryString = (): UseUpdateQueryStringReturn => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (entries: QueryStringParam[]) => {
            const params = new URLSearchParams(searchParams.toString());
            entries.forEach(({ name, value }) => {
                if (isNilOrEmpty(value)) {
                    params.delete(name);
                } else {
                    params.set(name, value);
                }
            });

            return params.toString();
        },
        [searchParams],
    );

    const updateUrlQueryString = useCallback(
        (entries: QueryStringParam[]) => {
            const queryString = createQueryString(entries);
            const url = isNilOrEmpty(queryString)
                ? pathname
                : `${pathname}?${queryString}`;
            router.push(url, { scroll: false });
        },
        [createQueryString, pathname, router],
    );

    return [updateUrlQueryString, createQueryString];
};

export default useUpdateQueryString;
