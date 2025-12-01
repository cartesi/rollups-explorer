/**
 * One commitment
 * Tournament Open
 */

import type { ApplicationEpochs } from "../types";
import { claim, generateTournamentId } from "../util";

export const applicationThree: ApplicationEpochs = {
    address: "0xfedcc6bfc1a7077b61fa59e91bb7f5ad67851945",
    name: "App Three",
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
                danglingClaim: claim(0),
            },
        },
    ],
};
