import type { Pagination as PaginationData } from "@cartesi/viem";
import { Pagination, type PaginationProps } from "@mantine/core";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, type FC } from "react";

export type NextPaginationProps = Omit<PaginationProps, "total" | "value"> & {
    pagination: PaginationData;
};

export const NextPagination: FC<NextPaginationProps> = (props) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get a new searchParams string by merging the current
    // searchParams with a provided key/value pair
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);

            return params.toString();
        },
        [searchParams],
    );

    // calculate the total number of pages
    const total = Math.ceil(
        props.pagination.totalCount / props.pagination.limit,
    );

    // calculate the current page number
    const value =
        Math.floor(props.pagination.offset / props.pagination.limit) + 1;

    // Convert a page number to an offset
    const toOffset = (value: number) => (value - 1) * props.pagination.limit;

    // if there is only one page, don't show the pagination
    if (total <= 1) return null;

    return (
        <Pagination
            {...props}
            total={total}
            value={value}
            onChange={(value) =>
                router.push(
                    `${pathname}?${createQueryString("offset", toOffset(value).toString())}`,
                )
            }
        />
    );
};
