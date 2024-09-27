"use client";
import { whatsabi } from "@shazow/whatsabi";
import { any, isNil } from "ramda";
import { isNilOrEmpty, isNotNilOrEmpty } from "ramda-adjunct";
import { useEffect, useState } from "react";
import { Abi, Hex, createPublicClient } from "viem";
import getSupportedChainInfo, {
    SupportedChainId,
} from "../../../lib/supportedChains";
import buildTransport from "../../../lib/transport";
import { decodePayload } from "../decoder";
import { Specification } from "../types";
import { stringifyContent } from "../utils";

type UseVoucherDecoderProps = {
    destination: Hex;
    payload: Hex;
    chainId: number;
};
const cache = new Map<string, Abi>();

const buildClient = (chainId: number) => {
    const chain = getSupportedChainInfo(chainId as SupportedChainId);

    if (isNil(chain)) throw new Error(`ChainId ${chainId} is not supported!`);

    return createPublicClient({
        transport: buildTransport(chain.id),
        chain,
    });
};

const fetchAbiFor = async (destination: Hex, chainId: number) => {
    const cacheKey = `${chainId}:${destination}`;
    const abi = cache.get(cacheKey);

    if (abi && isNotNilOrEmpty(abi)) return abi;

    const result = await whatsabi.autoload(destination, {
        provider: buildClient(chainId),
        followProxies: true,
        onError: () => false,
    });

    cache.set(cacheKey, result.abi as Abi);

    return result.abi as Abi;
};

const buildSpecification = (
    destination: Hex,
    chainId: number,
    abi: Abi,
): Specification => {
    return {
        mode: "json_abi",
        abi,
        name: `Abi for ${destination} on chain ${chainId}`,
        timestamp: Date.now(),
        version: 1,
    };
};

interface Result {
    status: "loading" | "idle";
    data: string | null;
}

const useVoucherDecoder = ({
    destination,
    payload,
    chainId,
}: UseVoucherDecoderProps) => {
    const [result, setResult] = useState<Result>({
        status: "idle",
        data: null,
    });

    useEffect(() => {
        if (any(isNilOrEmpty)([destination, chainId, payload])) return;

        setResult((old) => ({ ...old, status: "loading" }));

        (async () => {
            let result: string;

            const baseMessage = "Skipping voucher decoding. Reason:";
            try {
                const abi = await fetchAbiFor(destination, chainId);
                const spec = buildSpecification(destination, chainId, abi);
                const envelope = decodePayload(spec, payload);

                if (!envelope.error) result = stringifyContent(envelope.result);
                else {
                    console.info(`${baseMessage} ${envelope.error.message}`);
                    result = payload;
                }
            } catch (error: any) {
                console.info(`${baseMessage} ${error.message}`);
                result = payload;
            }

            setResult(() => ({ status: "idle", data: result }));
        })();
    }, [destination, chainId, payload]);

    return result;
};

export default useVoucherDecoder;
