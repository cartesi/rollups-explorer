import {
    useChainModal,
    useConnectModal,
    type Chain,
} from "@rainbow-me/rainbowkit";
import type { Address } from "abitype";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAccount } from "wagmi";
import { mainnet } from "wagmi/chains";
import type { DbNodeConnectionConfig } from "../../../src/components/connection/types";
import SendMenu from "../../../src/components/send/SendMenu";
import { content } from "../../../src/content";
import {
    createApplication,
    fireEvent,
    render,
    screen,
    waitFor,
} from "../../test-utils";

const mocks = vi.hoisted(() => ({
    useAccount: vi.fn(),
    useConnectModal: vi.fn(),
    useChainModal: vi.fn(),
    useSelectedNodeConnection: vi.fn(),
    useSpecification: vi.fn(),
    useSendAction: vi.fn(),
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

const mockUseAccount = vi.mocked(useAccount, { partial: true });
const mockUseConnectModal = vi.mocked(useConnectModal, { partial: true });
const mockUseChainModal = vi.mocked(useChainModal, { partial: true });

const guardianAddress = "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef" as const;

const setupCommonMocks = ({
    selectedConnection,
    isConnected,
    chain,
    address,
    listSpecifications = () => [],
}: {
    selectedConnection: { type: DbNodeConnectionConfig["type"] } | null;
    isConnected: boolean;
    chain?: Chain;
    address?: Address;
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
        foreclose: vi.fn(),
    };

    mockUseAccount.mockReturnValue({
        isConnected,
        chain,
        address,
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

    it("should render nothing when the selected node is a system mock", () => {
        setupCommonMocks({
            selectedConnection: { type: "system_mock" },
            isConnected: false,
        });

        render(<SendMenu application={createApplication()} />);

        expect(screen.queryByText("Send")).not.toBeInTheDocument();
    });

    it("should open the connect modal when the user is disconnected", () => {
        const { connectModal } = setupCommonMocks({
            selectedConnection: { type: "system" },
            isConnected: false,
        });

        render(<SendMenu application={createApplication()} />);

        fireEvent.click(screen.getByText("Send"));

        expect(connectModal.openConnectModal).toHaveBeenCalledTimes(1);
    });

    it("should open the chain modal when the user needs to switch networks", () => {
        const { chainModal } = setupCommonMocks({
            selectedConnection: { type: "system" },
            isConnected: true,
            chain: undefined,
        });

        render(<SendMenu application={createApplication()} />);

        fireEvent.click(screen.getByText("Send"));

        expect(chainModal.openChainModal).toHaveBeenCalledTimes(1);
    });

    it("should show the foreclosure tooltip when clicking Send on a foreclosed application", () => {
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

        expect(screen.getByText(content.foreclose.sendTooltip)).toBeVisible();
    });

    it("should open the menu when the user can send", async () => {
        setupCommonMocks({
            selectedConnection: { type: "system" },
            isConnected: true,
            chain: mainnet,
        });

        render(<SendMenu application={createApplication()} />);

        fireEvent.click(screen.getByText("Send"));

        await waitFor(() => expect(screen.getByRole("menu")).toBeVisible());

        expect(screen.getByText("Ether")).toBeVisible();
        expect(screen.getByText("ERC-20")).toBeVisible();
        expect(screen.getByText("ERC-721")).toBeVisible();
        expect(screen.getByText("ERC-1155 (Single)")).toBeVisible();
        expect(screen.getByText("ERC-1155 (Batch)")).toBeVisible();
        expect(screen.getByText("Input")).toBeVisible();
    });

    it("should dispatch the input action with json ABI specifications", async () => {
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

        fireEvent.click(screen.getByText("Send"));

        await waitFor(() => {
            expect(screen.getByText("Input")).toBeVisible();
        });

        fireEvent.click(screen.getByText("Input"));

        expect(actions.sendGenericInput).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "My App",
            }),
            [{ id: "1", mode: "json_abi" }],
        );
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("should dispatch the deposit actions from the menu", async () => {
        const { actions } = setupCommonMocks({
            selectedConnection: { type: "system" },
            isConnected: true,
            chain: mainnet,
        });

        render(<SendMenu application={createApplication()} />);

        fireEvent.click(screen.getByText("Send"));
        await waitFor(() => expect(screen.getByText("Ether")).toBeVisible());
        fireEvent.click(screen.getByText("Ether"));

        fireEvent.click(screen.getByText("Send"));
        await waitFor(() => expect(screen.getByText("ERC-20")).toBeVisible());
        fireEvent.click(screen.getByText("ERC-20"));

        fireEvent.click(screen.getByText("Send"));
        await waitFor(() => expect(screen.getByText("ERC-721")).toBeVisible());
        fireEvent.click(screen.getByText("ERC-721"));

        fireEvent.click(screen.getByText("Send"));
        await waitFor(() =>
            expect(screen.getByText("ERC-1155 (Single)")).toBeVisible(),
        );
        fireEvent.click(screen.getByText("ERC-1155 (Single)"));

        fireEvent.click(screen.getByText("Send"));
        await waitFor(() =>
            expect(screen.getByText("ERC-1155 (Batch)")).toBeVisible(),
        );
        fireEvent.click(screen.getByText("ERC-1155 (Batch)"));

        expect(actions.depositEth).toHaveBeenCalledTimes(1);
        expect(actions.depositErc20).toHaveBeenCalledTimes(1);
        expect(actions.depositErc721).toHaveBeenCalledTimes(1);
        expect(actions.depositErc1155Single).toHaveBeenCalledTimes(1);
        expect(actions.depositErc1155Batch).toHaveBeenCalledTimes(1);
    });

    describe("Foreclose workflow", () => {
        const guardianApplication = createApplication({
            withdrawalConfig: {
                guardian: guardianAddress,
                log2LeavesPerAccount: 0n,
                log2MaxNumOfAccounts: 0n,
                accountsDriveStartIndex: 0n,
                withdrawalOutputBuilder:
                    "0x0000000000000000000000000000000000000000",
            },
        });

        it("should not show the Foreclose menu item for non-guardian users", async () => {
            setupCommonMocks({
                selectedConnection: { type: "system" },
                isConnected: true,
                chain: mainnet,
                address: "0x1111111111111111111111111111111111111111",
            });

            render(<SendMenu application={guardianApplication} />);

            fireEvent.click(screen.getByText("Send"));

            await waitFor(() =>
                expect(screen.getByText("Ether")).toBeVisible(),
            );
            expect(screen.queryByText("Foreclose")).not.toBeInTheDocument();
        });

        it("should show the Foreclose menu item for connected guardian account", async () => {
            setupCommonMocks({
                selectedConnection: { type: "system" },
                isConnected: true,
                chain: mainnet,
                address: guardianAddress,
            });

            render(<SendMenu application={guardianApplication} />);

            fireEvent.click(screen.getByText("Send"));

            await waitFor(() =>
                expect(screen.getByText("Foreclose")).toBeVisible(),
            );
        });

        it("should open the confirmation modal when Foreclose is clicked", async () => {
            setupCommonMocks({
                selectedConnection: { type: "system" },
                isConnected: true,
                chain: mainnet,
                address: guardianAddress,
            });

            render(<SendMenu application={guardianApplication} />);

            fireEvent.click(screen.getByText("Send"));

            await waitFor(() =>
                expect(screen.getByText("Foreclose")).toBeVisible(),
            );

            fireEvent.click(screen.getByText("Foreclose"));

            await waitFor(() =>
                expect(
                    screen.getByText("Are you sure you want to foreclose?"),
                ).toBeVisible(),
            );

            expect(
                screen.getByText(
                    "It is an irreversible action that prevents any further deposits or inputs to the application.",
                ),
            ).toBeVisible();

            expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        });

        it("should call foreclose action when the user confirms to proceed", async () => {
            const { actions } = setupCommonMocks({
                selectedConnection: { type: "system" },
                isConnected: true,
                chain: mainnet,
                address: guardianAddress,
            });

            render(<SendMenu application={guardianApplication} />);

            fireEvent.click(screen.getByText("Send"));
            await waitFor(() =>
                expect(screen.getByText("Foreclose")).toBeVisible(),
            );

            fireEvent.click(screen.getByText("Foreclose"));

            await waitFor(() =>
                expect(
                    screen.getByText("Are you sure you want to foreclose?"),
                ).toBeVisible(),
            );

            fireEvent.click(screen.getByText("Confirm"));

            await waitFor(() =>
                expect(
                    screen.queryByText("Are you sure you want to foreclose?"),
                ).not.toBeInTheDocument(),
            );

            expect(actions.foreclose).toHaveBeenCalledWith(guardianApplication);
        });

        it("should not call foreclose action when the confirmation modal is cancelled", async () => {
            const { actions } = setupCommonMocks({
                selectedConnection: { type: "system" },
                isConnected: true,
                chain: mainnet,
                address: guardianAddress,
            });

            render(<SendMenu application={guardianApplication} />);

            fireEvent.click(screen.getByText("Send"));

            await waitFor(() =>
                expect(screen.getByText("Foreclose")).toBeVisible(),
            );

            fireEvent.click(screen.getByText("Foreclose"));

            await waitFor(() =>
                expect(
                    screen.getByText("Are you sure you want to foreclose?"),
                ).toBeVisible(),
            );

            fireEvent.click(screen.getByText("Cancel"));

            await waitFor(() =>
                expect(
                    screen.queryByText("Are you sure you want to foreclose?"),
                ).not.toBeInTheDocument(),
            );

            expect(actions.foreclose).not.toHaveBeenCalled();
        });
    });
});
