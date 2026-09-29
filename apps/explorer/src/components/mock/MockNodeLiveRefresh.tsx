"use client";
import { useQueryClient, type Query } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useEffect, useRef, type FC } from "react";
import { getHead } from "../../providers/mocknode/clock";
import { clockAtom, mockNodeStore } from "../../providers/mocknode/store";

export const MOCK_REFRESH_INTERVAL = 2_000;

/**
 * Whether a page shows the query and it reads data that can change as the
 * chain moves. Queries cached for good, such as block timestamps and
 * transactions, are left alone.
 */
export const isLiveQuery = (query: Query) =>
    query.observers.length > 0 &&
    query.observers.every(
        ({ options }) =>
            options.staleTime !== Infinity && options.staleTime !== "static",
    );

/**
 * Refresh every page in the background as the mock chain moves, at most once
 * per interval and never while the head holds.
 */
export const MockNodeLiveRefresh: FC = () => {
    const clock = useAtomValue(clockAtom, { store: mockNodeStore });
    const queryClient = useQueryClient();
    const lastHead = useRef<bigint | undefined>(undefined);

    useEffect(() => {
        if (!clock) return;
        const refresh = () => {
            const head = getHead(clock, Date.now());
            if (lastHead.current !== undefined && head !== lastHead.current) {
                queryClient.invalidateQueries({ predicate: isLiveQuery });
            }
            lastHead.current = head;
        };
        refresh();
        const id = setInterval(refresh, MOCK_REFRESH_INTERVAL);
        return () => clearInterval(id);
    }, [clock, queryClient]);

    return null;
};
