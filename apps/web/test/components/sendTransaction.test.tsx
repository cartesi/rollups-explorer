import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, it } from "vitest";
import SendTransaction from "../../src/components/sendTransaction";
import withMantineTheme from "../utils/WithMantineTheme";
import sendTransactionMocks from "./sendTransaction.mocks";
const Component = withMantineTheme(SendTransaction);
import {
    useApplicationsQuery,
    useTokensQuery,
    useMultiTokensQuery,
} from "@cartesi/rollups-explorer-domain/explorer-hooks";
import { useBalance } from "wagmi";
import {
    useSimulateDAppAddressRelayRelayDAppAddress,
    useWriteDAppAddressRelayRelayDAppAddress,
} from "@cartesi/rollups-wagmi";

vi.mock("@cartesi/rollups-explorer-domain/explorer-hooks");
const useApplicationsQueryMock = vi.mocked(useApplicationsQuery, {
    partial: true,
});
const useTokensQueryMock = vi.mocked(useTokensQuery, { partial: true });
const useMultiTokensQueryMock = vi.mocked(useMultiTokensQuery, {
    partial: true,
});
const useWriteDAppAddressRelayRelayDAppAddressMock = vi.mocked(
    useWriteDAppAddressRelayRelayDAppAddress,
    { partial: true },
);
const useSimulateDAppAddressRelayRelayDAppAddressMock = vi.mocked(
    useSimulateDAppAddressRelayRelayDAppAddress,
    { partial: true },
);

vi.mock("viem", async () => {
    const actual = await vi.importActual("viem");
    return {
        ...(actual as any),
        getAddress: (address: string) => address,
    };
});

vi.mock("@cartesi/rollups-wagmi");
vi.mock("wagmi");
const useBalanceMock = vi.mocked(useBalance, { partial: true });

vi.mock("@tanstack/react-query", async () => {
    const actual = await vi.importActual("@tanstack/react-query");
    return {
        ...(actual as any),
        useQueryClient: () => ({
            invalidateQueries: vi.fn(),
        }),
    };
});

