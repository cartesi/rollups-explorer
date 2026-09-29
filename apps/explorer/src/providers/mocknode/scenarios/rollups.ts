import type { InputStatus, Output } from "@cartesi/client";
import {
    erc20PortalAddress,
    etherPortalAddress,
    iApplicationAbi,
    iAuthorityAbi,
    iErc20PortalAbi,
    iEtherPortalAbi,
    iInputBoxAbi,
    inputBoxAddress,
    safeErc20TransferAbi,
    safeErc20TransferAddress,
    testFungibleTokenAddress,
} from "@cartesi/client/abi";
import { encodeErc20Deposit, encodeEtherDeposit } from "@cartesi/codec";
import {
    encodeFunctionData,
    erc20Abi,
    getAbiItem,
    stringToHex,
    toFunctionSelector,
    type Address,
    type Hash,
    type Hex,
} from "viem";
import {
    accounts,
    addressOf,
    assignLogIndexes,
    between,
    createChain,
    emit,
    hashOf,
    sendTx,
    type Chain,
    type LogRecord,
    type TxRecord,
} from "./chain";

export type InputKind =
    | "notice"
    | "ether"
    | "erc20"
    | "withdraw"
    | "rejected"
    | "exception";

export type RollupsScenarioSpec = {
    name: string;
    consensusType: "AUTHORITY" | "QUORUM";
    epochLength: bigint;
    claimStagingPeriod: bigint;
    /** Inputs added in each epoch; an epoch without inputs is skipped. */
    epochs: InputKind[][];
    rejectedEpochs?: number[];
    /** Epoch the guardian forecloses the application in. */
    forecloseIn?: number;
    presentAt?: number;
};

export type OutputRecord = {
    index: bigint;
    inputIndex: bigint;
    epochIndex: bigint;
    decoded: NonNullable<Output["decodedData"]>;
    siblings: Hash[];
    executed: TxRecord | null;
};

export type ReportRecord = {
    index: bigint;
    inputIndex: bigint;
    epochIndex: bigint;
    payload: Hex;
};

export type RollupsInputRecord = {
    index: bigint;
    epochIndex: bigint;
    log: LogRecord;
    sender: Address;
    payload: Hex;
    status: InputStatus;
    exceptionData: Hex | null;
    processedAt: bigint;
};

export type EpochRecord = {
    index: bigint;
    virtualIndex: bigint;
    firstBlock: bigint;
    lastBlock: bigint;
    inputs: [bigint, bigint];
    openedAt: bigint;
    processedAt: bigint;
    computedAt: bigint;
    submitted: TxRecord | null;
    stagedAt: bigint | null;
    settledAt: bigint;
    settlement: "CLAIM_ACCEPTED" | "CLAIM_REJECTED" | "CLAIM_FORECLOSED";
};

export type WithdrawalRecord = {
    accountIndex: bigint;
    owner: Address;
    balance: bigint;
    log: LogRecord;
};

export type RollupsTimeline = {
    name: string;
    address: Address;
    consensus: Address;
    consensusType: RollupsScenarioSpec["consensusType"];
    epochLength: bigint;
    claimStagingPeriod: bigint;
    anchor: bigint;
    epochs: EpochRecord[];
    inputs: RollupsInputRecord[];
    outputs: OutputRecord[];
    reports: ReportRecord[];
    foreclosure: LogRecord | null;
    accountsDrive: { log: LogRecord; root: Hash } | null;
    withdrawals: WithdrawalRecord[];
    guardian: Address;
    withdrawalOutputBuilder: Address;
    txs: TxRecord[];
    endsAt: bigint;
};

const OUTPUTS_TREE_HEIGHT = 63;

const siblingsOf = (name: string, index: bigint) =>
    Array.from({ length: OUTPUTS_TREE_HEIGHT }, (_, level) =>
        hashOf(name, "output", index, "sibling", level),
    );

