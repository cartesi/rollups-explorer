import type {
    Application,
    BondEvent,
    CartesiPublicClient,
    Commitment,
    Epoch,
    Input,
    Match,
    MatchAdvanced,
    Output,
    Report,
    Tournament,
    Withdrawal,
} from "@cartesi/client";
import {
    hexToBigInt,
    isAddressEqual,
    numberToHex,
    type EIP1193RequestFn,
    type Hex,
} from "viem";
import { toWire } from "./wire";

export type ApplicationData = {
    application: Application;
    epochs: Epoch[];
    inputs: Input[];
    outputs: Output[];
    reports: Report[];
    tournaments: Tournament[];
    commitments: Commitment[];
    matches: Match[];
    matchAdvances: MatchAdvanced[];
    bondEvents: BondEvent[];
    withdrawals: Withdrawal[];
};

export type NodeSnapshot = {
    chainId: number;
    version: string;
    applications: ApplicationData[];
};

export type JsonRpcRequest = {
    jsonrpc?: "2.0";
    id: number | string | null;
    method: string;
    params?: unknown;
};

export type JsonRpcError = { code: number; message: string };

export type JsonRpcResponse = {
    jsonrpc: "2.0";
    id: number | string | null;
} & ({ result: unknown } | { error: JsonRpcError });

export const rpcErrorCodes = {
    methodNotFound: -32601,
    invalidParams: -32602,
    resourceNotFound: -31001,
    applicationNotFound: -31002,
} as const;

export class RpcError extends Error {
    readonly code: number;

    constructor(code: number, message: string) {
        super(message);
        this.code = code;
    }
}

type Params = Record<string, unknown>;

type CartesiRpcSchema =
    CartesiPublicClient["request"] extends EIP1193RequestFn<infer Schema>
        ? Schema
        : never;

type CartesiMethod = CartesiRpcSchema extends readonly {
    Method: infer Method;
}[]
    ? Method
    : never;

export type MethodHandler = (params: Params) => unknown;

const defaultListLimit = 50;
const maxListLimit = 10_000;

const toParams = (params: unknown): Params =>
    params !== null && typeof params === "object" && !Array.isArray(params)
        ? (params as Params)
        : {};

const optionalBigInt = (params: Params, key: string) => {
    const value = params[key];
    return typeof value === "string" ? hexToBigInt(value as Hex) : undefined;
};

const requiredBigInt = (params: Params, key: string) => {
    const value = optionalBigInt(params, key);
    if (value === undefined) {
        throw new RpcError(rpcErrorCodes.invalidParams, `missing ${key}`);
    }
    return value;
};

const requiredString = (params: Params, key: string) => {
    const value = params[key];
    if (typeof value !== "string") {
        throw new RpcError(rpcErrorCodes.invalidParams, `missing ${key}`);
    }
    return value;
};

const sameAddress = (a: string, b: string) =>
    isAddressEqual(a as Hex, b as Hex);

const sameHash = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

const inRange = (index: bigint, params: Params) => {
    const from = optionalBigInt(params, "from");
    const to = optionalBigInt(params, "to");
    return (
        (from === undefined || index >= from) &&
        (to === undefined || index <= to)
    );
};

const oneOf = <T>(value: T, filter: unknown) =>
    filter === undefined ||
    (Array.isArray(filter) ? filter.includes(value) : filter === value);

const paginate = <T>(items: T[], params: Params) => {
    const requested = Number(params.limit ?? 0);
    const limit = Math.min(
        requested > 0 ? requested : defaultListLimit,
        maxListLimit,
    );
    const offset = Number(params.offset ?? 0);
    const ordered = params.descending === true ? [...items].reverse() : items;
    return {
        data: toWire(ordered.slice(offset, offset + limit)),
        pagination: { total_count: items.length, limit, offset },
    };
};

const found = <T>(item: T | undefined, what: string) => {
    if (item === undefined) {
        throw new RpcError(rpcErrorCodes.resourceNotFound, `${what} not found`);
    }
    return { data: toWire(item) };
};

