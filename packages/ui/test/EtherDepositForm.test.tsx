import { fireEvent, render, screen } from "@testing-library/react";
import { afterAll, describe, it } from "vitest";
import { EtherDepositForm } from "../src/EtherDepositForm";
import withMantineTheme from "./utils/WithMantineTheme";

const Component = withMantineTheme(EtherDepositForm);

const applications = [
    "0x60a7048c3136293071605a4eaffef49923e981cc",
    "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c",
    "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3",
];

const defaultProps = {
    applications,
    onSubmit: () => undefined,
};

vi.mock("@cartesi/rollups-wagmi", async () => {
    return {
        usePrepareEtherPortalDepositEther: () => ({
            config: {},
        }),
        useEtherPortalDepositEther: () => ({
            data: {},
            wait: vi.fn(),
        }),
    };
});

vi.mock("wagmi", async () => {
    return {
        useWaitForTransaction: () => ({}),
        useNetwork: () => ({
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

describe("Rollups EtherDepositForm", () => {
    afterAll(() => {
        vi.restoreAllMocks();
    });

    describe("Textarea", () => {
        it("should display correct label", () => {
            render(<Component {...defaultProps} />);

            expect(screen.getByText("Extra data")).toBeInTheDocument();
        });

        it("should display correct description", () => {
            render(<Component {...defaultProps} />);

            expect(
                screen.getByText(
                    "Extra execution layer data handled by the application",
                ),
            ).toBeInTheDocument();
        });

        it("should display error when value is not hex", () => {
            const { container } = render(<Component {...defaultProps} />);
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
    });

    describe("Send button", () => {
        it("should be disabled when extra data is not hex", () => {
            const { container } = render(<Component {...defaultProps} />);
            const textarea = container.querySelector(
                "textarea",
            ) as HTMLTextAreaElement;
            const buttons = container.querySelectorAll("button");
            const submitButton = buttons[1] as HTMLButtonElement;

            fireEvent.change(textarea, {
                target: {
                    value: "",
                },
            });
            fireEvent.blur(textarea);

            expect(submitButton.hasAttribute("disabled")).toBe(true);
        });

        it("should invoke write function when send button is clicked", async () => {
            const selectedApplication = applications[1];
            const mockedWrite = vi.fn();
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            rollupsWagmi.usePrepareEtherPortalDepositEther = vi
                .fn()
                .mockReturnValue({
                    ...rollupsWagmi.usePrepareEtherPortalDepositEther,
                    loading: false,
                    error: null,
                });
            rollupsWagmi.useEtherPortalDepositEther = vi.fn().mockReturnValue({
                ...rollupsWagmi.useEtherPortalDepositEther,
                write: mockedWrite,
            });

            const { container } = render(<Component {...defaultProps} />);
            const buttons = container.querySelectorAll("button");
            const submitButton = buttons[1] as HTMLButtonElement;

            const inputs = container.querySelectorAll("input");
            const applicationInput = inputs[0] as HTMLInputElement;
            const amountInput = inputs[1] as HTMLInputElement;
            applicationInput.setAttribute("value", selectedApplication);

            fireEvent.change(applicationInput, {
                target: {
                    value: selectedApplication,
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
    });

    describe("ApplicationAutocomplete", () => {
        it("should display correct label", () => {
            render(<Component {...defaultProps} />);

            expect(screen.getByText("Application")).toBeInTheDocument();
        });

        it("should display correct description", () => {
            render(<Component {...defaultProps} />);

            expect(
                screen.getByText("The application smart contract address"),
            ).toBeInTheDocument();
        });

        it("should display correct placeholder", () => {
            const { container } = render(<Component {...defaultProps} />);
            const input = container.querySelector("input");

            expect(input?.getAttribute("placeholder")).toBe("0x");
        });

        it("should display alert for unemployed application", () => {
            const { container } = render(<Component {...defaultProps} />);
            const input = container.querySelector("input") as HTMLInputElement;

            fireEvent.change(input, {
                target: {
                    value: "0x60a7048c3136293071605a4eaffef49923e981fe",
                },
            });

            expect(
                screen.getByText(
                    "This is a deposit to an undeployed application.",
                ),
            ).toBeInTheDocument();
        });
    });
});
