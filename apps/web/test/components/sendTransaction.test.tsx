import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, describe, it } from "vitest";
import SendTransaction from "../../src/components/sendTransaction";
import withMantineTheme from "../utils/WithMantineTheme";
const Component = withMantineTheme(SendTransaction);

vi.mock("../../src/graphql", async () => {
    return {
        useApplicationsQuery: () => [{ data: {}, fetching: false }],
        useTokensQuery: () => [{ data: {}, fetching: false }],
    };
});

vi.mock("@cartesi/rollups-wagmi", async () => {
    return {
        usePrepareInputBoxAddInput: () => ({
            config: {},
        }),
        useInputBoxAddInput: () => ({
            data: {},
            wait: vi.fn(),
        }),
    };
});

vi.mock("viem", async () => {
    const actual = await vi.importActual("viem");
    return {
        ...(actual as any),
        getAddress: (address: string) => address,
    };
});

vi.mock("@cartesi/rollups-wagmi", async () => {
    const actual = await vi.importActual("@cartesi/rollups-wagmi");
    return {
        ...(actual as any),
        usePrepareErc20Approve: () => ({
            config: {},
        }),
        useErc20Approve: () => ({
            data: {},
            wait: vi.fn(),
        }),
        usePrepareErc20PortalDepositErc20Tokens: () => ({
            config: {},
        }),
        useErc20PortalDepositErc20Tokens: () => ({
            data: {},
            wait: vi.fn(),
        }),
    };
});

vi.mock("wagmi", async () => {
    return {
        useContractReads: () => ({
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
        }),
        useAccount: () => ({
            address: "0x8FD78976f8955D13bAA4fC99043208F4EC020D7E",
        }),
        usePrepareContractWrite: () => ({}),
        useWaitForTransaction: () => ({}),
        useContractWrite: () => ({}),
        useNetwork: () => ({}),
    };
});

describe("SendTransaction component", () => {
    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("should show ERC20 deposit form", async () => {
        render(<Component initialDepositType="erc20" />);
        expect(screen.getByTestId("erc20-deposit-form")).toBeInTheDocument();
    });

    it("should show Raw input form", () => {
        render(<Component initialDepositType="input" />);
        expect(screen.getByTestId("raw-input-form")).toBeInTheDocument();
    });

    it("should show Ether deposit form", () => {
        render(<Component initialDepositType="ether" />);
        expect(screen.getByTestId("ether-deposit-form")).toBeInTheDocument();
    });

    it("should initially query 10 applications with no predefined search", async () => {
        const mockedFn = vi.fn().mockReturnValue([{ data: {} }]);
        const graphqlModule = await import("../../src/graphql");
        graphqlModule.useApplicationsQuery = vi
            .fn()
            .mockImplementation(mockedFn);

        render(<Component initialDepositType="input" />);

        expect(mockedFn).toHaveBeenCalledWith({
            variables: {
                limit: 10,
                where: {
                    id_containsInsensitive: "",
                },
            },
        });
    });

    it("should query applications with given search id, using debouncing", async () => {
        render(<Component initialDepositType="input" />);

        const mockedFn = vi.fn().mockReturnValue([{ data: {} }]);
        const graphqlModule = await import("../../src/graphql");
        graphqlModule.useApplicationsQuery = vi
            .fn()
            .mockImplementation(mockedFn);

        const rawInputForm = screen.queryByTestId(
            "raw-input-form",
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
                    id_containsInsensitive: "",
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
                    id_containsInsensitive: search,
                },
            },
        });
    });

    it("should initially query 10 tokens with no predefined search", async () => {
        const mockedFn = vi.fn().mockReturnValue([{ data: {} }]);
        const graphqlModule = await import("../../src/graphql");
        graphqlModule.useTokensQuery = vi.fn().mockImplementation(mockedFn);

        render(<Component initialDepositType="input" />);

        expect(mockedFn).toHaveBeenCalledWith({
            variables: {
                limit: 10,
                where: {
                    id_containsInsensitive: "",
                },
            },
        });
    });

    it("should query tokens with given search id, using debouncing", async () => {
        render(<Component initialDepositType="erc20" />);

        const mockedFn = vi.fn().mockReturnValue([{ data: {} }]);
        const graphqlModule = await import("../../src/graphql");
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
                    id_containsInsensitive: "",
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
                    id_containsInsensitive: formattedValue,
                },
            },
        });
    });
});
