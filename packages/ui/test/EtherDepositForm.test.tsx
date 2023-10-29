import { render, screen, fireEvent } from "@testing-library/react";
import { afterAll, describe, it } from "vitest";
import {
    EtherDepositForm,
    ApplicationAutocomplete,
} from "../src/EtherDepositForm";
import withMantineTheme from "./utils/WithMantineTheme";
// import {useEtherPortalDepositEther, usePrepareEtherPortalDepositEther} from "@cartesi/rollups-wagmi";

const ApplicationAutoCompleteComponent = withMantineTheme(
    ApplicationAutocomplete,
);

const Component = withMantineTheme(EtherDepositForm);

const applications = [
    "0x60a7048c3136293071605a4eaffef49923e981cc",
    "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c",
    "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3",
];

const defaultApplicationProps = {
    applications,
    application: applications[0],
    onChange: () => undefined,
};

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

            expect(textarea.getAttribute("aria-invalid")).toBe("true");
            expect(screen.getByText("Invalid hex string")).toBeInTheDocument();
        });
    });

    describe("Send button", () => {
        it("should be disabled when raw input is not hex", () => {
            const { container } = render(<Component {...defaultProps} />);
            const textarea = container.querySelector(
                "textarea",
            ) as HTMLTextAreaElement;
            const button = container.querySelector(
                "button",
            ) as HTMLButtonElement;

            fireEvent.change(textarea, {
                target: {
                    value: "",
                },
            });

            expect(button.hasAttribute("disabled")).toBe(true);
        });

        it("should invoke write function when send button is clicked", async () => {
            const selectedApplication = applications[1];
            const mockedWrite = vi.fn();
            const rollupsWagmi = await import("@cartesi/rollups-wagmi");
            rollupsWagmi.usePrepareEtherPortalDepositEther = vi
                .fn()
                .mockReturnValue({
                    ...rollupsWagmi.usePrepareEtherPortalDepositEther,
                    error: null,
                });
            rollupsWagmi.useEtherPortalDepositEther = vi.fn().mockReturnValue({
                ...rollupsWagmi.useEtherPortalDepositEther,
                write: mockedWrite,
            });

            const { container } = render(<Component {...defaultProps} />);
            const button = container.querySelector(
                "button",
            ) as HTMLButtonElement;

            const input = container.querySelector("input") as HTMLInputElement;
            input.setAttribute("value", selectedApplication);

            fireEvent.change(input, {
                target: {
                    value: selectedApplication,
                },
            });

            fireEvent.click(button);
            expect(button.hasAttribute("disabled")).toBe(false);
            expect(mockedWrite).toHaveBeenCalled();
        });
    });

    describe("ApplicationAutocomplete", () => {
        it("should display correct label", () => {
            render(
                <ApplicationAutoCompleteComponent
                    {...defaultApplicationProps}
                />,
            );

            expect(screen.getByText("Application")).toBeInTheDocument();
        });

        it("should display correct description", () => {
            render(
                <ApplicationAutoCompleteComponent
                    {...defaultApplicationProps}
                />,
            );

            expect(
                screen.getByText("The application smart contract address"),
            ).toBeInTheDocument();
        });

        it("should display correct placeholder", () => {
            const { container } = render(
                <ApplicationAutoCompleteComponent
                    {...defaultApplicationProps}
                />,
            );
            const input = container.querySelector("input");

            expect(input?.getAttribute("placeholder")).toBe("0x");
        });

        it("should display alert for unemployed application", () => {
            render(
                <ApplicationAutoCompleteComponent
                    {...defaultApplicationProps}
                    application="undeployed-application"
                />,
            );

            expect(
                screen.getByText("This is an undeployed application."),
            ).toBeInTheDocument();
        });

        it("should should set input value to selected application", () => {
            const selectedApplication = applications[1];
            const { container } = render(
                <ApplicationAutoCompleteComponent
                    {...defaultApplicationProps}
                    application={selectedApplication}
                />,
            );
            const input = container.querySelector("input");

            expect(input?.getAttribute("value")).toBe(selectedApplication);
        });
    });
});
