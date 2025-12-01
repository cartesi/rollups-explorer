/**
 * Zero commitments
 * Closed (and finished → no winner) [2]
 */

import type { ApplicationEpochs } from "../types";
import { generateTournamentId } from "../util";

export const applicationTwo: ApplicationEpochs = {
    address: "0x245216ec64bef3a84d040cc9aba864763434f29d",
    name: "App Two",
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
            },
        },
    ],
};
