import { foundry } from "viem/chains";
import { describe, expect, it, vi } from "vitest";
import { BondEventPage } from "../../src/page/BondEventPage";
import { createBondEvent } from "../../src/stories/prt";
import { render, screen } from "../test-utils";

vi.mock("wagmi", async () => {
    const actual = await vi.importActual("wagmi");
    return { ...actual, useConfig: () => ({ chains: [foundry] }) };
});

const application = "honeypot";
const claimer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

describe("BondEventPage", () => {
    it("should show a failed refund as requested", () => {
        render(
            <BondEventPage
                application={application}
                event={createBondEvent({
                    epochIndex: 4n,
                    refund: {
                        recipient: claimer,
                        value: 1_000_000_000_000_000n,
                        success: false,
                    },
                })}
            />,
        );

        expect(screen.getByText("gas refund not paid")).toBeInTheDocument();
        expect(screen.getByText("Requested")).toBeInTheDocument();
        expect(screen.getByText("0.001 ETH")).toBeInTheDocument();
        expect(screen.getByText("Epoch #4")).toHaveAttribute(
            "href",
            "/apps/honeypot/epochs/4/tournaments/0xA2835312696Afa86c969e40831857dbB1412627f",
        );
    });

    it("should show the recovered payment and burned value", () => {
        render(
            <BondEventPage
                application={application}
                event={createBondEvent({
                    type: "BOND_RECOVERED",
                    refund: null,
                    recovery: {
                        commitment:
                            "0x725e9d3febbdd79841345f187aacf343ee497214277f3cb330aca90319cbdd92",
                        claimer,
                        payment: 200_000_000_000_000_000n,
                        burned: 50_000_000_000_000_000n,
                    },
                })}
            />,
        );

        expect(screen.getByText("bond recovered")).toBeInTheDocument();
        expect(screen.getByText("0.2 ETH")).toBeInTheDocument();
        expect(screen.getByText("0.05 ETH")).toBeInTheDocument();
    });
});
