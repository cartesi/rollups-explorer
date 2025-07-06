"use client";
import { RollupVersion } from "@cartesi/rollups-explorer-domain/explorer-types";
import { v2OutputFactoryAbi } from "@cartesi/rollups-wagmi";
import { whatsabi } from "@shazow/whatsabi";
import { any, isNil } from "ramda";
import { isNilOrEmpty, isNotNilOrEmpty } from "ramda-adjunct";
import { useEffect, useState } from "react";
import { Abi, Hex, decodeFunctionData } from "viem";
import getSupportedChainInfo, {
    SupportedChainId,
} from "../../../lib/supportedChains";
import createClientFor from "../../../lib/transportClient";
import { useAppConfig } from "../../../providers/appConfigProvider";
import { decodePayload } from "../decoder";
import { Specification } from "../types";
import { stringifyContent } from "../utils";

type UseVoucherDecoderProps = {
    destination: Hex;
    payload: Hex;
    chainId: number;
    /** default to RollupVersion.V1 */
    appVersion?: RollupVersion;
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
        timestamp: Date.now(),
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
 * In case the payload is from a RollupVersion.V1, the payload is returned as is.
 *
 * @summary Decodes an v2 output and returns the payload as Hex data after decoding or
 * prepare an ether-withdraw meta object in a human-readable format as there is no need to fetch the destination's ABI
 * to decode. Usually, the data after the decoding with the Output-ABI is `0x` and that is considered an ether-withdraw.
 *
 * @param payload
 * @param appVersion
 * @returns
 */
const decodeOutput = (
    payload: Hex,
    appVersion: RollupVersion,
): DecodeOutputReturn => {
    try {
        if (appVersion === RollupVersion.V2) {
            const { functionName, args } = decodeFunctionData({
                abi: v2OutputFactoryAbi,
                data: payload,
            });

            if (functionName === "Voucher") {
                const [destination, value, data] = args;

                if (data === "0x") {
                    return {
                        isEtherWithdraw: true,
                        withdrawData: {
                            destination,
                            value,
                            method: "Transfer",
                            type: "Ether",
                        },
                    };
                } else {
                    return {
                        isEtherWithdraw: false,
                        payload: data,
                    };
                }
            }
        }
    } catch (error: any) {
        console.info(error.shortMessage ?? error.message);
    }

    return { payload };
};

interface FetchDestinationABIAndDecodeParams
    extends Omit<UseVoucherDecoderProps, "appVersion"> {
    nodeRpcUrl?: string;
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
    } catch (error: any) {
        console.info(`${baseMessage} ${error.message}`);
        result = payload;
    }

    return result;
};

interface Result {
    status: "loading" | "idle";
    data: string | null;
}

const useVoucherDecoder = ({
    destination,
    payload,
    chainId,
    appVersion = RollupVersion.V1,
}: UseVoucherDecoderProps) => {
    const [result, setResult] = useState<Result>({
        status: "idle",
        data: null,
    });
    const appConfig = useAppConfig();
    const nodeRpcUrl = appConfig.nodeRpcUrl;

    useEffect(() => {
        if (any(isNilOrEmpty)([destination, chainId, payload, appVersion]))
            return;

        setResult((old) => ({ ...old, status: "loading" }));

        (async () => {
            const outputResult = decodeOutput(payload, appVersion);
            const result = outputResult.isEtherWithdraw
                ? stringifyContent(outputResult.withdrawData)
                : await fetchDestinationABIAndDecode({
                      chainId,
                      destination,
                      payload: outputResult.payload,
                      nodeRpcUrl,
                  });

            setResult(() => ({ status: "idle", data: result }));
        })();
    }, [destination, chainId, payload, appVersion, nodeRpcUrl]);

    return result;
};

export default useVoucherDecoder;
