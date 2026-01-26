"use client";
import { cond, isNil, isNotNil } from "ramda";
import { useEffect, useState } from "react";

export type UseGetTokenMetadata = (
    uri?: string,
    tokenId?: bigint,
) => TokenMetadataResult;

interface PrepareUrlResult {
    validURL: boolean;
    isHttp: boolean;
    error?: TypeError;
    result?: URL;
    url: string;
}

type TokenMetadata = Record<string, unknown>;

interface FetchResult {
    data?: TokenMetadata;
    error?: Error;
}

export type State =
    | "idle"
    | "fetching"
    | "success"
    | "errored"
    | "not_http"
    | "http_network_error";

export interface TokenMetadataResult {
    state: State;
    /** Tells if the URI returned is defined using the http protocol. */
    isHttp?: boolean;
    /** Parsed URL based on EIP-1155 standard @link{https://eips.ethereum.org/EIPS/eip-1155#metadata} */
    url?: string;
    /** A wide type to support the returned JSON based on EIP-1155 @link{https://eips.ethereum.org/EIPS/eip-1155#erc-1155-metadata-uri-json-schema}*/
    data?: TokenMetadata;
    /** Any error returned during fetch phase.*/
    error?: Error;
}

interface MetaCache {
    [key: string]: TokenMetadataResult;
}

const prepareUrl = (uri: string, id: bigint): PrepareUrlResult => {
    const regex = /\{id\}/;
    try {
        const url = uri.replace(regex, id.toString());
        const result = new URL(url);
        return {
            validURL: true,
            isHttp: result.protocol.includes("http"),
            result,
            url,
        };
    } catch (error: unknown) {
        return {
            validURL: false,
            isHttp: false,
            error: error as TypeError,
            url: uri,
        };
    }
};

const fetchMetadata = async (
    result: PrepareUrlResult,
    signal: AbortSignal,
): Promise<FetchResult> => {
    if (!result.validURL || !result.isHttp) return {};

    return fetch(result.url, { signal })
        .then(async (r) => {
            if (r.ok) {
                return r
                    .json()
                    .then((data: Record<string, unknown>) => ({ data }));
            }
            const errorMessage = await r
                .text()
                .catch(() => `Status: ${r.status}`);
            return { error: new Error(errorMessage) };
        })
        .catch((e: Error) => ({ error: e }));
};

type DeriveStateProps = {
    urlResult: PrepareUrlResult;
    fetchResult: FetchResult;
};

const deriveState = cond<DeriveStateProps[], State>([
    [
        ({ urlResult, fetchResult }) =>
            urlResult.isHttp && isNil(fetchResult.error),
        () => "success",
    ],
    [
        ({ urlResult }) => urlResult.validURL && !urlResult.isHttp,
        () => "not_http",
    ],
    [
        ({ urlResult, fetchResult }) =>
            urlResult.isHttp && isNotNil(fetchResult.error),
        () => "http_network_error",
    ],
    [
        ({ fetchResult, urlResult }) =>
            isNotNil(fetchResult.error) || isNotNil(urlResult.error),
        () => "errored",
    ],
    [() => true, () => "idle"],
]);

export const useGetTokenMetadata: UseGetTokenMetadata = (uri, id) => {
    const [cache, setCache] = useState<MetaCache>({});
    const [result, setResult] = useState<TokenMetadataResult>({
        state: "idle",
    });

    useEffect(() => {
        if (isNil(uri) || isNil(id)) {
            setResult(() => ({ state: "idle" }));
            return;
        }

        const update = async (uri: string, id: bigint, signal: AbortSignal) => {
            const urlResult = prepareUrl(uri, id);
            const fetchResult = await fetchMetadata(urlResult, signal);

            if (isNil(fetchResult.error)) {
                setCache((cache) => {
                    cache[uri + id] = result;
                    return cache;
                });
            }

            if (fetchResult.error?.name === "AbortError") {
                console.log(`Request to ${urlResult.url} aborted.`);
                return;
            }

            const result = {
                state: deriveState({ fetchResult, urlResult }),
                error: fetchResult.error,
                data: fetchResult.data,
                isHttp: urlResult.isHttp,
                url: urlResult.url,
            };

            setResult(result);
        };

        if (uri !== undefined && id !== undefined) {
            const abortController = new AbortController();
            const cached = cache[uri + id];
            if (cached !== undefined) {
                setResult(cached);
            } else {
                setResult(() => ({ state: "fetching" }));
                update(uri, id, abortController.signal);
            }

            return () => {
                console.log(`calling abort on ${id}`);
                abortController.abort(
                    `Token id ${id} metadata request aborted.`,
                );
            };
        }
    }, [uri, id, cache]);

    return result;
};
