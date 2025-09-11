import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { withMantineTheme } from "./utils/WithMantineTheme";
import ApplicationAutocomplete from "../src/ApplicationAutocomplete";
import { RollupVersion } from "@cartesi/rollups-explorer-domain/dist/graphql/explorer/types";
import { Loader } from "@mantine/core";

const Component = withMantineTheme(ApplicationAutocomplete);

const defaultProps = {
    applications: [
        {
            address: "0x60a7048c3136293071605a4eaffef49923e981cc",
            id: "11155111-0x60a7048c3136293071605a4eaffef49923e981cc-v1",
            rollupVersion: "v1" as RollupVersion,
        },
        {
            address: "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c",
            id: "11155111-0x70ac08179605af2d9e75782b8decdd3c22aa4d0c-v1",
            rollupVersion: "v1" as RollupVersion,
        },
        {
            address: "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3",
            id: "11155111-0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3-v1",
            rollupVersion: "v1" as RollupVersion,
        },
    ],
    onApplicationSelected: vi.fn(),
};

describe("ApplicationAutocomplete", () => {
    it("should display a clear button when the right section is undefined", async () => {
        const { container } = render(<Component {...defaultProps} />);

        const applicationInput = container.querySelector(
            "input",
        ) as HTMLInputElement;

        const applicationSearch = "0x60a7048c3136293071605a4eaffef49923e981cc";

        fireEvent.change(applicationInput, {
            target: {
                value: applicationSearch,
            },
        });

        await waitFor(() =>
            expect(
                screen.getByTestId("clear-application-button"),
            ).toBeInTheDocument(),
        );
    });

    it("should not display a clear button when the right section is defined", async () => {
        const { container } = render(
            <Component {...defaultProps} rightSection={<Loader size="xs" />} />,
        );

        const applicationInput = container.querySelector(
            "input",
        ) as HTMLInputElement;

        const applicationSearch = "0x60a7048c3136293071605a4eaffef49923e981cc";

        fireEvent.change(applicationInput, {
            target: {
                value: applicationSearch,
            },
        });

        await waitFor(() =>
            expect(() =>
                screen.getByTestId("clear-application-button"),
            ).toThrow("Unable to find an element"),
        );
    });
});
