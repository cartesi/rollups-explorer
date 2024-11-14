import {
    fireEvent,
    getByText,
    render,
    screen,
    waitForElementToBeRemoved,
} from "@testing-library/react";
import { clone } from "ramda";
import { FC } from "react";
import { describe, it } from "vitest";
import { SpecificationListView } from "../../../src/components/specification/SpecificationListView";
import { specificationsAtom } from "../../../src/components/specification/hooks/useSpecification";
import { systemSpecificationAsList } from "../../../src/components/specification/systemSpecs";
import { Specification } from "../../../src/components/specification/types";
import withMantineTheme from "../../utils/WithMantineTheme";
import { JotaiTestProvider } from "./jotaiHelpers";
import { erc1155JSONABISpecStub } from "./specification.stubs";

const View = withMantineTheme(SpecificationListView);

const StatefulView: FC<{ specs?: Specification[] }> = ({ specs }) => (
    <JotaiTestProvider initialValues={[[specificationsAtom, specs]]}>
        <View />
    </JotaiTestProvider>
);

describe("Specification Listing View", () => {
    it("should display feedback when fetching the specifications", async () => {
        render(<StatefulView />);
        expect(screen.getByTestId("fetching-feedback")).toBeInTheDocument();
        await waitForElementToBeRemoved(
            screen.getByTestId("fetching-feedback"),
        );
    });

    it("should display message and call-to-action link when no specifications are available", async () => {
        render(<StatefulView specs={[]} />);
        await screen.findByText("No Specifications Found!");

        const link = screen.getByRole("link");
        expect(
            screen.getByText("No Specifications Found!"),
        ).toBeInTheDocument();
        expect(screen.getByText("Create one")).toBeInTheDocument();
        expect(link.getAttribute("href")).toEqual("/specifications/new");
        expect(screen.getByText("Import specifications")).toBeInTheDocument();
    });

    it("should be able to delete a specification", async () => {
        render(
            <StatefulView
                specs={[erc1155JSONABISpecStub, systemSpecificationAsList[0]]}
            />,
        );

        await waitForElementToBeRemoved(
            screen.getByTestId("fetching-feedback"),
        );

        expect(
            screen.getByText(erc1155JSONABISpecStub.name),
        ).toBeInTheDocument();

        expect(
            screen.getByText(systemSpecificationAsList[0].name),
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByTestId(
                `remove-specification-${erc1155JSONABISpecStub.id}`,
            ),
        );

        await waitForElementToBeRemoved(
            screen.getByText(erc1155JSONABISpecStub.name),
        );

        expect(
            screen.queryByText(erc1155JSONABISpecStub.name),
        ).not.toBeInTheDocument();

        expect(
            screen.getByText(systemSpecificationAsList[0].name),
        ).toBeInTheDocument();
    });

    it("should display edit and remove actions", async () => {
        render(<StatefulView specs={[erc1155JSONABISpecStub]} />);
        await waitForElementToBeRemoved(
            screen.getByTestId("fetching-feedback"),
        );

        const removeBtn = screen
            .getByText(`Remove specification id ${erc1155JSONABISpecStub.id}`)
            .closest("button");

        expect(removeBtn).toBeInTheDocument();

        const editLink = screen
            .getByText(`Edit Specification id ${erc1155JSONABISpecStub.id}`)
            .closest("a");
        expect(editLink).toBeInTheDocument();
        expect(editLink?.getAttribute("href")).toEqual(
            "/specifications/edit/1",
        );
    });

    describe("Filtering", () => {
        it("should display all available specifications", async () => {
            render(
                <StatefulView
                    specs={[
                        systemSpecificationAsList[0],
                        erc1155JSONABISpecStub,
                    ]}
                />,
            );

            await waitForElementToBeRemoved(
                screen.getByTestId("fetching-feedback"),
            );

            expect(screen.getByText("All")).toBeInTheDocument();
            expect(screen.getByText("JSON ABI")).toBeInTheDocument();
            expect(screen.getByText("ABI Params")).toBeInTheDocument();
            expect(
                screen.getByText("ERC-1155 Single Portal @cartesi/rollups@1.x"),
            ).toBeInTheDocument();
        });

        describe("JSON ABI", () => {
            it("should display only available JSON ABI Specs", async () => {
                render(
                    <StatefulView
                        specs={[
                            systemSpecificationAsList[0],
                            erc1155JSONABISpecStub,
                        ]}
                    />,
                );

                await waitForElementToBeRemoved(
                    screen.getByTestId("fetching-feedback"),
                );

                expect(
                    screen.getByText(
                        "ERC-1155 Single Portal @cartesi/rollups@1.x",
                    ),
                ).toBeInTheDocument();

                expect(
                    screen.getByText("ERC-1155 Specification"),
                ).toBeInTheDocument();

                fireEvent.click(
                    screen.getByText("JSON ABI").parentNode as HTMLLabelElement,
                );

                expect(
                    screen.queryByText(
                        "ERC-1155 Single Portal @cartesi/rollups@1.x",
                    ),
                ).not.toBeInTheDocument();

                expect(
                    screen.getByText("ERC-1155 Specification"),
                ).toBeInTheDocument();
            });

            it("should display message when one spec is available but filtering returns empty", async () => {
                render(<StatefulView specs={[systemSpecificationAsList[0]]} />);

                await waitForElementToBeRemoved(
                    screen.getByTestId("fetching-feedback"),
                );

                fireEvent.click(
                    screen.getByText("JSON ABI").parentNode as HTMLLabelElement,
                );

                const elem = screen.getByTestId(
                    "no-specification-filtered-message",
                );

                expect(
                    getByText(
                        elem,
                        "You have one specification but it is not the type",
                    ),
                ).toBeInTheDocument();
                expect(getByText(elem, "JSON ABI")).toBeInTheDocument();
            });

            it("should display message when multiple specs are available but filtering returns empty", async () => {
                render(<StatefulView specs={systemSpecificationAsList} />);

                await waitForElementToBeRemoved(
                    screen.getByTestId("fetching-feedback"),
                );

                fireEvent.click(
                    screen.getByText("JSON ABI").parentNode as HTMLLabelElement,
                );

                const elem = screen.getByTestId(
                    "no-specification-filtered-message",
                );

                expect(
                    getByText(
                        elem,
                        "You have 11 specifications, but none of them are the type",
                    ),
                ).toBeInTheDocument();
                expect(getByText(elem, "JSON ABI")).toBeInTheDocument();
            });
        });

        describe("ABI PARAMS", () => {
            it("should display only available ABI Params specifications", async () => {
                render(
                    <StatefulView
                        specs={[
                            systemSpecificationAsList[0],
                            erc1155JSONABISpecStub,
                        ]}
                    />,
                );

                await waitForElementToBeRemoved(
                    screen.getByTestId("fetching-feedback"),
                );

                expect(
                    screen.getByText(
                        "ERC-1155 Single Portal @cartesi/rollups@1.x",
                    ),
                ).toBeInTheDocument();

                expect(
                    screen.getByText("ERC-1155 Specification"),
                ).toBeInTheDocument();

                fireEvent.click(
                    screen.getByText("ABI Params")
                        .parentNode as HTMLLabelElement,
                );

                expect(
                    screen.getByText(
                        "ERC-1155 Single Portal @cartesi/rollups@1.x",
                    ),
                ).toBeInTheDocument();

                expect(
                    screen.queryByText("ERC-1155 Specification"),
                ).not.toBeInTheDocument();
            });
            it("should display message when one spec is available filtering result is empty", async () => {
                render(<StatefulView specs={[erc1155JSONABISpecStub]} />);

                await waitForElementToBeRemoved(
                    screen.getByTestId("fetching-feedback"),
                );

                fireEvent.click(
                    screen.getByText("ABI Params")
                        .parentNode as HTMLLabelElement,
                );

                const elem = screen.getByTestId(
                    "no-specification-filtered-message",
                );

                expect(
                    getByText(
                        elem,
                        "You have one specification but it is not the type",
                    ),
                ).toBeInTheDocument();
                expect(getByText(elem, "ABI Params")).toBeInTheDocument();
            });

            it("should display message when multiple specs are available but filtering result is empty", async () => {
                const cloned = clone(erc1155JSONABISpecStub);
                cloned.id = "2";

                render(
                    <StatefulView specs={[erc1155JSONABISpecStub, cloned]} />,
                );

                await waitForElementToBeRemoved(
                    screen.getByTestId("fetching-feedback"),
                );

                fireEvent.click(
                    screen.getByText("ABI Params")
                        .parentNode as HTMLLabelElement,
                );

                const elem = screen.getByTestId(
                    "no-specification-filtered-message",
                );

                expect(
                    getByText(
                        elem,
                        "You have 2 specifications, but none of them are the type",
                    ),
                ).toBeInTheDocument();
                expect(getByText(elem, "ABI Params")).toBeInTheDocument();
            });
        });
    });

    describe("JSON ABI type information", () => {
        it("should display the ABI section and conditions", async () => {
            render(<StatefulView specs={[erc1155JSONABISpecStub]} />);

            await waitForElementToBeRemoved(
                screen.getByTestId("fetching-feedback"),
            );

            expect(
                screen.getByText("ERC-1155 Specification"),
            ).toBeInTheDocument();

            expect(screen.getByText("ABI")).toBeInTheDocument();
            expect(screen.getByText("Conditions")).toBeInTheDocument();
        });
    });
});
