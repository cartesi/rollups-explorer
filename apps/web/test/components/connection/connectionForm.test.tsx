import { notifications } from "@mantine/notifications";
import {
    cleanup,
    findByTestId,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { useQuery } from "urql";
import { afterEach, beforeEach, describe, it } from "vitest";
import AppConnectionForm from "../../../src/components/connection/connectionForm";
import { useConnectionConfig } from "../../../src/providers/connectionConfig/hooks";
import withMantineTheme from "../../utils/WithMantineTheme";
import { checkStatusSample } from "../../utils/dataSamples";
import { queryMockImplBuilder } from "../../utils/useQueryMock";
import { useApplicationsQuery } from "@cartesi/rollups-explorer-domain/explorer-hooks";
import { RollupVersion } from "@cartesi/rollups-explorer-domain/explorer-types";

vi.mock("urql");
vi.mock("@cartesi/rollups-explorer-domain/rollups-operations");
vi.mock("@cartesi/rollups-explorer-domain/explorer-hooks");

vi.mock("../../../src/providers/connectionConfig/hooks");
vi.mock("@mantine/notifications");

const AppConnectionFormE = withMantineTheme(AppConnectionForm);
const useQueryMock = vi.mocked(useQuery, true);
const useConnectionConfigMock = vi.mocked(useConnectionConfig, true);
const notificationsMock = vi.mocked(notifications, true);
const useApplicationsQueryMock = vi.mocked(useApplicationsQuery, true);

describe("connectionForm", () => {
    beforeEach(() => {
        useQueryMock.mockImplementation(queryMockImplBuilder());

        useConnectionConfigMock.mockReturnValue({
            hasConnection: vi.fn(),
            addConnection: vi.fn(),
            removeConnection: vi.fn(),
            getConnection: vi.fn(),
            hideConnectionModal: vi.fn(),
            showConnectionModal: vi.fn(),
            listConnections: vi.fn(),
        } as any);

        useApplicationsQueryMock.mockReturnValue([
            {
                data: {
                    applications: [
                        {
                            address:
                                "0x60a7048c3136293071605a4eaffef49923e981cc",
                            id: "11155111-0x60a7048c3136293071605a4eaffef49923e981cc-v1",
                            rollupVersion: "v1" as RollupVersion,
                        },
                        {
                            address:
                                "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c",
                            id: "11155111-0x70ac08179605af2d9e75782b8decdd3c22aa4d0c-v1",
                            rollupVersion: "v1" as RollupVersion,
                        },
                        {
                            address:
                                "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3",
                            id: "11155111-0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3-v1",
                            rollupVersion: "v1" as RollupVersion,
                        },
                    ],
                },
                fetching: false,
            },
        ] as any);
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should present form on its initial state", async () => {
        render(<AppConnectionFormE />);

        expect(screen.getByText("Address")).toBeInTheDocument();
        expect(
            screen.getByText("The application smart contract address."),
        ).toBeInTheDocument();
        expect(screen.getByText("URL")).toBeInTheDocument();
        expect(
            screen.getByText("The rollups graphQL endpoint"),
        ).toBeInTheDocument();

        expect(screen.getByTestId("icon-test-inactive")).toBeInTheDocument();
        expect(screen.getByTestId("connection-save")).toBeInTheDocument();
    });

    it("should present a list of applications suggestions when click on address input", () => {
        render(<AppConnectionFormE />);
        const input = screen.getByPlaceholderText("0x");

        fireEvent.click(input!);

        expect(
            screen.getByText("0x60a7048c3136293071605a4eaffef49923e981cc"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("0x70ac08179605af2d9e75782b8decdd3c22aa4d0c"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3"),
        ).toBeInTheDocument();
    });

    it("should display error message when address is not a proper address format", () => {
        render(<AppConnectionFormE />);
        const input = screen.getByPlaceholderText("0x");

        fireEvent.change(input, { target: { value: "mellow" } });

        expect(
            screen.getByText("It is not a valid address format."),
        ).toBeInTheDocument();
    });

    it("should display error message when filled address already has a connection", () => {
        const hasConnection = vi.fn().mockReturnValue(true);
        useConnectionConfigMock.mockReturnValue({
            ...useConnectionConfigMock(),
            hasConnection,
        });

        render(<AppConnectionFormE />);
        const input = screen.getByPlaceholderText("0x");

        fireEvent.change(input, {
            target: { value: "0x60a7048c3136293071605a4eaffef49923e981cc" },
        });

        expect(
            screen.getByText("There is a connection for that address"),
        ).toBeInTheDocument();
    });

    it("should display warning message when filled address is an undeployed application", () => {
        useQueryMock.mockImplementation(
            queryMockImplBuilder({ apps: { data: [] } }),
        );
        useApplicationsQueryMock.mockReturnValue([
            {
                data: {
                    applications: [],
                },
                fetching: false,
            },
        ] as any);
        const address = "0x60a7048c3136293071605a4eaffef49923e981cd";

        render(<AppConnectionFormE application={address} />);

        expect(
            screen.getByText(
                "This is the address of an undeployed application.",
            ),
        ).toBeInTheDocument();
    });

    it("should display a loader inside the URL input when fetching information from a valid URL", async () => {
        const url = "http://localhost:8000/graphql";
        useQueryMock.mockImplementation(
            queryMockImplBuilder({
                checkStatus: {
                    url,
                    fetching: true,
                    data: undefined,
                },
            }),
        );

        render(<AppConnectionFormE />);

        const urlInput = screen.getByPlaceholderText(
            "https://app-hostname/graphql",
        );

        fireEvent.change(urlInput, {
            target: { value: url },
        });

        const inputURLWrapper = urlInput.closest("div");

        expect(
            await findByTestId(inputURLWrapper!, "icon-test-loading"),
        ).toBeInTheDocument();
    });

    it("should display successful response from test connection", async () => {
        const url = "http://localhost:8000/graphql";
        useQueryMock.mockImplementation(
            queryMockImplBuilder({
                checkStatus: {
                    data: checkStatusSample,
                    url,
                },
            }),
        );

        render(<AppConnectionFormE />);

        const urlInput = screen.getByPlaceholderText(
            "https://app-hostname/graphql",
        );

        fireEvent.change(urlInput, {
            target: { value: url },
        });

        await waitFor(() =>
            expect(screen.getByTestId("icon-test-success")).toBeInTheDocument(),
        );

        expect(
            screen.getByText("This application responded with"),
        ).toBeInTheDocument();
        expect(screen.getByText("775 Inputs")).toBeInTheDocument();
        expect(screen.getByText("0 Notices")).toBeInTheDocument();
        expect(screen.getByText("1 Vouchers")).toBeInTheDocument();
        expect(screen.getByText("775 Reports")).toBeInTheDocument();
    });

    it("should display failed response when test-connection fails", async () => {
        const url = "http://unavailablehost/graphql";
        useQueryMock.mockImplementation(
            queryMockImplBuilder({
                checkStatus: {
                    error: {
                        graphQLErrors: [],
                        message: "[NETWORK] 503 service unavailable",
                        name: "",
                    },
                    url,
                },
            }),
        );

        const { container } = render(<AppConnectionFormE />);

        const urlInput = screen.getByPlaceholderText(
            "https://app-hostname/graphql",
        );

        fireEvent.change(urlInput, {
            target: { value: url },
        });

        await waitFor(() =>
            expect(screen.getByTestId("icon-test-failed")).toBeInTheDocument(),
        );

        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
        expect(
            screen.getByText("[NETWORK] 503 service unavailable"),
        ).toBeInTheDocument();
    });

    it("should not be able to save when required field are not filled", () => {
        const addConnection = vi.mocked(
            useConnectionConfigMock().addConnection,
            true,
        );

        render(<AppConnectionFormE />);

        fireEvent.click(screen.getByTestId("connection-save"));

        expect(
            screen.getByText("Address is a required field!"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("URL is a required field!"),
        ).toBeInTheDocument();

        expect(addConnection).not.toHaveBeenCalled();
    });

    it("should be able to call save when required fields are filled", async () => {
        const url = "http://localhost:8000/graphql";
        useQueryMock.mockImplementation(
            queryMockImplBuilder({
                checkStatus: {
                    data: checkStatusSample,
                    url,
                },
            }),
        );
        const addConnection = vi.mocked(
            useConnectionConfigMock().addConnection,
            true,
        );

        const address = "0x60a7048c3136293071605a4eaffef49923e981cd";

        render(<AppConnectionFormE application={address} />);

        const urlInput = screen.getByPlaceholderText(
            "https://app-hostname/graphql",
        );

        fireEvent.change(urlInput, {
            target: { value: url },
        });

        await waitFor(() =>
            expect(screen.getByTestId("icon-test-success")).toBeInTheDocument(),
        );

        expect(
            screen.getByText("This application responded with"),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("connection-save"));

        expect(addConnection).toHaveBeenCalledWith(
            { address, url },
            {
                onFailure: expect.any(Function),
                onSuccess: expect.any(Function),
                onFinished: expect.any(Function),
            },
        );
    });

    it("should be able to call save when required fields are filled", async () => {
        const url = "http://localhost:8000/graphql";
        useQueryMock.mockImplementation(
            queryMockImplBuilder({
                checkStatus: {
                    data: checkStatusSample,
                    url,
                },
            }),
        );
        const addConnection = vi.mocked(
            useConnectionConfigMock().addConnection,
            true,
        );

        const address = "0x60a7048c3136293071605a4eaffef49923e981cd";

        render(<AppConnectionFormE application={address} />);

        const urlInput = screen.getByPlaceholderText(
            "https://app-hostname/graphql",
        );

        fireEvent.change(urlInput, {
            target: { value: url },
        });

        await waitFor(() =>
            expect(screen.getByTestId("icon-test-success")).toBeInTheDocument(),
        );

        expect(
            screen.getByText("This application responded with"),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("connection-save"));

        expect(addConnection).toHaveBeenCalledWith(
            { address, url },
            {
                onFailure: expect.any(Function),
                onSuccess: expect.any(Function),
                onFinished: expect.any(Function),
            },
        );
    });

    it("should not be able to call save when url is invalid", async () => {
        const url = "invalid-url";
        useQueryMock.mockImplementation(
            queryMockImplBuilder({
                checkStatus: {
                    data: checkStatusSample,
                    url,
                },
            }),
        );
        const addConnection = vi.mocked(
            useConnectionConfigMock().addConnection,
            true,
        );

        const address = "0x60a7048c3136293071605a4eaffef49923e981cd";

        render(<AppConnectionFormE application={address} />);

        const urlInput = screen.getByPlaceholderText(
            "https://app-hostname/graphql",
        );

        fireEvent.change(urlInput, {
            target: { value: url },
        });

        await waitFor(() =>
            expect(screen.getByRole("alert")).toBeInTheDocument(),
        );

        expect(
            screen.getByText("This application responded with"),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("connection-save"));

        expect(addConnection).toHaveBeenCalledTimes(0);
    });

    it("should notify and not allow to save when test-connection failed", () => {
        const url = "http://unavailablehost/graphql";
        useQueryMock.mockImplementation(
            queryMockImplBuilder({
                checkStatus: {
                    error: {
                        graphQLErrors: [],
                        message: "[NETWORK] 503 service unavailable",
                        name: "",
                    },
                    url,
                },
            }),
        );
        const addConnection = vi.mocked(
            useConnectionConfigMock().addConnection,
            true,
        );

        const address = "0x60a7048c3136293071605a4eaffef49923e981cd";

        render(<AppConnectionFormE application={address} />);

        const urlInput = screen.getByPlaceholderText(
            "https://app-hostname/graphql",
        );

        fireEvent.change(urlInput, {
            target: { value: url },
        });

        fireEvent.click(screen.getByTestId("connection-save"));

        expect(addConnection).not.toHaveBeenCalled();
        expect(notificationsMock.show).toHaveBeenCalledWith({
            color: "orange",
            message: "To save a connection the endpoint needs to be working",
            withBorder: true,
        });
    });
});