describe("SendTransaction component", () => {
    beforeEach(() => {
        sendTransactionMocks.setup();
        useApplicationsQueryMock.mockReturnValue([
            { data: {}, fetching: false },
        ] as any);
        useTokensQueryMock.mockReturnValue([
            { data: {}, fetching: false },
        ] as any);
        useMultiTokensQueryMock.mockReturnValue([
            { data: {}, fetching: false },
        ] as any);
        useBalanceMock.mockReturnValue({
            data: {
                value: 355943959031747438n,
                decimals: 18,
            },
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should show ERC20 deposit form", () => {
        render(<Component initialDepositType="erc20" />);
        expect(screen.getByTestId("erc20-deposit-form")).toBeInTheDocument();
    });

    it("should show ERC721 deposit form", () => {
        render(<Component initialDepositType="erc721" />);
        expect(screen.getByTestId("erc721-deposit-form")).toBeInTheDocument();
    });

    it("should show Ether deposit form", () => {
        render(<Component initialDepositType="ether" />);
        expect(screen.getByTestId("ether-deposit-form")).toBeInTheDocument();
    });

    it("should show Raw input form", () => {
        render(<Component initialDepositType="input" />);
        expect(screen.getByTestId("raw-input-form")).toBeInTheDocument();
    });

    it("should show ERC1155 single deposit form", () => {
        render(<Component initialDepositType="erc1155" />);
        expect(screen.getByTestId("erc1155-deposit-form")).toBeInTheDocument();
    });

    it("should show ERC1155 batch deposit form", () => {
        render(<Component initialDepositType="erc1155Batch" />);
        expect(
            screen.getByTestId("erc1155-batch-deposit-form"),
        ).toBeInTheDocument();
    });

    it("should initially query 10 applications with no predefined search", () => {
        const mockedFn = vi.fn().mockReturnValue([{ data: {} }]);
        useApplicationsQueryMock.mockImplementation(mockedFn);

        render(<Component initialDepositType="erc20" />);

        expect(mockedFn).toHaveBeenCalledWith({
            variables: {
                limit: 10,
                where: {
                    address_containsInsensitive: "",
                    chain: {
                        id_eq: "11155111",
                    },
                },
            },
        });
    });

    it("should query applications with given search id, using debouncing", async () => {
        render(<Component initialDepositType="erc20" />);
        const mockedFn = vi.fn().mockReturnValue([{ data: {} }]);
        useApplicationsQueryMock.mockImplementation(mockedFn);

        const rawInputForm = screen.queryByTestId(
            "erc20-deposit-form",
        ) as HTMLFormElement;
        const applicationInput = rawInputForm.querySelector(
            "input",
        ) as HTMLInputElement;

        const search = "0x60a7048c3136293071605a4eaffef49923e981cc";

        fireEvent.change(applicationInput, {
            target: {
                value: search,
            },
        });

        expect(mockedFn).toHaveBeenCalledWith({
            variables: {
                limit: 10,
                where: {
                    address_containsInsensitive: "",
                    chain: {
                        id_eq: "11155111",
                    },
                },
            },
        });

        await waitFor(
            () => {
                expect(mockedFn).toHaveBeenCalledWith({
                    variables: {
                        limit: 10,
                        where: {
                            address_containsInsensitive: search,
                            chain: {
                                id_eq: "11155111",
                            },
                        },
                    },
                });
            },
            {
                timeout: 500,
            },
        );
    });

    it("should initially query 10 tokens with no predefined search", () => {
        const mockedFn = vi.fn().mockReturnValue([{ data: {} }]);
        useTokensQueryMock.mockImplementation(mockedFn);

        render(<Component initialDepositType="erc20" />);

        expect(mockedFn).toHaveBeenCalledWith({
            variables: {
                limit: 10,
                where: {
                    address_containsInsensitive: "",
                    chain: {
                        id_eq: "11155111",
                    },
                },
            },
        });
    });

    it("should query tokens with given search id, using debouncing", async () => {
        render(<Component initialDepositType="erc20" />);
        const mockedFn = vi.fn().mockReturnValue([{ data: {} }]);
        useTokensQueryMock.mockImplementation(mockedFn);

        const rawInputForm = screen.queryByTestId(
            "erc20-deposit-form",
        ) as HTMLFormElement;
        const applicationInput = rawInputForm.querySelector(
            "input",
        ) as HTMLInputElement;

        const applicationSearch = "0x60a7048c3136293071605a4eaffef49923e981cc";

        fireEvent.change(applicationInput, {
            target: {
                value: applicationSearch,
            },
        });

        await waitFor(
            () => expect(screen.getByText("Rollup v1")).toBeInTheDocument(),
            {
                timeout: 2000,
            },
        );

        fireEvent.click(screen.getByText("Rollup v1"));

        const tokenInputForm = screen.queryByTestId(
            "erc20address-input",
        ) as HTMLFormElement;
        const search =
            "SIM20 - SimpleERC20 - 0x059c7507b973d1512768c06f32a813bc93d83eb2";
        const formattedValue = search.substring(search.indexOf("0x"));

        fireEvent.change(tokenInputForm, {
            target: {
                value: formattedValue,
            },
        });

        expect(mockedFn).toHaveBeenCalledWith({
            variables: {
                limit: 10,
                where: {
                    address_containsInsensitive: "",
                    chain: {
                        id_eq: "11155111",
                    },
                },
            },
        });

        await waitFor(() =>
            expect(
                screen.getByText("Amount of tokens to deposit"),
            ).toBeInTheDocument(),
        );

        await waitFor(() => {
            expect(mockedFn).toHaveBeenCalledWith({
                variables: {
                    limit: 10,
                    where: {
                        address_containsInsensitive: formattedValue,
                        chain: {
                            id_eq: "11155111",
                        },
                    },
                },
            });
        });
    });

    it("should reset the form when selecting a new one", async () => {
        useWriteDAppAddressRelayRelayDAppAddressMock.mockReturnValue({});
        useSimulateDAppAddressRelayRelayDAppAddressMock.mockReturnValue({
            error: null,
        });
        render(<Component initialDepositType="relay" />);

        const form = screen.queryByTestId(
            "address-relay-form",
        ) as HTMLFormElement;

        const applicationInput = form.querySelector(
            "input",
        ) as HTMLInputElement;

        const applicationSearch = "0x60a7048c3136293071605a4eaffef49923e981cc";

        fireEvent.change(applicationInput, {
            target: {
                value: applicationSearch,
            },
        });

        await waitFor(() =>
            expect(screen.getByTestId("send-transaction")).toBeEnabled(),
        );

        const depositTypeSelect = screen.getByTestId("deposit-type-select");

        fireEvent.click(depositTypeSelect);

        fireEvent.click(screen.getByText("Generic Input"));

        await waitFor(() =>
            expect(screen.getByTestId("raw-input-form")).toBeInTheDocument(),
        );

        await waitFor(() =>
            expect(() => screen.getByTestId("generic-input-fields")).toThrow(
                "Unable to find an element",
            ),
        );
    });
});
