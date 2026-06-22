import type { Application } from "@cartesi/viem";
import { useDisclosure } from "@mantine/hooks";
import {
    useChainModal,
    useConnectModal,
    type Chain,
} from "@rainbow-me/rainbowkit";
import { zeroHash } from "viem";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useAccount } from "wagmi";
import { mainnet } from "wagmi/chains";
import type { DbNodeConnectionConfig } from "../../../src/components/connection/types";
import SendMenu from "../../../src/components/send/SendMenu";
import { fireEvent, render, screen } from "../../test-utils";

const mocks = vi.hoisted(() => ({
    useDisclosure: vi.fn(),
    useAccount: vi.fn(),
    useConnectModal: vi.fn(),
    useChainModal: vi.fn(),
    useSelectedNodeConnection: vi.fn(),
    useSpecification: vi.fn(),
    useSendAction: vi.fn(),
}));

vi.mock("@mantine/hooks", () => ({
    useDisclosure: mocks.useDisclosure,
}));

vi.mock("wagmi", () => ({
    useAccount: mocks.useAccount,
}));

vi.mock("@rainbow-me/rainbowkit", () => ({
    useConnectModal: mocks.useConnectModal,
    useChainModal: mocks.useChainModal,
}));

vi.mock("../../../src/components/connection/hooks", () => ({
    useSelectedNodeConnection: mocks.useSelectedNodeConnection,
}));

vi.mock("../../../src/components/specification/hooks/useSpecification", () => ({
    useSpecification: mocks.useSpecification,
}));

vi.mock("../../../src/components/send/hooks", () => ({
    useSendAction: mocks.useSendAction,
}));

const mockUseDisclosure = vi.mocked(useDisclosure, { partial: true });
const mockUseAccount = vi.mocked(useAccount, { partial: true });
const mockUseConnectModal = vi.mocked(useConnectModal, { partial: true });
const mockUseChainModal = vi.mocked(useChainModal, { partial: true });

type ApplicationOverrides = Partial<
    Pick<
        Application,
        | "applicationAddress"
        | "forecloseBlock"
        | "forecloseTransaction"
        | "name"
    >
>;

const createApplication = (overrides?: ApplicationOverrides) =>
    ({
        name: "My App",
        applicationAddress: "0x1234567890abcdef1234567890abcdef12345678",
        forecloseBlock: 0n,
        forecloseTransaction: zeroHash,
        ...overrides,
    }) as Application;

const setupDisclosures = ({
    menuOpened = false,
    tooltipOpened = false,
}: {
    menuOpened?: boolean;
    tooltipOpened?: boolean;
}) => {
    const menuHandlers = {
        open: vi.fn(),
        close: vi.fn(),
        toggle: vi.fn(),
    };
    const tooltipHandlers = {
        open: vi.fn(),
        close: vi.fn(),
        toggle: vi.fn(),
    };

    mockUseDisclosure.mockReset();
    mockUseDisclosure
        .mockImplementationOnce(() => [menuOpened, menuHandlers] as const)
        .mockImplementationOnce(
            () => [tooltipOpened, tooltipHandlers] as const,
        );

    return { menuHandlers, tooltipHandlers };
};

const setupCommonMocks = ({
    selectedConnection,
    isConnected,
    chain,
    listSpecifications = () => [],
}: {
    selectedConnection: { type: DbNodeConnectionConfig["type"] } | null;
    isConnected: boolean;
    chain?: Chain;
    listSpecifications?: () => Array<{ id: string; mode: string }>;
}) => {
    const connectModal = {
        openConnectModal: vi.fn(),
    };
    const chainModal = {
        openChainModal: vi.fn(),
    };
    const actions = {
        sendGenericInput: vi.fn(),
        depositEth: vi.fn(),
        depositErc20: vi.fn(),
        depositErc721: vi.fn(),
        depositErc1155Single: vi.fn(),
        depositErc1155Batch: vi.fn(),
    };

    mockUseAccount.mockReturnValue({
        isConnected,
        chain,
    });

    mockUseConnectModal.mockReturnValue(connectModal);
    mockUseChainModal.mockReturnValue(chainModal);

    mocks.useSelectedNodeConnection.mockReturnValue(selectedConnection);

    mocks.useSpecification.mockReturnValue({
        listSpecifications,
    });

    mocks.useSendAction.mockReturnValue(actions);

    return { connectModal, chainModal, actions };
};

