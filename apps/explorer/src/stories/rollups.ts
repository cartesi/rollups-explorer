import type {
    Application,
    Epoch,
    Input,
    Output,
    Report,
    Withdrawal,
} from "@cartesi/client";
import {
    inputBoxAddress,
    safeErc20TransferAbi,
    safeErc20TransferAddress,
    testFungibleTokenAddress,
} from "@cartesi/client/abi";
import { encodeInput, encodeOutput } from "@cartesi/codec";
import {
    concat,
    encodeFunctionData,
    keccak256,
    numberToBytes,
    numberToHex,
    stringToHex,
    toHex,
    zeroAddress,
    zeroHash,
    type Address,
    type Hash,
    type Hex,
} from "viem";

const defaultDate = new Date("2026-01-01T00:00:00.000Z");
const defaultApplicationAddress = "0xFc0E04b72f5630b277a07cD50c7F88Ca2331EB65";
const defaultSender = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const defaultTxHash: Hash =
    "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70";

type ApplicationOverrides = Partial<
    Omit<Application, "executionParameters" | "withdrawalConfig">
> & {
    executionParameters?: Partial<Application["executionParameters"]>;
    withdrawalConfig?: Partial<Application["withdrawalConfig"]>;
};

export const createApplication = (
    overrides: ApplicationOverrides = {},
): Application => {
    const { executionParameters, withdrawalConfig, ...rest } = overrides;
    return {
        name: "honeypot",
        applicationAddress: defaultApplicationAddress,
        consensusAddress: "0x44DC8F7BfA033E464CD672561AA62Ad147f24012",
        inputBoxAddress,
        templateHash:
            "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
        epochLength: 0n,
        claimStagingPeriod: 0n,
        consensusType: "PRT",
        status: "OK",
        enabled: true,
        reason: null,
        inputBoxBlock: 3n,
        lastEpochCheckBlock: 100n,
        lastInputCheckBlock: 100n,
        lastOutputCheckBlock: 100n,
        lastTournamentCheckBlock: 100n,
        lastForecloseCheckBlock: 100n,
        lastAccountsDriveProvedCheckBlock: 100n,
        lastWithdrawalCheckBlock: 100n,
        processedInputs: 0n,
        forecloseBlock: 0n,
        forecloseTransaction: zeroHash,
        accountsDriveProvedBlock: 0n,
        accountsDriveProvedTransaction: zeroHash,
        accountsDriveMerkleRoot: zeroHash,
        createdAt: defaultDate,
        updatedAt: defaultDate,
        ...rest,
        withdrawalConfig: {
            guardian: zeroAddress,
            log2LeavesPerAccount: 0n,
            log2MaxNumOfAccounts: 0n,
            accountsDriveStartIndex: 0n,
            withdrawalOutputBuilder: zeroAddress,
            ...withdrawalConfig,
        },
        executionParameters: {
            snapshotPolicy: "NONE",
            advanceIncCycles: 4_194_304n,
            advanceMaxCycles: 4_611_686_018_427_387_903n,
            inspectIncCycles: 4_194_304n,
            inspectMaxCycles: 4_611_686_018_427_387_903n,
            advanceIncDeadline: 10_000_000_000n,
            advanceMaxDeadline: 180_000_000_000n,
            inspectIncDeadline: 10_000_000_000n,
            inspectMaxDeadline: 180_000_000_000n,
            loadDeadline: 300_000_000_000n,
            storeDeadline: 180_000_000_000n,
            fastDeadline: 5_000_000_000n,
            maxConcurrentInspects: 10,
            createdAt: defaultDate,
            updatedAt: defaultDate,
            ...executionParameters,
        },
    };
};

export const createEpoch = (overrides: Partial<Epoch> = {}): Epoch => ({
    index: 0n,
    firstBlock: 0n,
    lastBlock: 10n,
    inputIndexLowerBound: 0n,
    inputIndexUpperBound: 0n,
    machineHash: null,
    txBufferDataBlock: null,
    txBufferProof: null,
    iflagsYDataBlock: null,
    iflagsYProof: null,
    htifTohostDataBlock: null,
    htifTohostProof: null,
    tournamentAddress: null,
    commitment: null,
    commitmentProof: null,
    claimTransactionHash: null,
    status: "OPEN",
    stagedAtBlock: null,
    virtualIndex: overrides.index ?? 0n,
    createdAt: defaultDate,
    updatedAt: defaultDate,
    ...overrides,
});