type InputPlan = {
    to: Address;
    call: Hex;
    value: bigint;
    sender: Address;
    payload: Hex;
    status: InputStatus;
    exceptionData: Hex | null;
    outputs: NonNullable<Output["decodedData"]>[];
    reports: Hex[];
    deposit: { owner: Address; value: bigint } | null;
};

const planInput = (
    chain: Chain,
    application: Address,
    kind: InputKind,
    user: Address,
    index: number,
): InputPlan => {
    const addInput = (payload: Hex) => ({
        to: inputBoxAddress,
        call: encodeFunctionData({
            abi: iInputBoxAbi,
            functionName: "addInput",
            args: [application, payload],
        }),
        value: 0n,
        sender: user,
        payload,
    });
    const text = (value: unknown) => stringToHex(JSON.stringify(value));
    switch (kind) {
        case "ether": {
            const value = between(chain, 1, 20) * 10n ** 17n;
            const payload = encodeEtherDeposit({
                sender: user,
                value,
                execLayerData: "0x",
            });
            return {
                to: etherPortalAddress,
                call: encodeFunctionData({
                    abi: iEtherPortalAbi,
                    functionName: "depositEther",
                    args: [application, "0x"],
                }),
                value,
                sender: etherPortalAddress,
                payload,
                status: "ACCEPTED",
                exceptionData: null,
                outputs: [
                    {
                        type: "Voucher",
                        destination: user,
                        value: value / 2n,
                        payload: "0x",
                    },
                ],
                reports: [text({ deposit: "ether", value: `${value}` })],
                deposit: null,
            };
        }
        case "erc20": {
            const value = between(chain, 50, 900) * 10n ** 6n;
            const payload = encodeErc20Deposit({
                token: testFungibleTokenAddress,
                sender: user,
                value,
                execLayerData: "0x",
            });
            return {
                to: erc20PortalAddress,
                call: encodeFunctionData({
                    abi: iErc20PortalAbi,
                    functionName: "depositErc20Tokens",
                    args: [testFungibleTokenAddress, application, value, "0x"],
                }),
                value: 0n,
                sender: erc20PortalAddress,
                payload,
                status: "ACCEPTED",
                exceptionData: null,
                outputs: [
                    {
                        type: "Voucher",
                        destination: testFungibleTokenAddress,
                        value: 0n,
                        payload: encodeFunctionData({
                            abi: erc20Abi,
                            functionName: "transfer",
                            args: [user, value / 4n],
                        }),
                    },
                ],
                reports: [],
                deposit: { owner: user, value },
            };
        }
        case "withdraw": {
            const value = between(chain, 10, 90) * 10n ** 6n;
            return {
                ...addInput(text({ action: "withdraw", amount: `${value}` })),
                status: "ACCEPTED",
                exceptionData: null,
                outputs: [
                    {
                        type: "DelegateCallVoucher",
                        destination: safeErc20TransferAddress,
                        payload: encodeFunctionData({
                            abi: safeErc20TransferAbi,
                            functionName: "safeTransfer",
                            args: [testFungibleTokenAddress, user, value],
                        }),
                    },
                ],
                reports: [],
                deposit: null,
            };
        }
        case "rejected":
            return {
                ...addInput(text({ action: "transfer", to: "nobody" })),
                status: "REJECTED",
                exceptionData: null,
                outputs: [],
                reports: [text({ error: "unknown recipient" })],
                deposit: null,
            };
        case "exception":
            return {
                ...addInput(text({ action: "divide", by: 0 })),
                status: "EXCEPTION",
                exceptionData: stringToHex("division by zero"),
                outputs: [],
                reports: [],
                deposit: null,
            };
        case "notice": {
            const message = `hello #${index}`;
            return {
                ...addInput(text({ action: "echo", message })),
                status: "ACCEPTED",
                exceptionData: null,
                outputs: [{ type: "Notice", payload: stringToHex(message) }],
                reports: [text({ echoed: message })],
                deposit: null,
            };
        }
    }
};

