import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteConnectionModal } from "../../../src/components/connection/deleteConnectionModal";
import withMantineTheme from "../../utils/WithMantineTheme";

const Component = withMantineTheme(DeleteConnectionModal);

const defaultProps = {
    isOpened: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
};

describe("DeleteConnectionModal component", () => {
    it("should display correct texts", () => {
        render(<Component {...defaultProps} />);

        expect(screen.getByText("Delete connection?")).toBeInTheDocument();
        expect(
            screen.getByText(
                "This will delete the data for this connection. Are you sure you want to proceed?",
            ),
        ).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByText("Confirm")).toBeInTheDocument();
    });

    it("should invoke 'onClose' callback when Cancel button is clicked", () => {
        const onCloseSpy = vi.fn();
        render(<Component {...defaultProps} onClose={onCloseSpy} />);
        fireEvent.click(screen.getByText("Cancel"));

        expect(onCloseSpy).toHaveBeenCalledOnce();
    });

    it("should invoke 'onConfirm' callback when Confirm button is clicked", () => {
        const onConfirmSpy = vi.fn();
        render(<Component {...defaultProps} onConfirm={onConfirmSpy} />);
        fireEvent.click(screen.getByText("Confirm"));

        expect(onConfirmSpy).toHaveBeenCalledOnce();
    });
});
