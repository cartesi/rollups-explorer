import { afterEach, describe, it } from "vitest";
import {
    cleanup,
    fireEvent,
    render,
    renderHook,
    screen,
    waitFor,
} from "@testing-library/react";
import { SpecificationsActionsMenu } from "../../../../src/components/specification/components/SpecificationsActionsMenu";
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
        <SpecificationsActionsMenu />
    </JotaiTestProvider>
));

describe("SpecificationsActionsMenu component", () => {
    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should display correct menu tooltip", async () => {
        render(<Component />);

        const menuTarget = screen.getByTestId("specifications-actions-menu");
        fireEvent.mouseEnter(menuTarget);

        await waitFor(() =>
            expect(screen.getByText("Actions")).toBeInTheDocument(),
        );
    });

    it("should display correct menu items", async () => {
        render(<Component />);

        const menuTarget = screen.getByTestId(
            "specifications-actions-menu-target",
        );
        fireEvent.click(menuTarget);

        await waitFor(() =>
            expect(
                screen.getByText("Download specifications"),
            ).toBeInTheDocument(),
        );
        await waitFor(() =>
            expect(
                screen.getByText("Upload specifications"),
            ).toBeInTheDocument(),
        );
    });

    it("should display link with correct attributes for downloading the specifications export", async () => {
        renderHook(() => useSpecificationsTransfer(), {
            wrapper: ({ children }) => (
                <div>
                    <Component />
                    {children}
                </div>
            ),
        });

        const menuTarget = screen.getByTestId(
            "specifications-actions-menu-target",
        );
        fireEvent.click(menuTarget);

        await waitFor(() =>
            expect(
                screen.getByText("Download specifications"),
            ).toBeInTheDocument(),
        );

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

    it("should display file upload button", async () => {
        render(<Component />);

        const menuTarget = screen.getByTestId(
            "specifications-actions-menu-target",
        );
        fireEvent.click(menuTarget);

        await waitFor(() =>
            expect(
                screen.getByText("Upload specifications"),
            ).toBeInTheDocument(),
        );

        const uploadButton = screen.getByTestId("import-specification-button");
        expect(uploadButton).toBeInTheDocument();
    });
});
