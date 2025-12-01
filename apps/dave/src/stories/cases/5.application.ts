/**
 * TopTournament`:**
 *  - `winMatchByTimeout` [5]
 */

import { getUnixTime, subMinutes } from "date-fns";
import type { ApplicationEpochs } from "../types";
import { claim, generateMatchID, generateTournamentId } from "../util";

const claim1 = claim(0);
const claim2 = claim(1);
const currentDate = new Date();
const matchStartTime = getUnixTime(subMinutes(currentDate, 60));
const timeoutTime = getUnixTime(subMinutes(currentDate, 10));

export const applicationFive: ApplicationEpochs = {
    address: "0x27c2cb273d92f9c318696124018fc7adb8873122",
    name: "App Five",
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
                danglingClaim: claim1,
                matches: [
                    {
                        claim1,
                        claim2,
                        id: generateMatchID(claim1.hash, claim2.hash),
                        timestamp: matchStartTime,
                        actions: [
                            {
                                type: "advance",
                                direction: 0,
                                timestamp: getUnixTime(
                                    subMinutes(currentDate, 50),
                                ),
                            },
                            {
                                type: "timeout",
                                timestamp: timeoutTime,
                            },
                        ],
                        winner: 1,
                        winnerTimestamp: timeoutTime,
                    },
                ],
            },
        },
    ],
};
