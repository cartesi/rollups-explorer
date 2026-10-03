import { foundry } from "viem/chains";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TournamentPage } from "../../src/page/TournamentPage";
import { createBondEvent, createTournament } from "../../src/stories/prt";
import { fireEvent, render, screen } from "../test-utils";

const mocks = vi.hoisted(() => ({
    push: vi.fn(),
    searchParams: new URLSearchParams(),
}));

const pathname =
    "/apps/app/epochs/0/tournaments/0xA2835312696Afa86c969e40831857dbB1412627f";

vi.mock("next/navigation", () => ({
    usePathname: () => pathname,
    useRouter: () => ({ push: mocks.push }),
    useSearchParams: () => mocks.searchParams,
}));

vi.mock("wagmi", async () => {
    const actual = await vi.importActual("wagmi");
    return { ...actual, useConfig: () => ({ chains: [foundry] }) };
});

describe("TournamentPage", () => {
    beforeEach(() => {
        mocks.push.mockClear();
        mocks.searchParams = new URLSearchParams();
    });

    it("should keep the bonds tab in the URL", () => {
        render(
            <TournamentPage
                bondEvents={[createBondEvent()]}
                commitments={[]}
                matches={[]}
                tab="matches"
                tournament={createTournament()}
            />,
        );

        fireEvent.click(screen.getByRole("tab", { name: /Bonds/ }));

        expect(mocks.push).toHaveBeenCalledWith(`${pathname}?tab=bonds`, {
            scroll: false,
        });
    });

    it("should drop the tab from the URL for the matches", () => {
        mocks.searchParams = new URLSearchParams("tab=bonds");
        render(
            <TournamentPage
                bondEvents={[createBondEvent()]}
                commitments={[]}
                matches={[]}
                tab="bonds"
                tournament={createTournament()}
            />,
        );

        fireEvent.click(screen.getByRole("tab", { name: /Matches/ }));

        expect(mocks.push).toHaveBeenCalledWith(pathname, { scroll: false });
    });
});