type InputDecodedData = NonNullable<Input["decodedData"]>;

type InputOverrides = Partial<Omit<Input, "decodedData">> & {
    decodedData?: Partial<InputDecodedData>;
};

/**
 * Build an input whose raw data is the `EvmAdvance` encoding of its decoded
 * data, unless a raw data is given.
 */
export const createInput = (overrides: InputOverrides = {}): Input => {
    const { decodedData: data, ...rest } = overrides;
    const index = rest.index ?? 0n;
    const blockNumber = rest.blockNumber ?? 1n;
    const decodedData: InputDecodedData = {
        chainId: 13370n,
        applicationContract: defaultApplicationAddress,
        sender: defaultSender,
        blockNumber,
        blockTimestamp: BigInt(defaultDate.getTime() / 1000),
        prevRandao: BigInt(keccak256(toHex(blockNumber))),
        index,
        payload: stringToHex("Hello from Dave!"),
        ...data,
    };
    const rawData = encodeInput({
        chainId: decodedData.chainId,
        appContract: decodedData.applicationContract,
        msgSender: decodedData.sender,
        blockNumber: decodedData.blockNumber,
        blockTimestamp: decodedData.blockTimestamp,
        prevRandao: decodedData.prevRandao,
        index: decodedData.index,
        payload: decodedData.payload,
    });
    return {
        epochIndex: 0n,
        index,
        blockNumber,
        rawData,
        decodedData,
        status: "ACCEPTED",
        exceptionData: null,
        machineHash: null,
        txBufferDataBlock: null,
        transactionHash: defaultTxHash,
        logIndex: 0n,
        createdAt: defaultDate,
        updatedAt: defaultDate,
        ...rest,
    };
};

/**
 * Build an output whose raw data and hash follow its decoded data, unless a
 * raw data is given.
 */
export const createOutput = (overrides: Partial<Output> = {}): Output => {
    const decodedData = overrides.decodedData ?? {
        type: "Notice",
        payload: stringToHex("Hello from Dave!"),
    };
    const rawData = overrides.rawData ?? encodeOutput(decodedData);
    return {
        epochIndex: 0n,
        inputIndex: 0n,
        index: 0n,
        hash: keccak256(rawData),
        outputHashesSiblings: null,
        executionTransactionHash: null,
        createdAt: defaultDate,
        updatedAt: defaultDate,
        ...overrides,
        rawData,
        decodedData,
    };
};

export const createReport = (overrides: Partial<Report> = {}): Report => ({
    epochIndex: 0n,
    inputIndex: 0n,
    index: 0n,
    rawData: stringToHex("Hello from Dave!"),
    createdAt: defaultDate,
    updatedAt: defaultDate,
    ...overrides,
});

/**
 * Encode an accounts drive leaf: the balance as a little-endian 64-bit
 * integer, then the owner address, padded to 32 bytes.
 */
export const encodeAccount = (owner: Address, balance: bigint): Hex =>
    concat([
        toHex(numberToBytes(balance, { size: 8 }).reverse()),
        owner,
        numberToHex(0, { size: 4 }),
    ]);

/**
 * Encode the delegate call voucher that transfers an account balance of the
 * test token to its owner.
 */
export const encodeWithdrawalOutput = (owner: Address, balance: bigint): Hex =>
    encodeOutput({
        type: "DelegateCallVoucher",
        destination: safeErc20TransferAddress,
        payload: encodeFunctionData({
            abi: safeErc20TransferAbi,
            functionName: "safeTransfer",
            args: [testFungibleTokenAddress, owner, balance],
        }),
    });

export const createWithdrawal = (
    overrides: Partial<Withdrawal> = {},
): Withdrawal => ({
    accountIndex: 0n,
    account: encodeAccount(defaultSender, 300_000n),
    output: encodeWithdrawalOutput(defaultSender, 300_000n),
    blockNumber: 1n,
    transactionHash: defaultTxHash,
    logIndex: 0n,
    createdAt: defaultDate,
    updatedAt: defaultDate,
    ...overrides,
});
