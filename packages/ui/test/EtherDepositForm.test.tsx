import {
    etherPortalAbi,
    etherPortalAddress,
    v2EtherPortalAbi,
    v2EtherPortalAddress,
} from "@cartesi/rollups-wagmi";
import {
    fireEvent,
    getByText,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { omit } from "ramda";
import { beforeEach, describe, it } from "vitest";
import {
    useSimulateContract,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";
import { EtherDepositForm } from "../src/EtherDepositForm";
import { Application } from "../src/commons/interfaces";
import withMantineTheme from "./utils/WithMantineTheme";

const Component = withMantineTheme(EtherDepositForm);

const applications: Application[] = [
    {
        address: "0x60a7048c3136293071605a4eaffef49923e981cc",
        id: "11155111-0x60a7048c3136293071605a4eaffef49923e981cc-v1",
        rollupVersion: "v1",
    },
    {
        address: "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c",
        id: "11155111-0x70ac08179605af2d9e75782b8decdd3c22aa4d0c-v1",
        rollupVersion: "v1",
    },
    {
        address: "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3",
        id: "11155111-0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3-v1",
        rollupVersion: "v1",
    },
];

const selectApp = (app: Application) => {
    const appInput = screen.getByTestId("application-input");

    return fireEvent.change(appInput, {
        target: {
            value: app.address.toLowerCase(),
        },
    });
};

const setRequiredValueToOpenForm = async (app: Application) => {
    selectApp(app);
    await waitFor(() => expect(screen.getByText("Advanced")).toBeVisible());

    fireEvent.click(screen.getByText("Advanced"));

    await waitFor(() => expect(screen.getByText("Extra data")).toBeVisible());
};

const defaultProps = {
    applications,
    isLoadingApplications: false,
    onSearchApplications: () => undefined,
    onSuccess: () => undefined,
};

vi.mock("wagmi", async () => {
    const actual = await vi.importActual("wagmi");

    return {
        ...actual,
        useSimulateContract: vi.fn(),
        useWriteContract: vi.fn(),
        useWaitForTransactionReceipt: vi.fn(),
        useAccount: () => ({
            chain: {
                nativeCurrency: {
                    decimals: 18,
                },
            },
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

const useSimulateContractMock = vi.mocked(useSimulateContract, {
    partial: true,
});

const useWriteContractMock = vi.mocked(useWriteContract, { partial: true });
const useWaitForTransactionReceiptMock = vi.mocked(
    useWaitForTransactionReceipt,
    { partial: true },
);

/**
 * Object to support testing callback calls like onSuccces, onSearchApplication etc.
 * That wait object is to avoid infinite loop by making a computed prop change when deposit reset is called.
 */
const depositWaitStatus = {
    _status: "success",
    get props(): {
        status?: "success";
        isSuccess?: true;
    } {
        return this._status === "success"
            ? { status: "success", isSuccess: true }
            : {};
    },
    reset() {
        this._status = "idle";
    },
};

describe("Rollups EtherDepositForm", () => {
    beforeEach(() => {
        useSimulateContractMock.mockReturnValue({
            data: undefined,
            status: "success",
            isLoading: false,
            isFetching: false,
            isSuccess: true,
        });

        useWriteContractMock.mockReturnValue({
            data: undefined,
            status: "idle",
            writeContract: vi.fn(),
            reset: vi.fn(),
        });

        useWaitForTransactionReceiptMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isSuccess: false,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should display only the application field initially", () => {
        render(<Component {...defaultProps} />);

        expect(screen.getByText("Application")).toBeInTheDocument();
        expect(
            screen.getByText("The application smart contract address"),
        ).toBeInTheDocument();
    });

    it("should display the other fields and deposit button after an application is chosen", () => {
        render(
            <Component {...defaultProps} applications={[applications[0]]} />,
        );

        expect(screen.getByText("Application")).toBeInTheDocument();
        expect(screen.getByText("Amount")).toBeInTheDocument();
        expect(screen.getByText("Advanced")).toBeInTheDocument();
        expect(screen.getByText("Deposit")).toBeInTheDocument();
    });

    it("should display warning message for undeployed app application", async () => {
        render(<Component {...defaultProps} applications={[]} />);

        const appInput = screen.getByTestId("application-input");

        fireEvent.change(appInput, {
            target: {
                value: "0x60a7048c3136293071605a4eaffef49923e981fe",
            },
        });

        await waitFor(() =>
            expect(
                screen.getByText(
                    "This is a deposit to an undeployed application.",
                ),
            ).toBeVisible(),
        );
    });

    it("should ask user to choose rollup version when application is considered undeployed", async () => {
        render(<Component {...defaultProps} applications={[]} />);

        const appInput = screen.getByTestId("application-input");

        fireEvent.change(appInput, {
            target: {
                value: "0x60a7048c3136293071605a4eaffef49923e981fe",
            },
        });

        await waitFor(() =>
            expect(
                screen.getByText(
                    "This is a deposit to an undeployed application.",
                ),
            ).toBeVisible(),
        );

        expect(screen.getByText("Cartesi Rollups version")).toBeVisible();
        expect(
            screen.getByText(
                "Set the rollup version to call the correct contracts.",
            ),
        ).toBeVisible();

        const segmentControlOptions = screen.getByRole("radiogroup");

        expect(getByText(segmentControlOptions, "Rollup v1")).toBeVisible();
        expect(getByText(segmentControlOptions, "Rollup v2")).toBeVisible();
    });

    it("should display the rest of the form after user manually choose the Rollup version", async () => {
        render(<Component {...defaultProps} applications={[]} />);

        const appInput = screen.getByTestId("application-input");

        fireEvent.change(appInput, {
            target: {
                value: "0x60a7048c3136293071605a4eaffef49923e981fe",
            },
        });

        await waitFor(() =>
            expect(screen.getByText("Cartesi Rollups version")).toBeVisible(),
        );

        const segmentControlOptions = screen.getByRole("radiogroup");

        expect(screen.queryByText("Deposit")).not.toBeInTheDocument();

        fireEvent.click(getByText(segmentControlOptions, "Rollup v1"));

        await waitFor(() =>
            expect(screen.getByTestId("eth-amount-input")).toBeVisible(),
        );

        expect(screen.getByText("Advanced")).toBeVisible();
        expect(screen.getByText("Deposit")).toBeVisible();
    });

    it("should setup correct contract configs when rollup version is chosen for undeployed application", async () => {
        render(<Component {...defaultProps} applications={[]} />);

        const appInput = screen.getByTestId("application-input");

        fireEvent.change(appInput, {
            target: {
                value: "0x60a7048c3136293071605a4eaffef49923e981fe",
            },
        });

        await waitFor(() =>
            expect(screen.getByText("Cartesi Rollups version")).toBeVisible(),
        );

        const segmentControlOptions = screen.getByRole("radiogroup");
        fireEvent.click(getByText(segmentControlOptions, "Rollup v1"));

        const paramsForV1 = useSimulateContractMock.mock.lastCall?.[0] ?? {};

        expect(paramsForV1).toHaveProperty("abi", etherPortalAbi);
        expect(paramsForV1).toHaveProperty("address", etherPortalAddress);

        fireEvent.click(getByText(segmentControlOptions, "Rollup v2"));

        const paramsForV2 = useSimulateContractMock.mock.lastCall?.[0] ?? {};

        expect(paramsForV2).toHaveProperty("abi", v2EtherPortalAbi);
        expect(paramsForV2).toHaveProperty("address", v2EtherPortalAddress);
    });

    describe("Extra data textarea", () => {
        it("should display correct label and description", async () => {
            render(
                <Component
                    {...defaultProps}
                    applications={[applications[0]]}
                />,
            );

            await setRequiredValueToOpenForm(applications[0]);

            expect(screen.getByText("Extra data")).toBeVisible();

            expect(
                screen.getByText(
                    "Extra execution layer data handled by the application",
                ),
            ).toBeVisible();
        });

        it("should display error when value is not hex", async () => {
            const { container } = render(
                <Component
                    {...defaultProps}
                    applications={[applications[0]]}
                />,
            );

            await setRequiredValueToOpenForm(applications[0]);

            const textarea = container.querySelector(
                "textarea",
            ) as HTMLTextAreaElement;

            fireEvent.change(textarea, {
                target: {
                    value: "",
                },
            });

            fireEvent.blur(textarea);

            expect(textarea.getAttribute("aria-invalid")).toBe("true");
            expect(screen.getByText("Invalid hex string")).toBeInTheDocument();
        });

        it("should not display error when value is hex", async () => {
            const { container } = render(
                <Component
                    {...defaultProps}
                    applications={[applications[0]]}
                />,
            );

            await setRequiredValueToOpenForm(applications[0]);

            const textarea = container.querySelector(
                "textarea",
            ) as HTMLTextAreaElement;

            fireEvent.change(textarea, {
                target: {
                    value: "0x123123",
                },
            });

            fireEvent.blur(textarea);

            expect(textarea.getAttribute("aria-invalid")).toBe("false");
            expect(() => screen.getByText("Invalid hex string")).toThrow(
                "Unable to find an element",
            );
        });

        it("should correctly format extra data", async () => {
            const { container } = render(
                <Component
                    {...defaultProps}
                    applications={[applications[0]]}
                />,
            );

            await setRequiredValueToOpenForm(applications[0]);

            const execLayerDataInput = container.querySelector(
                "textarea",
            ) as HTMLTextAreaElement;

            const hexValue = "0x123123";

            fireEvent.change(execLayerDataInput, {
                target: {
                    value: hexValue,
                },
            });

            const simulateParams =
                useSimulateContractMock.mock.lastCall?.[0] ?? {};

            expect(simulateParams).toHaveProperty("args", [
                "0x60a7048c3136293071605a4eaffef49923e981cc",
                hexValue,
            ]);

            expect(simulateParams).toHaveProperty("query", { enabled: false });
            expect(simulateParams).toHaveProperty("value", undefined);
        });
    });

    describe("Send button", () => {
        it("should be disabled when extra data is not hex", async () => {
            render(
                <Component
                    {...defaultProps}
                    applications={[applications[0]]}
                />,
            );

            await setRequiredValueToOpenForm(applications[0]);

            const textarea = screen.getByTestId("eth-extra-data-input");
            const submitButton = screen.getByText("Deposit").closest("button");

            fireEvent.change(textarea, {
                target: {
                    value: "",
                },
            });

            fireEvent.blur(textarea);

            expect(submitButton?.hasAttribute("disabled")).toBe(true);
        });

        it("should invoke write function when send button is clicked", async () => {
            const selectedApplication = applications[1];
            const mockedWrite = vi.fn();

            useSimulateContractMock.mockReturnValue({
                data: {
                    request: {},
                },
                isLoading: false,
                error: null,
            });

            useWriteContractMock.mockReturnValue({
                reset: vi.fn(),
                writeContract: mockedWrite,
            });

            render(
                <Component
                    {...defaultProps}
                    applications={[selectedApplication]}
                />,
            );

            await setRequiredValueToOpenForm(selectedApplication);

            const appInput = screen.getByTestId("application-input");
            const amountInput = screen.getByTestId("eth-amount-input");
            const submitButton = screen.getByText("Deposit");

            fireEvent.change(appInput, {
                target: {
                    value: selectedApplication.address.toLowerCase(),
                },
            });

            fireEvent.change(amountInput, {
                target: {
                    value: "1",
                },
            });

            fireEvent.blur(amountInput);

            expect(submitButton.hasAttribute("disabled")).toBe(false);

            fireEvent.click(submitButton);

            expect(mockedWrite).toHaveBeenCalled();
        });

        it('should enable "useSimulateContract" only when the form is valid', async () => {
            const selectedApp = applications[0];

            render(
                <Component {...defaultProps} applications={[selectedApp]} />,
            );

            await setRequiredValueToOpenForm(selectedApp);

            const appInput = screen.getByTestId("application-input");
            const amountInput = screen.getByTestId("eth-amount-input");
            const textarea = screen.getByTestId("eth-extra-data-input");

            let params = useSimulateContractMock.mock.lastCall?.[0] ?? {};

            expect(params).toHaveProperty("query", { enabled: false });

            fireEvent.change(appInput, {
                target: {
                    value: selectedApp.address.toLowerCase(),
                },
            });

            fireEvent.change(amountInput, {
                target: {
                    value: "",
                },
            });

            params = useSimulateContractMock.mock.lastCall?.[0] ?? {};

            expect(params).toHaveProperty("query", { enabled: false });

            fireEvent.change(amountInput, {
                target: {
                    value: "0.1",
                },
            });

            params = useSimulateContractMock.mock.lastCall?.[0] ?? {};

            expect(params).toHaveProperty("query", { enabled: true });

            fireEvent.change(textarea, {
                target: { value: "invalid-hex-value" },
            });

            params = useSimulateContractMock.mock.lastCall?.[0] ?? {};

            expect(params).toHaveProperty("query", { enabled: false });

            fireEvent.change(textarea, { target: { value: "0x" } });

            params = useSimulateContractMock.mock.lastCall?.[0] ?? {};

            expect(params).toHaveProperty("query", { enabled: true });
            expect(params).toHaveProperty("args", [
                selectedApp.address.toLowerCase(),
                "0x",
            ]);
            expect(params).toHaveProperty("value", 100000000000000000n);
        });

        it("should invoke onSearchApplications and OnSuccess function after successful deposit", async () => {
            const app = applications[0];
            const onSearchApplicationsMock = vi.fn();
            const onSuccessMock = vi.fn();

            useWriteContractMock.mockReturnValue({
                status: "success",
                data: "0x0001",
                reset: () => {
                    depositWaitStatus.reset();
                },
            });

            useWaitForTransactionReceiptMock.mockImplementation((params) => {
                return params?.hash === "0x0001"
                    ? {
                          ...depositWaitStatus.props,
                          fetchStatus: "idle",
                          data: { transactionHash: "0x01" },
                      }
                    : {
                          fetchStatus: "idle",
                      };
            });

            render(
                <Component
                    {...defaultProps}
                    onSearchApplications={onSearchApplicationsMock}
                    onSuccess={onSuccessMock}
                    applications={[app]}
                />,
            );

            await setRequiredValueToOpenForm(app);

            expect(onSearchApplicationsMock).toHaveBeenCalledWith("");
            expect(onSuccessMock).toHaveBeenCalledWith({
                receipt: { transactionHash: "0x01" },
                type: "ETHER",
            });
        });
    });

    describe("ApplicationAutocomplete", () => {
        it("should display correct placeholder", () => {
            render(<Component {...defaultProps} />);
            const input = screen.getByTestId("application-input");

            expect(input.getAttribute("placeholder")).toBe("0x");
        });

        it("should display error when application is invalid", () => {
            render(<Component {...defaultProps} />);
            const input = screen.getByTestId("application-input");

            fireEvent.change(input, {
                target: {
                    value: "0x60a7048c",
                },
            });

            fireEvent.blur(input);

            expect(input.getAttribute("aria-invalid")).toBe("true");
            expect(
                screen.getByText("Invalid application address"),
            ).toBeInTheDocument();
        });
    });

    describe("Alerts", () => {
        it("should display feedback for failed transaction", async () => {
            const message = "User declined the transaction";

            useWaitForTransactionReceiptMock.mockReturnValue({
                data: undefined,
                error: {
                    message,
                    shortMessage: "",
                    code: 10,
                    details: message,
                    name: "UnknownRpcError",
                    version: "10",
                    walk() {
                        return new Error(message);
                    },
                },
                status: "error",
            });

            render(
                <Component
                    {...defaultProps}
                    applications={[applications[0]]}
                />,
            );

            await setRequiredValueToOpenForm(applications[0]);

            expect(screen.getByText(message)).toBeInTheDocument();
        });
    });

    describe("Amount input", () => {
        it("should correctly process small decimal numbers", async () => {
            const { container } = render(
                <Component
                    {...defaultProps}
                    applications={[applications[0]]}
                />,
            );
            await setRequiredValueToOpenForm(applications[0]);

            const appInput = screen.getByTestId("application-input");
            const amountInput = screen.getByTestId("eth-amount-input");

            fireEvent.change(amountInput, {
                target: {
                    value: "0.0000001",
                },
            });

            const params = useSimulateContractMock.mock.lastCall?.[0] ?? {};

            expect(omit(["abi", "address", "functionName"], params)).toEqual({
                args: [applications[0].address.toLowerCase(), "0x"],
                value: 100000000000n,
                query: {
                    enabled: true,
                },
            });
        });
    });
});
