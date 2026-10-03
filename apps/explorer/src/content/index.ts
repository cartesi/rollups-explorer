import { bondMessages } from "./bondMessages";
import { forecloseMessages } from "./forecloseMessages";
import { globalMessages } from "./globalMessages";
import { matchMessages } from "./matchMessages";
import { outputMessages } from "./outputMessages";
import { tournamentMessages } from "./tournamentMessages";
import { withdrawalMessages } from "./withdrawalMessages";

export const content = {
    bond: bondMessages,
    foreclose: forecloseMessages,
    global: globalMessages,
    match: matchMessages,
    output: outputMessages,
    tournament: tournamentMessages,
    withdrawal: withdrawalMessages,
} as const;
