import * as mantineHooks from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
    cleanup,
    fireEvent,
    getByText,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { FC, act } from "react";
import { SpecificationFormView } from "../../../src/components/specification/SpecificationFormView";
import localRepository from "../../../src/components/specification/hooks/localRepository";
import {
    repositoryAtom,
    specificationsAtom,
} from "../../../src/components/specification/hooks/useSpecification";
import withMantineTheme from "../../utils/WithMantineTheme";
import { encodedDataSamples } from "./encodedData.stubs";
import { JotaiTestProvider } from "./jotaiHelpers";
import { erc1155JSONABISpecStub } from "./specification.stubs";

vi.mock("@mantine/hooks", async () => {
    const actual = await vi.importActual<typeof mantineHooks>("@mantine/hooks");

    return {
        ...actual,
        useMediaQuery: vi.fn(),
    };
});

const useMediaQueryMock = vi.mocked(mantineHooks.useMediaQuery, {
    partial: true,
});

const View = withMantineTheme(SpecificationFormView);
type Props = Parameters<typeof View>[0];

const StatefulView: FC<{ initialValues?: any; viewProps?: Props }> = ({
    initialValues,
    viewProps,
}) => (
    <JotaiTestProvider
        initialValues={initialValues ?? [[specificationsAtom, []]]}
    >
        <View {...viewProps} />
    </JotaiTestProvider>
);