const findApplication = (snapshot: NodeSnapshot, params: Params) => {
    const id = requiredString(params, "application");
    const data = snapshot.applications.find(
        ({ application }) =>
            application.name === id ||
            (id.startsWith("0x") &&
                id.length === 42 &&
                sameAddress(application.applicationAddress, id)),
    );
    if (!data) {
        throw new RpcError(
            rpcErrorCodes.applicationNotFound,
            "application not found",
        );
    }
    return data;
};

const matchesEpoch = (epochIndex: bigint, params: Params) => {
    const filter = optionalBigInt(params, "epoch_index");
    return filter === undefined || epochIndex === filter;
};

const matchesTournament = (address: string, params: Params) => {
    const filter = params.tournament_address;
    return typeof filter !== "string" || sameAddress(address, filter);
};

const isExecutable = (output: Output) =>
    output.decodedData !== null && output.decodedData.type !== "Notice";

/**
 * JSON-RPC handlers for the `cartesi_*` methods, answering from the snapshot
 * of the node at the current chain head.
 */
export const createCartesiHandlers = (
    snapshot: () => NodeSnapshot,
): Record<CartesiMethod, MethodHandler> => {
    const app = (params: Params) => findApplication(snapshot(), params);

    return {
        cartesi_getNodeInfo: () => {
            const { chainId, version } = snapshot();
            return {
                data: {
                    chain_id: numberToHex(chainId),
                    version,
                    default_block: "FINALIZED",
                },
            };
        },
        cartesi_getChainId: () => ({ data: numberToHex(snapshot().chainId) }),
        cartesi_getNodeVersion: () => ({ data: snapshot().version }),
        cartesi_listApplications: (params) =>
            paginate(
                snapshot().applications.map(({ application }) => application),
                params,
            ),
        cartesi_getApplication: (params) => ({
            data: toWire(app(params).application),
        }),
        cartesi_listEpochs: (params) =>
            paginate(
                app(params)
                    .epochs.filter(
                        (epoch) =>
                            inRange(epoch.index, params) &&
                            oneOf(epoch.status, params.status),
                    )
                    .map((epoch) => ({
                        ...epoch,
                        txBufferProof: null,
                        iflagsYProof: null,
                        htifTohostProof: null,
                        commitmentProof: null,
                    })),
                params,
            ),
        cartesi_getEpoch: (params) => {
            const index = requiredBigInt(params, "epoch_index");
            return found(
                app(params).epochs.find((epoch) => epoch.index === index),
                "epoch",
            );
        },
        cartesi_getEpochByVirtualIndex: (params) => {
            const index = requiredBigInt(params, "virtual_index");
            return found(
                app(params).epochs.find(
                    (epoch) => epoch.virtualIndex === index,
                ),
                "epoch",
            );
        },
        cartesi_getLastAcceptedEpochIndex: (params) => {
            const accepted = app(params).epochs.filter(
                (epoch) => epoch.status === "CLAIM_ACCEPTED",
            );
            const last = accepted[accepted.length - 1];
            return found(last?.index, "accepted epoch");
        },
        cartesi_listTournaments: (params) => {
            const level = optionalBigInt(params, "level");
            const parent = params.parent_tournament_address;
            const parentMatch = params.parent_match_id_hash;
            return paginate(
                app(params).tournaments.filter(
                    (tournament) =>
                        matchesEpoch(tournament.epochIndex, params) &&
                        (level === undefined || tournament.level === level) &&
                        (typeof parent !== "string" ||
                            (tournament.parentTournamentAddress !== null &&
                                sameAddress(
                                    tournament.parentTournamentAddress,
                                    parent,
                                ))) &&
                        (typeof parentMatch !== "string" ||
                            (tournament.parentMatchIdHash !== null &&
                                sameHash(
                                    tournament.parentMatchIdHash,
                                    parentMatch,
                                ))),
                ),
                params,
            );
        },
        cartesi_getTournament: (params) => {
            const address = requiredString(params, "address");
            return found(
                app(params).tournaments.find((tournament) =>
                    sameAddress(tournament.address, address),
                ),
                "tournament",
            );
        },
        cartesi_listCommitments: (params) =>
            paginate(
                app(params).commitments.filter(
                    (commitment) =>
                        matchesEpoch(commitment.epochIndex, params) &&
                        matchesTournament(commitment.tournamentAddress, params),
                ),
                params,
            ),
        cartesi_getCommitment: (params) => {
            const epochIndex = requiredBigInt(params, "epoch_index");
            const tournament = requiredString(params, "tournament_address");
            const hash = requiredString(params, "commitment");
            return found(
                app(params).commitments.find(
                    (commitment) =>
                        commitment.epochIndex === epochIndex &&
                        sameAddress(commitment.tournamentAddress, tournament) &&
                        sameHash(commitment.commitment, hash),
                ),
                "commitment",
            );
        },
        cartesi_listMatches: (params) =>
            paginate(
                app(params).matches.filter(
                    (match) =>
                        matchesEpoch(match.epochIndex, params) &&
                        matchesTournament(match.tournamentAddress, params),
                ),
                params,
            ),
        cartesi_getMatch: (params) => {
            const epochIndex = requiredBigInt(params, "epoch_index");
            const tournament = requiredString(params, "tournament_address");
            const idHash = requiredString(params, "id_hash");
            return found(
                app(params).matches.find(
                    (match) =>
                        match.epochIndex === epochIndex &&
                        sameAddress(match.tournamentAddress, tournament) &&
                        sameHash(match.idHash, idHash),
                ),
                "match",
            );
        },
        cartesi_listMatchAdvances: (params) => {
            const epochIndex = requiredBigInt(params, "epoch_index");
            const tournament = requiredString(params, "tournament_address");
            const idHash = requiredString(params, "id_hash");
            return paginate(
                app(params).matchAdvances.filter(
                    (advance) =>
                        advance.epochIndex === epochIndex &&
                        sameAddress(advance.tournamentAddress, tournament) &&
                        sameHash(advance.idHash, idHash),
                ),
                params,
            );
        },
        cartesi_getMatchAdvance: (params) => {
            const epochIndex = requiredBigInt(params, "epoch_index");
            const tournament = requiredString(params, "tournament_address");
            const idHash = requiredString(params, "id_hash");
            const txHash = requiredString(params, "tx_hash");
            const logIndex = requiredBigInt(params, "log_index");
            return found(
                app(params).matchAdvances.find(
                    (advance) =>
                        advance.epochIndex === epochIndex &&
                        sameAddress(advance.tournamentAddress, tournament) &&
                        sameHash(advance.idHash, idHash) &&
                        sameHash(advance.txHash, txHash) &&
                        advance.logIndex === logIndex,
                ),
                "match advance",
            );
        },
        cartesi_listBondEvents: (params) =>
            paginate(
                app(params).bondEvents.filter(
                    (event) =>
                        matchesEpoch(event.epochIndex, params) &&
                        matchesTournament(event.tournamentAddress, params),
                ),
                params,
            ),
        cartesi_getBondEvent: (params) => {
            const txHash = requiredString(params, "tx_hash");
            const logIndex = requiredBigInt(params, "log_index");
            return found(
                app(params).bondEvents.find(
                    (event) =>
                        sameHash(event.txHash, txHash) &&
                        event.logIndex === logIndex,
                ),
                "bond event",
            );
        },
        cartesi_listInputs: (params) => {
            const sender = params.sender;
            const txHash = params.transaction_hash;
            return paginate(
                app(params).inputs.filter(
                    (input) =>
                        matchesEpoch(input.epochIndex, params) &&
                        inRange(input.index, params) &&
                        (typeof sender !== "string" ||
                            (input.decodedData !== null &&
                                sameAddress(
                                    input.decodedData.sender,
                                    sender,
                                ))) &&
                        (typeof txHash !== "string" ||
                            sameHash(input.transactionHash, txHash)),
                ),
                params,
            );
        },
        cartesi_getInput: (params) => {
            const index = requiredBigInt(params, "input_index");
            return found(
                app(params).inputs.find((input) => input.index === index),
                "input",
            );
        },
        cartesi_getProcessedInputCount: (params) => ({
            data: numberToHex(
                app(params).inputs.filter((input) => input.status !== "NONE")
                    .length,
            ),
        }),
        cartesi_listOutputs: (params) => {
            const inputIndex = optionalBigInt(params, "input_index");
            const outputType = params.output_type;
            const voucher = params.voucher_address;
            const executed = params.executed;
            return paginate(
                app(params).outputs.filter(
                    (output) =>
                        matchesEpoch(output.epochIndex, params) &&
                        inRange(output.index, params) &&
                        (inputIndex === undefined ||
                            output.inputIndex === inputIndex) &&
                        oneOf(output.rawData.slice(0, 10), outputType) &&
                        (typeof voucher !== "string" ||
                            (output.decodedData !== null &&
                                output.decodedData.type !== "Notice" &&
                                sameAddress(
                                    output.decodedData.destination,
                                    voucher,
                                ))) &&
                        (typeof executed !== "boolean" ||
                            (output.executionTransactionHash !== null) ===
                                executed),
                ),
                params,
            );
        },
        cartesi_getOutput: (params) => {
            const index = requiredBigInt(params, "output_index");
            return found(
                app(params).outputs.find((output) => output.index === index),
                "output",
            );
        },
        cartesi_getExecutedOutputCount: (params) => ({
            data: numberToHex(
                app(params).outputs.filter(
                    (output) => output.executionTransactionHash !== null,
                ).length,
            ),
        }),
        cartesi_getPendingExecutableOutputCount: (params) => ({
            data: numberToHex(
                app(params).outputs.filter(
                    (output) =>
                        isExecutable(output) &&
                        output.outputHashesSiblings !== null &&
                        output.executionTransactionHash === null,
                ).length,
            ),
        }),
        cartesi_listReports: (params) => {
            const inputIndex = optionalBigInt(params, "input_index");
            return paginate(
                app(params).reports.filter(
                    (report) =>
                        matchesEpoch(report.epochIndex, params) &&
                        inRange(report.index, params) &&
                        (inputIndex === undefined ||
                            report.inputIndex === inputIndex),
                ),
                params,
            );
        },
        cartesi_getReport: (params) => {
            const index = requiredBigInt(params, "report_index");
            return found(
                app(params).reports.find((report) => report.index === index),
                "report",
            );
        },
        cartesi_listWithdrawals: (params) => {
            const accountIndex = optionalBigInt(params, "account_index");
            return paginate(
                app(params).withdrawals.filter(
                    (withdrawal) =>
                        accountIndex === undefined ||
                        withdrawal.accountIndex === accountIndex,
                ),
                params,
            );
        },
        cartesi_getWithdrawal: (params) => {
            const index = requiredBigInt(params, "account_index");
            return found(
                app(params).withdrawals.find(
                    (withdrawal) => withdrawal.accountIndex === index,
                ),
                "withdrawal",
            );
        },
    };
};

