"use client";
import { type Voucher } from "@cartesi/viem";
import { whatsabi } from "@shazow/whatsabi";
import { isNil, isNotNil } from "ramda";
import { isNotNilOrEmpty } from "ramda-adjunct";
import { useEffect, useState } from "react";
import { type Abi, type Hex } from "viem";
import getSupportedChainInfo, {
    type SupportedChainId,
} from "../../../lib/supportedChains";
import createClientFor from "../../../lib/transportClient";
import { useSelectedNodeConnection } from "../../connection/hooks";
import { decodePayload } from "../decoder";
import { type Specification } from "../types";
import { stringifyContent } from "../utils";

type UseVoucherDecoderProps = {
    voucher: Voucher;
};
const cache = new Map<string, Abi>();

const buildClient = (chainId: number, nodeRpcUrl?: string) => {
    const chain = getSupportedChainInfo(chainId as SupportedChainId);

    if (isNil(chain)) throw new Error(`ChainId ${chainId} is not supported!`);

    return createClientFor(chain, nodeRpcUrl);
};

const fetchAbiFor = async (
    destination: Hex,
    chainId: number,
    nodeRpcUrl?: string,
) => {
    const cacheKey = `${chainId}:${destination}`;
    const abi = cache.get(cacheKey);

    if (abi && isNotNilOrEmpty(abi)) return abi;

    const result = await whatsabi.autoload(destination, {
        provider: buildClient(chainId, nodeRpcUrl),
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
        version: 1,
    };
};

type DecodeOutputReturn =
    | {
          isEtherWithdraw: true;
          withdrawData: {
              destination: Hex;
              value: bigint;
              method: "Transfer";
              type: "Ether";
          };
      }
    | {
          isEtherWithdraw?: false;
          payload: Hex;
      };

/**
 *
 * @summary returns the payload as Hex data for further processing or
 * prepare an ether-withdraw meta object in a human-readable format as there is no need to fetch the destination's ABI
 * to decode. Usually, the data after the decoding with the Output-ABI is `0x` and that is considered an ether-withdraw.
 *
 * @param payload
 * @param appVersion
 * @returns
 */
const decodeOutput = (voucher: Voucher): DecodeOutputReturn => {
    if (voucher.payload === "0x" && isNotNil(voucher.value)) {
        return {
            isEtherWithdraw: true,
            withdrawData: {
                destination: voucher.destination,
                value: voucher.value,
                method: "Transfer",
                type: "Ether",
            },
        };
    } else {
        return {
            isEtherWithdraw: false,
            payload: voucher.payload,
        };
    }
};

interface FetchDestinationABIAndDecodeParams {
    nodeRpcUrl: string;
    chainId: number;
    destination: Hex;
    payload: Hex;
}

const fetchDestinationABIAndDecode = async ({
    chainId,
    destination,
    payload,
    nodeRpcUrl,
}: FetchDestinationABIAndDecodeParams) => {
    let result: string;
    const baseMessage = "Skipping voucher decoding. Reason:";

    try {
        const abi = await fetchAbiFor(destination, chainId, nodeRpcUrl);
        const spec = buildSpecification(destination, chainId, abi);
        const envelope = decodePayload(spec, payload);

        if (!envelope.error) result = stringifyContent(envelope.result);
        else {
            console.info(`${baseMessage} ${envelope.error.message}`);
            result = payload;
        }
    } catch (error: unknown) {
        console.info(`${baseMessage} ${(error as Error).message}`);
        result = payload;
    }

    return result;
};

interface Result {
    status: "loading" | "idle";
    data: string | null;
}

const useVoucherDecoder = ({ voucher }: UseVoucherDecoderProps) => {
    const [result, setResult] = useState<Result>({
        status: "idle",
        data: null,
    });
    // const appConfig = useAppConfig();
    const selectedNodeConfig = useSelectedNodeConnection();
    const nodeRpcUrl = selectedNodeConfig?.chain.rpcUrl;
    const chainId = selectedNodeConfig?.chain.id;

    useEffect(() => {
        if (!chainId || !voucher || !nodeRpcUrl) return;

        setResult((old) => ({ ...old, status: "loading" }));

        (async () => {
            const outputResult = decodeOutput(voucher);
            const result = outputResult.isEtherWithdraw
                ? stringifyContent(outputResult.withdrawData)
                : await fetchDestinationABIAndDecode({
                      chainId,
                      destination: voucher.destination,
                      payload: voucher.payload,
                      nodeRpcUrl,
                  });

            setResult(() => ({ status: "idle", data: result }));
        })();
    }, [chainId, voucher, nodeRpcUrl]);

    return result;
};

export default useVoucherDecoder;
