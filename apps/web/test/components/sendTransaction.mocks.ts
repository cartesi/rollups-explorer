import {
    useReadErc1155BalanceOf,
    useReadErc1155IsApprovedForAll,
    useReadErc1155SupportsInterface,
    useReadErc1155Uri,
    useSimulateErc1155BatchPortalDepositBatchErc1155Token,
    useSimulateErc1155SetApprovalForAll,
    useSimulateErc1155SinglePortalDepositSingleErc1155Token,
    useSimulateErc20Approve,
    useSimulateErc20PortalDepositErc20Tokens,
    useSimulateErc721Approve,
    useSimulateErc721PortalDepositErc721Token,
    useSimulateEtherPortalDepositEther,
    useSimulateInputBoxAddInput,
    useWriteErc1155BatchPortalDepositBatchErc1155Token,
    useWriteErc1155SetApprovalForAll,
    useWriteErc1155SinglePortalDepositSingleErc1155Token,
    useWriteErc20Approve,
    useWriteErc20PortalDepositErc20Tokens,
    useWriteErc721Approve,
    useWriteErc721PortalDepositErc721Token,
    useWriteEtherPortalDepositEther,
    useWriteInputBoxAddInput,
} from "@cartesi/rollups-wagmi";
import { pipe } from "ramda";
import { sepolia } from "viem/chains";
import {
    useAccount,
    useBlockNumber,
    useConfig,
    useReadContracts,
    useSimulateContract,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";

const partialMocked = <T>(fn: T) => vi.mocked(fn, { partial: true });

// rollups-wagmi mocks
const useSimulateErc20ApproveMock = partialMocked(useSimulateErc20Approve);
const useWriteErc20ApproveMock = partialMocked(useWriteErc20Approve);
const useSimulateErc20PortalDepositErc20TokensMock = partialMocked(
    useSimulateErc20PortalDepositErc20Tokens,
);
const useWriteErc20PortalDepositErc20TokensMock = partialMocked(
    useWriteErc20PortalDepositErc20Tokens,
);
const useSimulateErc721ApproveMock = partialMocked(useSimulateErc721Approve);
const useWriteErc721ApproveMock = partialMocked(useWriteErc721Approve);
const useSimulateErc721PortalDepositErc721TokenMock = partialMocked(
    useSimulateErc721PortalDepositErc721Token,
);
const useWriteErc721PortalDepositErc721TokenMock = partialMocked(
    useWriteErc721PortalDepositErc721Token,
);
const useSimulateEtherPortalDepositEtherMock = partialMocked(
    useSimulateEtherPortalDepositEther,
);
const useWriteEtherPortalDepositEtherMock = partialMocked(
    useWriteEtherPortalDepositEther,
);
const useSimulateInputBoxAddInputMock = partialMocked(
    useSimulateInputBoxAddInput,
);
const useWriteInputBoxAddInputMock = partialMocked(useWriteInputBoxAddInput);

const useReadErc1155SupportsInterfaceMock = partialMocked(
    useReadErc1155SupportsInterface,
);

const useReadErc1155BalanceOfMock = partialMocked(useReadErc1155BalanceOf);
const useReadErc1155IsApprovedForAllMock = partialMocked(
    useReadErc1155IsApprovedForAll,
);
const useSimulateErc1155BatchPortalDepositBatchErc1155TokenMock = partialMocked(
    useSimulateErc1155BatchPortalDepositBatchErc1155Token,
);

const useSimulateErc1155SetApprovalForAllMock = partialMocked(
    useSimulateErc1155SetApprovalForAll,
);
const useWriteErc1155BatchPortalDepositBatchErc1155TokenMock = partialMocked(
    useWriteErc1155BatchPortalDepositBatchErc1155Token,
);
const useWriteErc1155SetApprovalForAllMock = partialMocked(
    useWriteErc1155SetApprovalForAll,
);
const useReadErc1155UriMock = partialMocked(useReadErc1155Uri);
const useSimulateErc1155SinglePortalDepositSingleErc1155TokenMock =
    partialMocked(useSimulateErc1155SinglePortalDepositSingleErc1155Token);
const useWriteErc1155SinglePortalDepositSingleErc1155TokenMock = partialMocked(
    useWriteErc1155SinglePortalDepositSingleErc1155Token,
);

// WAGMI MOCKS
const useReadContractsMock = partialMocked(useReadContracts);
const useAccountMock = partialMocked(useAccount);
const useSimulateContractMock = partialMocked(useSimulateContract);
const useWaitForTransactionReceiptMock = partialMocked(
    useWaitForTransactionReceipt,
);
const useBlockNumberMock = partialMocked(useBlockNumber);
const useWriteContractMock = partialMocked(useWriteContract);
const useConfigMock = partialMocked(useConfig);

/**
 * Cartesi/rollups-wagmi mocks setup.
 */
const setupRollupsWagmi = () => {
    // ERC-1155

    useReadErc1155SupportsInterfaceMock.mockReturnValue({
        isLoading: false,
        status: "success",
        data: true,
    });

    useReadErc1155BalanceOfMock.mockReturnValue({
        isLoading: false,
        data: 1000n,
    });

    useReadErc1155IsApprovedForAllMock.mockReturnValue({
        isLoading: false,
        data: true,
    });

    useReadErc1155UriMock.mockReturnValue({
        isLoading: false,
        data: "ipfs://QmYN9HnMjYuZB173n7daXGLXuC41JnSHz4pXKzqMEUDGj7",
    });

    useWriteErc1155SetApprovalForAllMock.mockReturnValue({
        data: "0x001",
        status: "idle",
        reset: vi.fn(),
    });

    useSimulateErc1155SetApprovalForAllMock.mockReturnValue({
        data: { request: {} },
    });

    useSimulateErc1155BatchPortalDepositBatchErc1155TokenMock.mockReturnValue({
        data: { request: {} },
    });

    useWriteErc1155BatchPortalDepositBatchErc1155TokenMock.mockReturnValue({
        data: "0x001",
        status: "idle",
        reset: vi.fn(),
    });

    useSimulateErc1155SinglePortalDepositSingleErc1155TokenMock.mockReturnValue(
        {
            data: { request: {} },
        },
    );

    useWriteErc1155SinglePortalDepositSingleErc1155TokenMock.mockReturnValue({
        data: "0x001",
        status: "idle",
        reset: vi.fn(),
    });

    //ERC-20
    useSimulateErc20ApproveMock.mockReturnValue({
        data: { request: {} },
    });
    useWriteErc20ApproveMock.mockReturnValue({
        data: "0x001",
        status: "idle",
        reset: vi.fn(),
    });
    useSimulateErc20PortalDepositErc20TokensMock.mockReturnValue({
        data: { request: {} },
    });
    useWriteErc20PortalDepositErc20TokensMock.mockReturnValue({
        data: "0x001",
        status: "idle",
        reset: vi.fn(),
    });

    // ERC-721
    useSimulateErc721ApproveMock.mockReturnValue({
        data: { request: {} },
    });
    useWriteErc721ApproveMock.mockReturnValue({
        data: "0x001",
        status: "idle",
        reset: vi.fn(),
    });
    useSimulateErc721PortalDepositErc721TokenMock.mockReturnValue({
        data: { request: {} },
    });
    useWriteErc721PortalDepositErc721TokenMock.mockReturnValue({
        data: "0x001",
        status: "idle",
        reset: vi.fn(),
    });

    // Ether
    useSimulateEtherPortalDepositEtherMock.mockReturnValue({
        data: { request: {} },
    });
    useWriteEtherPortalDepositEtherMock.mockReturnValue({
        data: "0x001",
        status: "idle",
        reset: vi.fn(),
    });

    // Send-raw
    useSimulateInputBoxAddInputMock.mockReturnValue({
        data: { request: {} },
    });
    useWriteInputBoxAddInputMock.mockReturnValue({
        data: "0x001",
        status: "idle",
        reset: vi.fn(),
    });
};

/**
 * Wagmi mocks setup
 */
const setupWagmi = () => {
    useConfigMock.mockReturnValue({
        chains: [sepolia],
    });

    useReadContractsMock.mockReturnValue({
        isLoading: false,
        isSuccess: true,
        data: [
            {
                result: undefined,
                error: undefined,
            },
            {
                result: undefined,
                error: undefined,
            },
            {
                result: undefined,
                error: undefined,
            },
            {
                result: undefined,
                error: undefined,
            },
        ],
    });

    useAccountMock.mockReturnValue({
        address: "0x8FD78976f8955D13bAA4fC99043208F4EC020D7E",
    });

    useSimulateContractMock.mockReturnValue({});
    useWaitForTransactionReceiptMock.mockReturnValue({});
    useWriteContractMock.mockReturnValue({});
    useBlockNumberMock.mockReturnValue({ data: 0 });
};

/**
 * Initialize the mocks with a few values. Good to be used inside a beforeEach()
 */
const setup = pipe(setupRollupsWagmi, setupWagmi);

const sendTransactionMocks = {
    setup,
};

export default sendTransactionMocks;
