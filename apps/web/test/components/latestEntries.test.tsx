import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";
import LatestEntries from "../../src/components/latestEntries";
import { withMantineTheme } from "../utils/WithMantineTheme";

const chainId = "11155111";
const inputs = [
    {
        node: {
            id: `${chainId}-0xf9f5c74acf5a20f1e91aeb057fd7f13db305a0e6-2`,
            application: {
                id: `${chainId}-0xf9f5c74acf5a20f1e91aeb057fd7f13db305a0e6`,
                address: "0xf9f5c74acf5a20f1e91aeb057fd7f13db305a0e6",
                __typename: "Application",
            },
            index: 2,
            payload: "0x322b32",
            msgSender: "0x5408cbca7740df5c8c4cbf494c6844d5f3029e04",
            timestamp: "1701367068",
            transactionHash:
                "0x903dbbd6538afb491e4b8e4dfa0598aa5b0c36ee4e1a7f202feec7328e846d09",
            erc20Deposit: null,
            __typename: "Input",
        },
        __typename: "InputEdge",
    },
    {
        node: {
            id: `${chainId}-0xf9f5c74acf5a20f1e91aeb057fd7f13db305a0e6-1`,
            application: {
                id: `${chainId}-0xf9f5c74acf5a20f1e91aeb057fd7f13db305a0e6`,
                address: "0xf9f5c74acf5a20f1e91aeb057fd7f13db305a0e6",
                __typename: "Application",
            },
            index: 1,
            payload: "0x322b32",
            msgSender: "0x5408cbca7740df5c8c4cbf494c6844d5f3029e04",
            timestamp: "1701366264",
            transactionHash:
                "0xdf731acafa3bb677c3772d2879bd9ca9e4feaa88b74e234bf27de8071aa91f3f",
            erc20Deposit: null,
            __typename: "Input",
        },
        __typename: "InputEdge",
    },
    {
        node: {
            id: `${chainId}-0xf9f5c74acf5a20f1e91aeb057fd7f13db305a0e6-0`,
            application: {
                id: `${chainId}-0xf9f5c74acf5a20f1e91aeb057fd7f13db305a0e6`,
                address: "0xf9f5c74acf5a20f1e91aeb057fd7f13db305a0e6",
                __typename: "Application",
            },
            index: 0,
            payload: "0x332b33",
            msgSender: "0x5408cbca7740df5c8c4cbf494c6844d5f3029e04",
            timestamp: "1701366132",
            transactionHash:
                "0x24cc261a70604f021dfe38c91b00463865202635581214052d59566293a90bcd",
            erc20Deposit: null,
            __typename: "Input",
        },
        __typename: "InputEdge",
    },
    {
        node: {
            id: `${chainId}-0x2dc155cb107b0ebe621b927f9e7acc4819e79a0d-0`,
            application: {
                id: `${chainId}-0x2dc155cb107b0ebe621b927f9e7acc4819e79a0d`,
                address: "0x2dc155cb107b0ebe621b927f9e7acc4819e79a0d",
                __typename: "Application",
            },
            index: 0,
            payload: "0x6d79206d657373616765",
            msgSender: "0xcba4fdb66456b0a9f30f0714ed0f79fe2ba5901b",
            timestamp: "1701354072",
            transactionHash:
                "0xead297e1340162462a6ebbb83223d7efafc012ecba5d22a2948ed0904bf1e5c8",
            erc20Deposit: null,
            __typename: "Input",
        },
        __typename: "InputEdge",
    },
    {
        node: {
            id: `${chainId}-0x60a7048c3136293071605a4eaffef49923e981cc-5`,
            application: {
                id: `${chainId}-0x60a7048c3136293071605a4eaffef49923e981cc`,
                address: "0x60a7048c3136293071605a4eaffef49923e981cc",
                __typename: "Application",
            },
            index: 5,
            payload:
                "0x8fd78976f8955d13baa4fc99043208f4ec020d7e0000000000000000000000000000000000000000000000000de0b6b3a76400003078",
            msgSender: "0xffdbe43d4c855bf7e0f105c400a50857f53ab044",
            timestamp: "1701348480",
            transactionHash:
                "0x00fd264f1b153b990ffc665189eabff1c302a355c538977f29febaa427e9baa7",
            erc20Deposit: null,
            __typename: "Input",
        },
        __typename: "InputEdge",
    },
    {
        node: {
            id: `${chainId}-0x60a7048c3136293071605a4eaffef49923e981cc-4`,
            application: {
                id: `${chainId}-0x60a7048c3136293071605a4eaffef49923e981cc`,
                address: "0x60a7048c3136293071605a4eaffef49923e981cc",
                __typename: "Application",
            },
            index: 4,
            payload: "0x3078313233",
            msgSender: "0x8fd78976f8955d13baa4fc99043208f4ec020d7e",
            timestamp: "1701348420",
            transactionHash:
                "0x76647656b12adc48ec813deca2eaeacc823f4c3e146fe212ea9b99044f35475a",
            erc20Deposit: null,
            __typename: "Input",
        },
        __typename: "InputEdge",
    },
];

