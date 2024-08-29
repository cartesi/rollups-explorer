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

vi.mock("../../src/graphql/explorer/hooks/queries", async () => {
    return {
        useApplicationsQuery: () => [{ data: {}, fetching: false }],
        useTokensQuery: () => [{ data: {}, fetching: false }],
        useMultiTokensQuery: () => [{ data: {}, fetching: false }],
    };
});

vi.mock("viem", async () => {
    const actual = await vi.importActual("viem");
    return {
        ...(actual as any),
        getAddress: (address: string) => address,
    };
});

vi.mock("@cartesi/rollups-wagmi");
vi.mock("wagmi");

vi.mock("@tanstack/react-query", async () => {
    const actual = await vi.importActual("@tanstack/react-query");
    return {
        ...(actual as any),
        useQueryClient: () => ({
            invalidateQueries: () => undefined,
        }),
    };
});

describe("SendTransaction component", () => {
    beforeEach(() => {
        sendTransactionMocks.setup();
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

    it("should initially query 10 applications with no predefined search", async () => {
        const mockedFn = vi.fn().mockReturnValue([{ data: {} }]);
        const graphqlModule = await import(
            "../../src/graphql/explorer/hooks/queries"
        );
        graphqlModule.useApplicationsQuery = vi
            .fn()
            .mockImplementation(mockedFn);

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
        const graphqlModule = await import(
            "../../src/graphql/explorer/hooks/queries"
        );
        graphqlModule.useApplicationsQuery = vi
            .fn()
            .mockImplementation(mockedFn);

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

        await waitFor(() => expect(mockedFn).toHaveBeenCalledTimes(2), {
            timeout: 500,
        });

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
    });

    it("should initially query 10 tokens with no predefined search", async () => {
        const mockedFn = vi.fn().mockReturnValue([{ data: {} }]);
        const graphqlModule = await import(
            "../../src/graphql/explorer/hooks/queries"
        );
        graphqlModule.useTokensQuery = vi.fn().mockImplementation(mockedFn);

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
        const graphqlModule = await import(
            "../../src/graphql/explorer/hooks/queries"
        );
        graphqlModule.useTokensQuery = vi.fn().mockImplementation(mockedFn);

        const tokenInputForm = screen.queryByTestId(
            "erc20Address",
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

        await waitFor(() => expect(mockedFn).toHaveBeenCalledTimes(2), {
            timeout: 500,
        });

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
