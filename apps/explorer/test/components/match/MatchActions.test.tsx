import { describe, expect, it } from "vitest";
import { MatchActions } from "../../../src/components/match/MatchActions";
import {
    createBisection,
    createMatch,
    createMatchAdvanced,
    createMatchSnapshot,
    createTournament,
} from "../../../src/stories/prt";
import { render, screen } from "../../test-utils";

const tournament = createTournament({ height: 5n });

describe("MatchActions", () => {
    it("should list every advance against the total bisections", () => {
        const advances = [
            createMatchAdvanced({ segmentStartPosition: 16n, logIndex: 1n }),
            createMatchAdvanced({ segmentStartPosition: 16n, logIndex: 2n }),
        ];
        const match = createMatch({
            snapshot: createMatchSnapshot({
                phase: "BISECTING",
                bisection: { ...createBisection(), currentHeight: 3n },
                sealed: null,
            }),
        });

        render(
            <MatchActions
                advances={advances}
                match={match}
                now={Date.now()}
                tournament={tournament}
            />,
        );

        expect(screen.getByText("1 / 4")).toBeInTheDocument();
        expect(screen.getByText("2 / 4")).toBeInTheDocument();
        expect(
            screen.getAllByRole("progressbar")[0].getAttribute("aria-valuenow"),
        ).toBe("50");
    });
});