const applications = [
    {
        node: {
            id: `${chainId}-0xf9f5c74acf5a20f1e91aeb057fd7f13db305a0e6`,
            address: "0xf9f5c74acf5a20f1e91aeb057fd7f13db305a0e6",
            owner: "0x5408cbca7740df5c8c4cbf494c6844d5f3029e04",
            timestamp: "1701358740",
            factory: {
                id: "0x7122cd1221c20892234186facfe8615e6743ab02",
                __typename: "ApplicationFactory",
            },
            __typename: "Application",
        },
        __typename: "ApplicationEdge",
    },
    {
        node: {
            id: `${chainId}-0x2dc155cb107b0ebe621b927f9e7acc4819e79a0d`,
            address: "0x2dc155cb107b0ebe621b927f9e7acc4819e79a0d",
            owner: "0xcba4fdb66456b0a9f30f0714ed0f79fe2ba5901b",
            timestamp: "1701353460",
            factory: {
                id: "0x7122cd1221c20892234186facfe8615e6743ab02",
                __typename: "ApplicationFactory",
            },
            __typename: "Application",
        },
        __typename: "ApplicationEdge",
    },
    {
        node: {
            id: `${chainId}-0xd3fb544b9ce4725733e1b1e4114ce228b624099f`,
            address: "0xd3fb544b9ce4725733e1b1e4114ce228b624099f",
            owner: "0xcba4fdb66456b0a9f30f0714ed0f79fe2ba5901b",
            timestamp: "1700770080",
            factory: {
                id: "0x7122cd1221c20892234186facfe8615e6743ab02",
                __typename: "ApplicationFactory",
            },
            __typename: "Application",
        },
        __typename: "ApplicationEdge",
    },
    {
        node: {
            id: `${chainId}-0xdb84080e7d2b4654a7e384de851a6cf7281643de`,
            address: "0xdb84080e7d2b4654a7e384de851a6cf7281643de",
            owner: "0x8a12cf75000cd2e73ab16469826838d5f137f444",
            timestamp: "1700592756",
            factory: {
                id: "0x7122cd1221c20892234186facfe8615e6743ab02",
                __typename: "ApplicationFactory",
            },
            __typename: "Application",
        },
        __typename: "ApplicationEdge",
    },
    {
        node: {
            id: `${chainId}-0xfdc52064fc8077bc48ad307bae41aebb050a58f2`,
            address: "0xfdc52064fc8077bc48ad307bae41aebb050a58f2",
            owner: "0x8a12cf75000cd2e73ab16469826838d5f137f444",
            timestamp: "1700579652",
            factory: {
                id: "0x7122cd1221c20892234186facfe8615e6743ab02",
                __typename: "ApplicationFactory",
            },
            __typename: "Application",
        },
        __typename: "ApplicationEdge",
    },
    {
        node: {
            id: `${chainId}-0xb76fddfdfa6a0f00213e5ea8491e103729eb1add`,
            address: "0xb76fddfdfa6a0f00213e5ea8491e103729eb1add",
            owner: "0x8a12cf75000cd2e73ab16469826838d5f137f444",
            timestamp: "1700577348",
            factory: {
                id: "0x7122cd1221c20892234186facfe8615e6743ab02",
                __typename: "ApplicationFactory",
            },
            __typename: "Application",
        },
        __typename: "ApplicationEdge",
    },
];

vi.mock("@cartesi/rollups-explorer-domain/explorer-hooks", async () => {
    const actual = await vi.importActual(
        "@cartesi/rollups-explorer-domain/explorer-hooks",
    );
    return {
        ...(actual as any),
        useInputsQuery: () => [
            {
                data: {
                    inputsConnection: {
                        edges: inputs,
                    },
                },
                fetching: false,
            },
        ],
        useApplicationsConnectionQuery: () => [
            {
                data: {
                    applicationsConnection: {
                        edges: applications,
                    },
                },
                fetching: false,
            },
        ],
    };
});

const Component = withMantineTheme(LatestEntries);

describe("LatestEntries component", () => {
    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("should display correct title for inputs", () => {
        render(<Component />);
        expect(screen.getByText("Latest inputs")).toBeInTheDocument();
    });

    it("should display correct title for applications", () => {
        render(<Component />);
        expect(screen.getByText("Latest applications")).toBeInTheDocument();
    });

    it("should display correct text for view all inputs button", () => {
        render(<Component />);
        expect(screen.getByText("View all inputs")).toBeInTheDocument();
    });

    it("should display correct text for view all inputs button", () => {
        render(<Component />);
        expect(screen.getByText("View all applications")).toBeInTheDocument();
    });

    it("should have correct link for redirecting to inputs page", () => {
        render(<Component />);

        const link = screen
            .getByText("View all inputs")
            .closest("a") as HTMLAnchorElement;

        expect(link.getAttribute("href")).toBe("/inputs");
    });

    it("should have correct link for redirecting to applications page", () => {
        render(<Component />);

        const link = screen
            .getByText("View all applications")
            .closest("a") as HTMLAnchorElement;
        expect(link.getAttribute("href")).toBe("/applications");
    });
});
