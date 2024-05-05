import { afterAll, beforeEach, describe, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useAccount } from "wagmi";
import { Applications } from "../../../src/components/applications/applications";
import { withMantineTheme } from "../../utils/WithMantineTheme";
import {
    useApplicationsConnectionOwnerQuery,
    useApplicationsConnectionQuery,
} from "../../../src/graphql/explorer/hooks/queries";
import { ReactNode } from "react";

vi.mock("wagmi");
vi.mock("../../../src/graphql/explorer/hooks/queries");
vi.mock("../../../src/components/paginated", async () => ({
    default: (props: { children: ReactNode; ["data-testid"]: string }) => (
        <div data-testid={props["data-testid"]}>{props.children}</div>
    ),
}));

const useAccountMock = vi.mocked(useAccount, true);
const useAccountData = {
    address: "0x8FD78976f8955D13bAA4fC99043208F4EC020D7E",
    isConnected: true,
};
const useApplicationsConnectionOwnerQueryMock = vi.mocked(
    useApplicationsConnectionOwnerQuery,
    true,
);
const useApplicationsConnectionQueryMock = vi.mocked(
    useApplicationsConnectionQuery,
    true,
);

const Component = withMantineTheme(Applications);

describe("Applications component", () => {
    beforeEach(() => {
        useAccountMock.mockReturnValue(useAccountData as any);
        useApplicationsConnectionOwnerQueryMock.mockReturnValue([
            {
                data: {
                    applicationsConnection: {
                        edges: [],
                    },
                },
                fetching: false,
            },
        ] as any);
        useApplicationsConnectionQueryMock.mockReturnValue([
            {
                data: {
                    applicationsConnection: {
                        edges: [],
                    },
                },
                fetching: false,
            },
        ] as any);
    });

    afterAll(() => {
        vi.resetAllMocks();
        cleanup();
    });

    it("should display tabs when wallet is connected", () => {
        render(<Component />);
        expect(screen.getByText("All Apps")).toBeInTheDocument();
        expect(screen.getByText("My Apps")).toBeInTheDocument();
    });

    it("should display all applications tab by default", () => {
        render(<Component />);
        expect(screen.getByTestId("all-applications")).toBeInTheDocument();
    });

    it("should not display tabs when wallet is not connected", () => {
        useAccountMock.mockReturnValue({
            ...useAccountData,
            isConnected: false,
        } as any);
        render(<Component />);
        expect(() => screen.getByText("All apps")).toThrow(
            "Unable to find an element",
        );
        expect(() => screen.getByText("My apps")).toThrow(
            "Unable to find an element",
        );
    });

    it("should display correct content when tab is selected", () => {
        render(<Component />);
        const myAppsButton = screen.getByText("My Apps")
            .parentNode as HTMLButtonElement;

        fireEvent.click(myAppsButton);
        expect(screen.getByTestId("user-applications")).toBeInTheDocument();

        const AllAppsButton = screen.getByText("All Apps")
            .parentNode as HTMLButtonElement;

        fireEvent.click(AllAppsButton);
        expect(screen.getByTestId("all-applications")).toBeInTheDocument();
    });
});
