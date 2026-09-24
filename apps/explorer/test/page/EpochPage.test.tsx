import type { Application } from "@cartesi/client";
import { describe, expect, it, vi } from "vitest";
import { EpochPage } from "../../src/page/EpochPage";
import { applications } from "../../src/stories/data";
import { createTournament } from "../../src/stories/prt";
import { createApplication, render, screen } from "../test-utils";

vi.mock("next/navigation", () => ({
    usePathname: () => "/apps/app/epochs/3",
    useRouter: () => ({ push: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
}));

const epoch = applications[0].epochs[3];

const application = {
    ...createApplication(),
    consensusType: "PRT",
} satisfies Application;

describe("EpochPage", () => {
    it("should flag the epoch as disputed while root matches are active", () => {
        render(
            <EpochPage
                application={application}
                epoch={epoch}
                inputs={[]}
                tournament={createTournament({
                    baseCycle: 0n,
                    log2step: 2n,
                    height: 3n,
                    snapshot: { standing: "MATCHES_ACTIVE" },
                })}
            />,
        );

        expect(screen.getByText("disputed")).toBeInTheDocument();
        expect(screen.getByText("0 → 32")).toBeInTheDocument();
    });

    it("should not flag the epoch once the root tournament has no matches", () => {
        render(
            <EpochPage
                application={application}
                epoch={epoch}
                inputs={[]}
                tournament={createTournament({
                    snapshot: { standing: "AWAITING_CLOSURE" },
                })}
            />,
        );

        expect(screen.queryByText("disputed")).not.toBeInTheDocument();
    });
});
