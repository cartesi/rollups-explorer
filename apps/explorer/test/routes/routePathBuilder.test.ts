import { describe, expect, it } from "vitest";
import {
    pathBuilder,
    type MatchParams,
    type TournamentParams,
} from "../../src/routes/routePathBuilder";

const application = "0x1234567890abcdef1234567890abcdef12345678";
const epochIndex = 42n;
const tournamentAddress = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
const idHash =
    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

describe("pathBuilder", () => {
    it("builds top-level paths", () => {
        expect(pathBuilder.base).toBe("/");
        expect(pathBuilder.home()).toBe("/");
        expect(pathBuilder.applications()).toBe("/apps");
        expect(pathBuilder.specifications()).toBe("/specifications");
        expect(pathBuilder.specificationsNew()).toBe("/specifications/new");
        expect(pathBuilder.specificationsEdit("specification-id")).toBe(
            "/specifications/edit/specification-id",
        );
    });

    it("builds application paths", () => {
        const params = { application };

        expect(pathBuilder.application(params)).toBe(`/apps/${application}`);
        expect(pathBuilder.withdrawals(params)).toBe(
            `/apps/${application}/withdrawals`,
        );
        expect(pathBuilder.outputs(params)).toBe(
            `/apps/${application}/outputs`,
        );
        expect(pathBuilder.epochs(params)).toBe(`/apps/${application}/epochs`);
    });

    it("builds nested epoch, tournament, and match paths", () => {
        const epochParams = { application, epochIndex };
        const tournamentParams = {
            ...epochParams,
            tournamentAddress,
        } as TournamentParams;
        const matchParams = { ...tournamentParams, idHash } as MatchParams;

        expect(pathBuilder.epoch(epochParams)).toBe(
            `/apps/${application}/epochs/${epochIndex}`,
        );
        expect(pathBuilder.tournament(tournamentParams)).toBe(
            `/apps/${application}/epochs/${epochIndex}/tournaments/${tournamentAddress}`,
        );
        expect(pathBuilder.match(matchParams)).toBe(
            `/apps/${application}/epochs/${epochIndex}/tournaments/${tournamentAddress}/matches/${idHash}`,
        );
    });

    it("exposes the expected route builder methods", () => {
        const methodNames = Object.entries(pathBuilder)
            .filter(([, value]) => typeof value === "function")
            .map(([name]) => name)
            .sort();

        expect(methodNames).toEqual([
            "application",
            "applications",
            "epoch",
            "epochs",
            "home",
            "match",
            "outputs",
            "specifications",
            "specificationsEdit",
            "specificationsNew",
            "tournament",
            "withdrawals",
        ]);
    });
});