describe("SendMenu", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("should render nothing when the selected node is a system mock", () => {
        setupCommonMocks({
            selectedConnection: { type: "system_mock" },
            isConnected: false,
        });

        setupDisclosures({});

        render(<SendMenu application={createApplication()} />);

        expect(screen.queryByText("Send")).not.toBeInTheDocument();
    });

    test("should open the connect modal when the user is disconnected", () => {
        const { connectModal } = setupCommonMocks({
            selectedConnection: { type: "system" },
            isConnected: false,
        });

        setupDisclosures({});

        render(<SendMenu application={createApplication()} />);

        fireEvent.click(screen.getByText("Send"));

        expect(connectModal.openConnectModal).toHaveBeenCalledTimes(1);
    });

    test("should open the chain modal when the user needs to switch networks", () => {
        const { chainModal } = setupCommonMocks({
            selectedConnection: { type: "system" },
            isConnected: true,
            chain: undefined,
        });

        setupDisclosures({});

        render(<SendMenu application={createApplication()} />);

        fireEvent.click(screen.getByText("Send"));

        expect(chainModal.openChainModal).toHaveBeenCalledTimes(1);
    });

    test("Should toggle the tooltip for foreclosed applications", () => {
        const { tooltipHandlers } = setupDisclosures({});

        setupCommonMocks({
            selectedConnection: { type: "system" },
            isConnected: true,
            chain: mainnet,
        });

        render(
            <SendMenu
                application={createApplication({
                    forecloseBlock: 3n,
                    forecloseTransaction:
                        "0x6ac742af4241c66794b28817bba8d9bfa12d19705aa3fc61a608416692e9c15c",
                })}
            />,
        );

        fireEvent.click(screen.getByText("Send"));

        expect(tooltipHandlers.toggle).toHaveBeenCalledTimes(1);
    });

    test("should toggle the menu when the user can send", () => {
        const { menuHandlers } = setupDisclosures({});
        setupCommonMocks({
            selectedConnection: { type: "system" },
            isConnected: true,
            chain: mainnet,
        });

        render(<SendMenu application={createApplication()} />);

        fireEvent.click(screen.getByText("Send"));

        expect(menuHandlers.toggle).toHaveBeenCalledTimes(1);
    });

    test("should dispatch the input action with json ABI specifications", () => {
        const { menuHandlers } = setupDisclosures({ menuOpened: true });
        const listSpecifications = vi.fn(() => [
            { id: "1", mode: "json_abi" },
            { id: "2", mode: "abi_params" },
        ]);

        const { actions } = setupCommonMocks({
            selectedConnection: { type: "system" },
            isConnected: true,
            chain: mainnet,
            listSpecifications,
        });

        render(<SendMenu application={createApplication()} />);
        fireEvent.click(screen.getByText("Input"));

        expect(actions.sendGenericInput).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "My App",
            }),
            [{ id: "1", mode: "json_abi" }],
        );
        expect(menuHandlers.close).toHaveBeenCalled();
    });

    test("should dispatch the deposit actions from the menu", () => {
        const { menuHandlers } = setupDisclosures({ menuOpened: true });
        const { actions } = setupCommonMocks({
            selectedConnection: { type: "system" },
            isConnected: true,
            chain: mainnet,
        });

        render(<SendMenu application={createApplication()} />);

        fireEvent.click(screen.getByText("Ether"));
        fireEvent.click(screen.getByText("ERC-20"));
        fireEvent.click(screen.getByText("ERC-721"));
        fireEvent.click(screen.getByText("ERC-1155 (Single)"));
        fireEvent.click(screen.getByText("ERC-1155 (Batch)"));

        expect(actions.depositEth).toHaveBeenCalledTimes(1);
        expect(actions.depositErc20).toHaveBeenCalledTimes(1);
        expect(actions.depositErc721).toHaveBeenCalledTimes(1);
        expect(actions.depositErc1155Single).toHaveBeenCalledTimes(1);
        expect(actions.depositErc1155Batch).toHaveBeenCalledTimes(1);
        expect(menuHandlers.close).toHaveBeenCalled();
    });
});
