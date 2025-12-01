/**
 * One commitment
 * Closed (and finished → with winner) [4]
 */

import type { ApplicationEpochs } from "../types";
import { claim, generateTournamentId } from "../util";

export const applicationFour: ApplicationEpochs = {
    address: "0x8703056f8a57efb779875d5f9c172b4594fcd329",
    name: "App Four",
    consensusType: "PRT",
    state: "ENABLED",
    processedInputs: 3,
    epochs: [
        {
            index: 0,
            inDispute: false,
            status: "CLOSED",
            tournament: {
                id: generateTournamentId(0, 1_345_972_719),
                startCycle: 0,
                status: "FINALIZED",
                endCycle: 1_345_972_719,
                height: 48,
                level: "top",
                matches: [],
                danglingClaim: claim(1),
                winner: claim(1),
            },
        },
    ],
};