/**
 * Generate the chain history of an Authority or Quorum application: inputs
 * and deposits over its epochs, the outputs and reports they produce, the
 * epoch claims, voucher executions, and, when it is foreclosed, the accounts
 * drive proof and the withdrawals.
 */
export const buildRollupsTimeline = (
    spec: RollupsScenarioSpec,
    anchor: bigint,
): RollupsTimeline => {
    const chain = createChain(spec.name);
    const address = addressOf(spec.name, "application");
    const consensus = addressOf(spec.name, "consensus");
    const guardian = accounts.keeper;
    const epochs: EpochRecord[] = [];
    const inputs: RollupsInputRecord[] = [];
    const outputs: OutputRecord[] = [];
    const reports: ReportRecord[] = [];
    const deposits = new Map<Address, bigint>();
    const lastEpoch = spec.forecloseIn ?? spec.epochs.length - 1;
    const forecloseAt =
        spec.forecloseIn !== undefined
            ? anchor +
              BigInt(spec.forecloseIn) * spec.epochLength +
              spec.epochLength / 2n
            : null;

    spec.epochs.slice(0, lastEpoch + 1).forEach((kinds, epochNumber) => {
        if (kinds.length === 0) return;
        const index = BigInt(epochNumber);
        const firstBlock = anchor + index * spec.epochLength;
        const lastBlock = firstBlock + spec.epochLength - 1n;
        const lower = BigInt(inputs.length);
        const step = spec.epochLength / BigInt(kinds.length + 1);

        kinds.forEach((kind, position) => {
            const block = firstBlock + step * BigInt(position + 1);
            if (forecloseAt !== null && block >= forecloseAt) return;
            const inputIndex = BigInt(inputs.length);
            const user = accounts.users[inputs.length % accounts.users.length];
            const plan = planInput(chain, address, kind, user, inputs.length);
            const tx = sendTx(
                chain,
                block,
                user,
                plan.to,
                plan.call,
                plan.value,
            );
            const processedAt = block + between(chain, 1, 3);
            inputs.push({
                index: inputIndex,
                epochIndex: index,
                log: emit(chain, tx),
                sender: plan.sender,
                payload: plan.payload,
                status: plan.status,
                exceptionData: plan.exceptionData,
                processedAt,
            });
            plan.outputs.forEach((decoded) => {
                const outputIndex = BigInt(outputs.length);
                outputs.push({
                    index: outputIndex,
                    inputIndex,
                    epochIndex: index,
                    decoded,
                    siblings: siblingsOf(spec.name, outputIndex),
                    executed: null,
                });
            });
            plan.reports.forEach((payload) =>
                reports.push({
                    index: BigInt(reports.length),
                    inputIndex,
                    epochIndex: index,
                    payload,
                }),
            );
            if (plan.deposit) {
                const { owner, value } = plan.deposit;
                deposits.set(owner, (deposits.get(owner) ?? 0n) + value);
            }
        });

        const epochInputs = inputs.filter(
            (input) => input.epochIndex === index,
        );
        if (epochInputs.length === 0) return;
        const lastProcessed = epochInputs.reduce(
            (last, input) =>
                input.processedAt > last ? input.processedAt : last,
            lastBlock,
        );
        const processedAt = lastProcessed + 2n;
        const computedAt = processedAt + between(chain, 2, 4);
        const submittedAt = computedAt + between(chain, 2, 4);
        const foreclosed = forecloseAt !== null && submittedAt >= forecloseAt;
        const submitted = foreclosed
            ? null
            : sendTx(
                  chain,
                  submittedAt,
                  accounts.node,
                  consensus,
                  toFunctionSelector(
                      getAbiItem({ abi: iAuthorityAbi, name: "submitClaim" }),
                  ),
              );
        if (submitted) emit(chain, submitted);
        const rejected = spec.rejectedEpochs?.includes(epochNumber) ?? false;
        const stagedAt =
            submitted && !rejected && spec.claimStagingPeriod > 0n
                ? submittedAt + (spec.consensusType === "QUORUM" ? 3n : 0n)
                : null;
        let settledAt = rejected
            ? submittedAt + 3n
            : (stagedAt ?? submittedAt) + spec.claimStagingPeriod;
        let settlement: EpochRecord["settlement"] = rejected
            ? "CLAIM_REJECTED"
            : "CLAIM_ACCEPTED";
        if (forecloseAt !== null && settledAt >= forecloseAt) {
            settledAt = forecloseAt + 1n;
            settlement = "CLAIM_FORECLOSED";
        } else if (!rejected && spec.claimStagingPeriod > 0n) {
            emit(
                chain,
                sendTx(
                    chain,
                    settledAt,
                    accounts.node,
                    consensus,
                    encodeFunctionData({
                        abi: iAuthorityAbi,
                        functionName: "acceptClaim",
                        args: [address, lastBlock, hashOf(spec.name, index)],
                    }),
                ),
            );
        }
        epochs.push({
            index,
            virtualIndex: BigInt(epochs.length),
            firstBlock,
            lastBlock,
            inputs: [lower, BigInt(inputs.length)],
            openedAt: epochInputs[0].log.tx.block,
            processedAt,
            computedAt,
            submitted,
            stagedAt,
            settledAt,
            settlement,
        });
    });

    epochs
        .filter((epoch) => epoch.settlement === "CLAIM_ACCEPTED")
        .forEach((epoch) => {
            outputs
                .filter(
                    (output) =>
                        output.epochIndex === epoch.index &&
                        output.decoded.type !== "Notice" &&
                        output.index % 4n !== 3n,
                )
                .forEach((output, position) => {
                    const tx = sendTx(
                        chain,
                        epoch.settledAt + 3n + BigInt(position) * 5n,
                        accounts.users[position % accounts.users.length],
                        address,
                        toFunctionSelector(
                            getAbiItem({
                                abi: iApplicationAbi,
                                name: "executeOutput",
                            }),
                        ),
                    );
                    emit(chain, tx);
                    output.executed = tx;
                });
        });

    let foreclosure: LogRecord | null = null;
    let accountsDrive: RollupsTimeline["accountsDrive"] = null;
    const withdrawals: WithdrawalRecord[] = [];
    if (forecloseAt !== null) {
        foreclosure = emit(
            chain,
            sendTx(
                chain,
                forecloseAt,
                guardian,
                address,
                encodeFunctionData({
                    abi: iApplicationAbi,
                    functionName: "foreclose",
                }),
            ),
        );
        const root = hashOf(spec.name, "accounts drive");
        const provedAt = forecloseAt + 25n;
        accountsDrive = {
            root,
            log: emit(
                chain,
                sendTx(
                    chain,
                    provedAt,
                    guardian,
                    address,
                    encodeFunctionData({
                        abi: iApplicationAbi,
                        functionName: "proveAccountsDriveMerkleRoot",
                        args: [root, [hashOf(root, "proof")]],
                    }),
                ),
            ),
        };
        [...deposits.entries()].forEach(([owner, balance], position) => {
            const tx = sendTx(
                chain,
                provedAt + 8n + BigInt(position) * 12n,
                owner,
                address,
                toFunctionSelector(
                    getAbiItem({ abi: iApplicationAbi, name: "withdraw" }),
                ),
            );
            withdrawals.push({
                accountIndex: BigInt(position),
                owner,
                balance,
                log: emit(chain, tx),
            });
        });
    }

    assignLogIndexes(chain.logs);
    return {
        name: spec.name,
        address,
        consensus,
        consensusType: spec.consensusType,
        epochLength: spec.epochLength,
        claimStagingPeriod: spec.claimStagingPeriod,
        anchor,
        epochs,
        inputs,
        outputs,
        reports,
        foreclosure,
        accountsDrive,
        withdrawals,
        guardian,
        withdrawalOutputBuilder: addressOf(spec.name, "withdrawal builder"),
        txs: chain.txs,
        endsAt: chain.txs.reduce(
            (last, tx) => (tx.block > last ? tx.block : last),
            anchor,
        ),
    };
};
