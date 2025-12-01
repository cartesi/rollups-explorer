/**
 * TopTournament`:**
 *  - `eliminateMatchByTimeout` [6]
 */

import { getUnixTime, subMinutes } from "date-fns";
import type { ApplicationEpochs } from "../types";
import { claim, generateMatchID, generateTournamentId } from "../util";

const claim1 = claim(2);
const claim2 = claim(3);
const currentDate = new Date();
const matchStartTime = getUnixTime(subMinutes(currentDate, 60));
const timeoutTime = getUnixTime(subMinutes(currentDate, 35));

export const applicationSix: ApplicationEpochs = {
    address: "0xd89231a464d15f3c84232e9100d26eb0fbd94f5b",
    name: "App Six",
    consensusType: "PRT",
    state: "ENABLED",
    processedInputs: 3,
    epochs: [
        {
            index: 0,
            inDispute: true,
            status: "CLOSED",
            tournament: {
                id: generateTournamentId(0, 1_345_972_719),
                startCycle: 0,
                status: "OPEN",
                endCycle: 1_345_972_719,
                height: 48,
                level: "top",
                matches: [
                    {
                        claim1,
                        claim2,
                        id: generateMatchID(claim1.hash, claim2.hash),
                        timestamp: matchStartTime,
                        actions: [
                            {
                                type: "match_eliminated_by_timeout",
                                timestamp: timeoutTime,
                            },
                        ],
                    },
                ],
            },
        },
    ],
};