/**
 * Answer one JSON-RPC request with the given handlers. Unknown methods get a
 * method-not-found error.
 */
export const dispatch = (
    handlers: Partial<Record<string, MethodHandler>>,
    request: JsonRpcRequest,
): JsonRpcResponse => {
    const { id = null, method } = request;
    const handler = handlers[method];
    if (!handler) {
        return {
            jsonrpc: "2.0",
            id,
            error: {
                code: rpcErrorCodes.methodNotFound,
                message: "Method not found",
            },
        };
    }
    try {
        return {
            jsonrpc: "2.0",
            id,
            result: handler(
                Array.isArray(request.params)
                    ? { args: request.params }
                    : toParams(request.params),
            ),
        };
    } catch (error) {
        return {
            jsonrpc: "2.0",
            id,
            error:
                error instanceof RpcError
                    ? { code: error.code, message: error.message }
                    : { code: -32603, message: (error as Error).message },
        };
    }
};

/**
 * Answer a JSON-RPC body, either a single request or a batch.
 */
export const handleRpcBody = (
    handlers: Partial<Record<string, MethodHandler>>,
    body: unknown,
) =>
    Array.isArray(body)
        ? body.map((request: JsonRpcRequest) => dispatch(handlers, request))
        : dispatch(handlers, body as JsonRpcRequest);