describe("Specification Form View", () => {
    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    describe("JSON ABI mode", () => {
        it("should display info message including external link to abitype documentation", async () => {
            await act(async () => render(<StatefulView />));

            const modeInfoEl = screen.getByTestId("specification-mode-info");

            expect(
                getByText(
                    modeInfoEl,
                    "Use human readable ABI format to generate a full fledged JSON-ABI and decode standard ABI encoded data (i.e. 4 byte selector & arguments).",
                ),
            ).toBeInTheDocument();
            const modeInfoLink = getByText(
                modeInfoEl,
                "Human-readable ABI",
            ).closest("a");
            expect(modeInfoLink?.getAttribute("href")).toEqual(
                "https://abitype.dev/api/human",
            );
        });

        it("should display a preview for generated JSON ABI and recognized signatures", async () => {
            await act(async () => render(<StatefulView />));

            act(() => {
                fireEvent.change(screen.getByLabelText("ABI"), {
                    target: { value: "function balanceOf()" },
                });

                expect(screen.getByText("ABI Signatures")).toBeVisible();
                expect(screen.getByText("JSON ABI Generated")).toBeVisible();
            });
        });

        it("should be able to save valid form and see a notification", async () => {
            const onSuccess = vi.fn();
            const showSpy = vi.spyOn(notifications, "show");
            await act(async () =>
                render(<StatefulView viewProps={{ onSuccess }} />),
            );

            act(() => {
                fireEvent.change(
                    screen.getByTestId("specification-name-input"),
                    {
                        target: { value: "My Spec Test Name" },
                    },
                );
                fireEvent.change(screen.getByLabelText("ABI"), {
                    target: { value: "function balanceOf()" },
                });
            });

            act(() =>
                fireEvent.click(
                    screen
                        .getByText("Save")
                        .closest("button") as HTMLButtonElement,
                ),
            );

            await waitFor(() =>
                expect(showSpy).toHaveBeenCalledWith({
                    color: "green",
                    message: "Specification My Spec Test Name Saved!",
                    title: "Success!",
                    withBorder: true,
                    withCloseButton: true,
                }),
            );

            expect(onSuccess).toHaveBeenCalledWith({
                formMode: "CREATION",
                spec: expect.objectContaining({
                    name: "My Spec Test Name",
                    mode: "json_abi",
                    abi: [
                        {
                            inputs: [],
                            name: "balanceOf",
                            outputs: [],
                            stateMutability: "nonpayable",
                            type: "function",
                        },
                    ],
                }),
            });
        });

        it("should notify the user when saving a specification fails", async () => {
            const onSuccess = vi.fn();
            vi.spyOn(localRepository, "add").mockRejectedValueOnce(
                new Error("Storage is not available"),
            );
            const showSpy = vi.spyOn(notifications, "show");
            await act(async () =>
                render(
                    <StatefulView
                        initialValues={[
                            [specificationsAtom, []],
                            [repositoryAtom, localRepository],
                        ]}
                        viewProps={{ onSuccess }}
                    />,
                ),
            );

            act(() => {
                fireEvent.change(
                    screen.getByTestId("specification-name-input"),
                    {
                        target: { value: "My Spec Test Name" },
                    },
                );
                fireEvent.change(screen.getByLabelText("ABI"), {
                    target: { value: "function balanceOf()" },
                });
            });

            act(() =>
                fireEvent.click(
                    screen
                        .getByText("Save")
                        .closest("button") as HTMLButtonElement,
                ),
            );

            await waitFor(() =>
                expect(showSpy).toHaveBeenCalledWith({
                    color: "red",
                    message: "Storage is not available",
                    title: "Oops!",
                    withBorder: true,
                    withCloseButton: true,
                }),
            );

            expect(onSuccess).not.toHaveBeenCalled();
        });

        it("should be able to update a specification and see a notification", async () => {
            const onSuccess = vi.fn();
            const showSpy = vi.spyOn(notifications, "show");

            await act(async () =>
                render(
                    <StatefulView
                        initialValues={[
                            [specificationsAtom, [erc1155JSONABISpecStub]],
                        ]}
                        viewProps={{
                            onSuccess,
                            specification: erc1155JSONABISpecStub,
                        }}
                    />,
                ),
            );

            act(() => {
                fireEvent.change(
                    screen.getByTestId("specification-name-input"),
                    {
                        target: { value: "New spec name" },
                    },
                );
            });

            act(() =>
                fireEvent.click(
                    screen
                        .getByText("Update")
                        .closest("button") as HTMLButtonElement,
                ),
            );

            await waitFor(() =>
                expect(showSpy).toHaveBeenCalledWith({
                    color: "green",
                    message: "Specification New spec name Updated!",
                    title: "Success!",
                    withBorder: true,
                    withCloseButton: true,
                }),
            );

            expect(onSuccess).toHaveBeenCalledWith({
                formMode: "EDITION",
                spec: expect.objectContaining({
                    name: "New spec name",
                    mode: "json_abi",
                }),
            });
        });

        it("should notify the user when updating a specification fails", async () => {
            const onSuccess = vi.fn();
            vi.spyOn(localRepository, "update").mockRejectedValueOnce(
                new Error("Storage is not available"),
            );
            const showSpy = vi.spyOn(notifications, "show");

            await act(async () =>
                render(
                    <StatefulView
                        initialValues={[
                            [specificationsAtom, [erc1155JSONABISpecStub]],
                            [repositoryAtom, localRepository],
                        ]}
                        viewProps={{
                            onSuccess,
                            specification: erc1155JSONABISpecStub,
                        }}
                    />,
                ),
            );

            act(() => {
                fireEvent.change(
                    screen.getByTestId("specification-name-input"),
                    {
                        target: { value: "New spec name" },
                    },
                );
            });

            fireEvent.click(
                screen
                    .getByText("Update")
                    .closest("button") as HTMLButtonElement,
            );

            await waitFor(() =>
                expect(showSpy).toHaveBeenCalledWith({
                    color: "red",
                    message: "Storage is not available",
                    title: "Oops!",
                    withBorder: true,
                    withCloseButton: true,
                }),
            );

            expect(onSuccess).not.toHaveBeenCalled();
        });
    });

    describe("ABI Parameters mode", () => {
        it("should display info message including external link to solidity v0.8.25 docs abi-spec section", async () => {
            await act(async () => render(<StatefulView />));

            act(() =>
                fireEvent.click(
                    screen.getByText("ABI Parameters")
                        .parentNode as HTMLLabelElement,
                ),
            );

            const modeInfoEl = screen.getByTestId("specification-mode-info");

            expect(
                getByText(
                    modeInfoEl,
                    "The set of ABI parameters to decode against data, in the shape of the inputs or outputs attribute of an ABI event/function. These parameters must include valid",
                ),
            ).toBeInTheDocument();

            const modeInfoLink = getByText(modeInfoEl, "ABI types").closest(
                "a",
            );
            expect(modeInfoLink?.getAttribute("href")).toEqual(
                "https://docs.soliditylang.org/en/v0.8.25/abi-spec.html#types",
            );
        });

        it("should be able to add and remove abi parameters", async () => {
            await act(async () => render(<StatefulView />));

            const abiParameter = "address from, uint amount";

            act(() => {
                fireEvent.click(
                    screen.getByText("ABI Parameters")
                        .parentNode as HTMLLabelElement,
                );

                fireEvent.change(screen.getByLabelText("ABI Parameter"), {
                    target: { value: abiParameter },
                });

                fireEvent.click(screen.getByTestId("abi-parameter-add-button"));
            });

            expect(screen.getByText(abiParameter)).toBeVisible();

            act(() =>
                fireEvent.click(
                    screen.getByText(`Remove abi parameter ${abiParameter}`),
                ),
            );

            expect(screen.queryByText(abiParameter)).not.toBeInTheDocument();
        });

        it("should be able to add and remove byte range definitions", async () => {
            await act(async () => render(<StatefulView />));

            act(() => {
                fireEvent.click(
                    screen.getByText("ABI Parameters")
                        .parentNode as HTMLLabelElement,
                );
                fireEvent.click(screen.getByTestId("add-byte-slice-switch"));

                fireEvent.change(screen.getByTestId("slice-name-input"), {
                    target: { value: "tokenAddress" },
                });

                fireEvent.change(screen.getByTestId("slice-from-input"), {
                    target: { value: "0" },
                });

                fireEvent.change(screen.getByTestId("slice-to-input"), {
                    target: { value: "20" },
                });

                fireEvent.click(screen.getByTestId("slice-add-button"));
            });

            fireEvent.click(screen.getByText("Review your definition"));

            await waitFor(() =>
                expect(screen.getByTestId("0-tokenAddress")).toBeVisible(),
            );

            fireEvent.click(screen.getByText("Remove slice-tokenAddress"));

            expect(
                screen.queryByText("Review your definition"),
            ).not.toBeInTheDocument();
        });

        it("should be able to add byte range and combine with abi parameter", async () => {
            const onSuccess = vi.fn();
            const showSpy = vi.spyOn(notifications, "show");
            await act(async () =>
                render(<StatefulView viewProps={{ onSuccess }} />),
            );

            act(() => {
                fireEvent.click(
                    screen.getByText("ABI Parameters")
                        .parentNode as HTMLLabelElement,
                );

                fireEvent.change(
                    screen.getByTestId("specification-name-input"),
                    {
                        target: { value: "My Spec" },
                    },
                );

                fireEvent.change(screen.getByLabelText("ABI Parameter"), {
                    target: {
                        value: "uint[] tokenIds, uint[] amounts, bytes baseLayer, bytes execLayer",
                    },
                });

                fireEvent.click(screen.getByTestId("abi-parameter-add-button"));

                fireEvent.click(screen.getByTestId("add-byte-slice-switch"));

                fireEvent.change(screen.getByTestId("slice-name-input"), {
                    target: { value: "tokenAddress" },
                });

                fireEvent.change(screen.getByTestId("slice-from-input"), {
                    target: { value: "0" },
                });

                fireEvent.change(screen.getByTestId("slice-to-input"), {
                    target: { value: "20" },
                });

                fireEvent.click(screen.getByTestId("slice-add-button"));
            });

            await fireEvent.click(
                screen.getByTestId("slice-apply-abi-on-checkbox"),
            );

            await fireEvent.click(screen.getByTestId("slice-select"));

            await fireEvent.click(
                screen.getByRole("option", { name: "tokenAddress" }),
            );

            fireEvent.click(
                screen.getByText("Save").closest("button") as HTMLButtonElement,
            );

            await waitFor(() =>
                expect(showSpy).toHaveBeenCalledWith({
                    color: "green",
                    message: "Specification My Spec Saved!",
                    title: "Success!",
                    withBorder: true,
                    withCloseButton: true,
                }),
            );

            expect(onSuccess).toHaveBeenCalledWith({
                formMode: "CREATION",
                spec: expect.objectContaining({
                    mode: "abi_params",
                    sliceInstructions: [
                        {
                            from: 0,
                            name: "tokenAddress",
                            to: 20,
                            type: "",
                            optional: false,
                        },
                    ],
                    sliceTarget: "tokenAddress",
                    abiParams: [
                        "uint[] tokenIds, uint[] amounts, bytes baseLayer, bytes execLayer",
                    ],
                }),
            });
        });

        it("should correctly set the default value for the optional byte-slice flag", async () => {
            await act(async () => render(<StatefulView />));

            act(() => {
                fireEvent.click(
                    screen.getByText("ABI Parameters")
                        .parentNode as HTMLLabelElement,
                );
                fireEvent.click(screen.getByTestId("add-byte-slice-switch"));

                fireEvent.change(screen.getByTestId("slice-name-input"), {
                    target: { value: "tokenAddress" },
                });

                fireEvent.change(screen.getByTestId("slice-from-input"), {
                    target: { value: "0" },
                });

                fireEvent.change(screen.getByTestId("slice-to-input"), {
                    target: { value: "20" },
                });

                fireEvent.click(screen.getByTestId("slice-add-button"));
            });

            fireEvent.click(screen.getByText("Review your definition"));

            await waitFor(() =>
                expect(screen.getByTestId("0-tokenAddress")).toBeVisible(),
            );

            const reviewTable = screen.getByTestId(
                "batch-review-table",
            ) as HTMLDivElement;

            expect(getByText(reviewTable, "Optional")).toBeInTheDocument();
            expect(getByText(reviewTable, "No")).toBeInTheDocument();

            fireEvent.click(screen.getByText("Remove slice-tokenAddress"));
        });

        it("should correctly configure the optional boolean flag for a byte slice", async () => {
            await act(async () => render(<StatefulView />));

            act(() => {
                fireEvent.click(
                    screen.getByText("ABI Parameters")
                        .parentNode as HTMLLabelElement,
                );
                fireEvent.click(screen.getByTestId("add-byte-slice-switch"));

                fireEvent.change(screen.getByTestId("slice-name-input"), {
                    target: { value: "tokenAddress" },
                });

                fireEvent.change(screen.getByTestId("slice-from-input"), {
                    target: { value: "0" },
                });

                fireEvent.change(screen.getByTestId("slice-to-input"), {
                    target: { value: "20" },
                });

                fireEvent.click(
                    screen.getByTestId("byte-slice-optional-switch"),
                );

                fireEvent.click(screen.getByTestId("slice-add-button"));
            });

            fireEvent.click(screen.getByText("Review your definition"));

            await waitFor(() =>
                expect(screen.getByTestId("0-tokenAddress")).toBeVisible(),
            );

            const reviewTable = screen.getByTestId(
                "batch-review-table",
            ) as HTMLDivElement;

            expect(getByText(reviewTable, "Optional")).toBeInTheDocument();
            expect(getByText(reviewTable, "Yes")).toBeInTheDocument();
        });
    });

    describe("validations", () => {
        it("should display error message when name is not filled", async () => {
            await act(async () => render(<StatefulView />));
            act(() =>
                fireEvent.click(
                    screen
                        .getByText("Save")
                        .closest("button") as HTMLButtonElement,
                ),
            );
            expect(screen.getByText("Name is required.")).toBeInTheDocument();
        });

        it("should display error message when conditions section is active but not filled", async () => {
            await act(async () => render(<StatefulView />));

            act(() => {
                fireEvent.click(screen.getByTestId("add-conditionals-switch"));
                fireEvent.click(
                    screen
                        .getByText("Save")
                        .closest("button") as HTMLButtonElement,
                );
            });

            expect(
                screen.getByText(
                    "Conditions is on, make sure the empty fields are filled!",
                ),
            ).toBeInTheDocument();
        });

        describe("For JSON ABI mode", () => {
            it("should display error message for ABI text field when not filled", async () => {
                await act(async () => render(<StatefulView />));
                act(() =>
                    fireEvent.click(
                        screen
                            .getByText("Save")
                            .closest("button") as HTMLButtonElement,
                    ),
                );

                expect(
                    screen.getByText("The ABI is required on JSON ABI mode."),
                ).toBeInTheDocument();
            });
        });

        describe("For ABI Parameters", () => {
            it("should display error message when ABI Parameter field is empty and byte range section is off", async () => {
                await act(async () => render(<StatefulView />));

                act(() => {
                    fireEvent.click(
                        screen.getByText("ABI Parameters")
                            .parentNode as HTMLLabelElement,
                    );
                    fireEvent.click(
                        screen
                            .getByText("Save")
                            .closest("button") as HTMLButtonElement,
                    );
                });

                expect(
                    screen.getByText(
                        "At least one ABI parameter is required when not defining the byte range slices.",
                    ),
                ).toBeInTheDocument();
            });

            it("should display error message when Byte range section is on but empty", async () => {
                await act(async () => render(<StatefulView />));

                act(() => {
                    fireEvent.click(
                        screen.getByText("ABI Parameters")
                            .parentNode as HTMLLabelElement,
                    );
                    fireEvent.click(
                        screen.getByTestId("add-byte-slice-switch"),
                    );
                    fireEvent.click(
                        screen
                            .getByText("Save")
                            .closest("button") as HTMLButtonElement,
                    );
                });

                expect(
                    screen.getByText(
                        "Byte range is on, so at least one slice is required!",
                    ),
                ).toBeInTheDocument();
            });

            describe("AbiTypes delegated checks", () => {
                it("should display error message when invalid abi type is used", async () => {
                    await act(async () => render(<StatefulView />));
                    act(() => {
                        fireEvent.click(
                            screen.getByText("ABI Parameters")
                                .parentNode as HTMLLabelElement,
                        );
                        fireEvent.change(
                            screen.getByLabelText("ABI Parameter"),
                            {
                                target: { value: "bla baz, uint amount" },
                            },
                        );
                        fireEvent.click(
                            screen.getByTestId("abi-parameter-add-button"),
                        );
                    });

                    expect(
                        screen.getByText(
                            `Unknown type. Type "bla" is not a valid ABI type. Version: abitype@1.0.7`,
                        ),
                    ).toBeInTheDocument();
                });

                it("should display error message when using reserved word as variable name", async () => {
                    await act(async () => render(<StatefulView />));
                    act(() => {
                        fireEvent.click(
                            screen.getByText("ABI Parameters")
                                .parentNode as HTMLLabelElement,
                        );
                        fireEvent.change(
                            screen.getByLabelText("ABI Parameter"),
                            {
                                target: { value: "uint address" },
                            },
                        );
                        fireEvent.click(
                            screen.getByTestId("abi-parameter-add-button"),
                        );
                    });

                    expect(
                        screen.getByText(
                            `Invalid ABI parameter. "address" is a protected Solidity keyword. More info: https://docs.soliditylang.org/en/latest/cheatsheet.html Details: uint address Version: abitype@1.0.7`,
                        ),
                    ).toBeInTheDocument();
                });
            });

            it("should display error message for name and from required field in the byte range section", async () => {
                await act(async () => render(<StatefulView />));

                act(() => {
                    fireEvent.click(
                        screen.getByText("ABI Parameters")
                            .parentNode as HTMLLabelElement,
                    );
                    fireEvent.click(
                        screen.getByTestId("add-byte-slice-switch"),
                    );

                    fireEvent.change(screen.getByTestId("slice-name-input"), {
                        target: { value: "1" },
                    });
                    fireEvent.change(screen.getByTestId("slice-name-input"), {
                        target: { value: "" },
                    });
                    fireEvent.change(screen.getByTestId("slice-from-input"), {
                        target: { value: "0" },
                    });
                    fireEvent.change(screen.getByTestId("slice-from-input"), {
                        target: { value: "" },
                    });
                });

                const sliceInstructionFieldsEl = screen.getByTestId(
                    "slice-instruction-fields",
                );

                expect(
                    getByText(sliceInstructionFieldsEl, "Name is required!"),
                ).toBeInTheDocument();
                expect(
                    getByText(sliceInstructionFieldsEl, "From is required!"),
                ).toBeInTheDocument();
            });

            it("should display error message when trying to add a slice that overlaps", async () => {
                await act(async () => render(<StatefulView />));

                act(() => {
                    fireEvent.click(
                        screen.getByText("ABI Parameters")
                            .parentNode as HTMLLabelElement,
                    );
                    fireEvent.click(
                        screen.getByTestId("add-byte-slice-switch"),
                    );

                    fireEvent.change(screen.getByTestId("slice-name-input"), {
                        target: { value: "tokenAddress" },
                    });
                    fireEvent.change(screen.getByTestId("slice-from-input"), {
                        target: { value: "0" },
                    });
                    fireEvent.change(screen.getByTestId("slice-to-input"), {
                        target: { value: "20" },
                    });
                    fireEvent.click(screen.getByTestId("slice-add-button"));

                    fireEvent.change(screen.getByTestId("slice-name-input"), {
                        target: { value: "data" },
                    });
                    fireEvent.change(screen.getByTestId("slice-from-input"), {
                        target: { value: "15" },
                    });
                });

                const sliceInstructionFieldsEl = screen.getByTestId(
                    "slice-instruction-fields",
                );

                expect(
                    getByText(
                        sliceInstructionFieldsEl,
                        "Overlap with added entry! Check review.",
                    ),
                ).toBeInTheDocument();
            });

            it("should display error message for duplicated slice name", async () => {
                await act(async () => render(<StatefulView />));

                act(() => {
                    fireEvent.click(
                        screen.getByText("ABI Parameters")
                            .parentNode as HTMLLabelElement,
                    );
                    fireEvent.click(
                        screen.getByTestId("add-byte-slice-switch"),
                    );

                    fireEvent.change(screen.getByTestId("slice-name-input"), {
                        target: { value: "tokenAddress" },
                    });
                    fireEvent.change(screen.getByTestId("slice-from-input"), {
                        target: { value: "0" },
                    });
                    fireEvent.change(screen.getByTestId("slice-to-input"), {
                        target: { value: "20" },
                    });
                    fireEvent.click(screen.getByTestId("slice-add-button"));
                });

                fireEvent.change(screen.getByTestId("slice-name-input"), {
                    target: { value: "tokenAddress" },
                });

                const sliceInstructionFieldsEl = screen.getByTestId(
                    "slice-instruction-fields",
                );

                expect(
                    getByText(
                        sliceInstructionFieldsEl,
                        "Duplicated name. Check review",
                    ),
                ).toBeInTheDocument();
            });

            it("should display required error message for ABI parameter when selecting a slice", async () => {
                await act(async () => render(<StatefulView />));

                act(() => {
                    fireEvent.click(
                        screen.getByText("ABI Parameters")
                            .parentNode as HTMLLabelElement,
                    );

                    fireEvent.click(
                        screen.getByTestId("add-byte-slice-switch"),
                    );

                    fireEvent.change(screen.getByTestId("slice-name-input"), {
                        target: { value: "tokenAddress" },
                    });

                    fireEvent.change(screen.getByTestId("slice-from-input"), {
                        target: { value: "0" },
                    });

                    fireEvent.change(screen.getByTestId("slice-to-input"), {
                        target: { value: "20" },
                    });

                    fireEvent.click(screen.getByTestId("slice-add-button"));
                });

                await fireEvent.click(
                    screen.getByTestId("slice-apply-abi-on-checkbox"),
                );

                await fireEvent.click(screen.getByTestId("slice-select"));

                await fireEvent.click(
                    screen.getByRole("option", { name: "tokenAddress" }),
                );

                await fireEvent.click(
                    screen
                        .getByText("Save")
                        .closest("button") as HTMLButtonElement,
                );

                expect(
                    screen.getByText(
                        "A slice name tokenAddress was selected, making ABI parameter required!",
                    ),
                ).toBeVisible();
            });
        });
    });

    describe("Decoding preview", () => {
        it("should display wagmi encoded data sample in a readable format", async () => {
            await act(async () => render(<StatefulView />));

            const abiParameter = "string name, uint amount, bool success";

            act(() => {
                fireEvent.click(
                    screen.getByText("ABI Parameters")
                        .parentNode as HTMLLabelElement,
                );
                fireEvent.change(screen.getByLabelText("Data"), {
                    target: { value: encodedDataSamples.wagmiSample },
                });
                fireEvent.change(screen.getByLabelText("ABI Parameter"), {
                    target: { value: abiParameter },
                });

                fireEvent.click(screen.getByTestId("abi-parameter-add-button"));
            });

            await waitFor(() =>
                expect(
                    screen.getByTestId("preview-decoded-data"),
                ).toBeVisible(),
            );

            const decodedContent = JSON.parse(
                screen.getByTestId("preview-decoded-data").textContent ?? "{}",
            );

            expect(decodedContent).toStrictEqual({
                name: "wagmi",
                amount: "420",
                success: true,
            });
        });
    });

    describe("Layout", () => {
        it("should hide view switch on small devices", async () => {
            useMediaQueryMock.mockReturnValue(true);
            await act(async () => render(<StatefulView />));

            expect(() =>
                screen.getByTestId("specification-creation-view-switch"),
            ).toThrow("Unable to find an element");
        });

        it("should show view switch on large devices", async () => {
            useMediaQueryMock.mockReturnValue(false);
            await act(async () => render(<StatefulView />));

            expect(
                screen.getByTestId("specification-creation-view-switch"),
            ).toBeInTheDocument();
        });
    });
});
