import { afterEach, describe, it } from "vitest";
import {
    cleanup,
    fireEvent,
    render,
    renderHook,
    screen,
    waitFor,
} from "@testing-library/react";
import { SpecificationsTransfer } from "../../../../src/components/specification/components/SpecificationsTransfer";
import { withMantineTheme } from "../../../utils/WithMantineTheme";
import useSpecificationsTransfer from "../../../../src/components/specification/hooks/useSpecificationsTransfer";
import { specificationsAtom } from "../../../../src/components/specification/hooks/useSpecification";
import { defaultSpecificationExport } from "../stubs";
import { JotaiTestProvider } from "../jotaiHelpers";

const initialValues = [
    [specificationsAtom, defaultSpecificationExport.specifications],
];

const Component = withMantineTheme(() => (
    <JotaiTestProvider initialValues={initialValues}>
        <SpecificationsTransfer />
    </JotaiTestProvider>
));

describe("SpecificationsTransfer", () => {
    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should display link with correct attributes for downloading the specifications export", () => {
        renderHook(() => useSpecificationsTransfer(), {
            wrapper: ({ children }) => (
                <div>
                    <Component />
                    {children}
                </div>
            ),
        });

        const specificationsExportLink = screen.getByTestId(
            "specification-export-link",
        );

        expect(
            specificationsExportLink
                .getAttribute("href")
                ?.includes("data:text/json;charset=utf-8,"),
        ).toBe(true);

        expect(specificationsExportLink.getAttribute("download")).toBe(
            "cartesiscan_specifications_export.json",
        );
    });

    it("should display correct tooltips", async () => {
        render(<Component />);
        const specificationsExportLink = screen.getByTestId(
            "specification-export-link",
        );

        fireEvent.mouseEnter(specificationsExportLink);
        await waitFor(() =>
            expect(
                screen.getByText("Export specifications"),
            ).toBeInTheDocument(),
        );

        const uploadButton = screen.getByTestId("import-specification-button");

        fireEvent.mouseEnter(uploadButton.parentNode as HTMLDivElement);
        await waitFor(() =>
            expect(
                screen.getByText("Import specifications"),
            ).toBeInTheDocument(),
        );
    });

    it("should display file upload button", async () => {
        render(<Component />);

        const uploadButton = screen.getByTestId("import-specification-button");
        expect(uploadButton).toBeInTheDocument();
    });
});
