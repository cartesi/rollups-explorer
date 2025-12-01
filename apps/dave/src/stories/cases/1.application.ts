/**
 * Zero commitments
 * Open [1]
 */

import type { ApplicationEpochs } from "../types";
import { generateTournamentId } from "../util";

export const applicationOne: ApplicationEpochs = {
    address: "0x4c1E74EF88a75C24e49eddD9f70D82A94D19251c",
    name: "App One",
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
                status: "OPEN",
                endCycle: 1_345_972_719,
                height: 48,
                level: "top",
                matches: [],
            },
        },
    ],
};
