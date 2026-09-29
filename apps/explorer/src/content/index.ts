import { bondMessages } from "./bondMessages";
import { forecloseMessages } from "./forecloseMessages";
import { globalMessages } from "./globalMessages";
import { matchMessages } from "./matchMessages";
import { mockMessages } from "./mockMessages";
import { outputMessages } from "./outputMessages";
import { tournamentMessages } from "./tournamentMessages";
import { withdrawalMessages } from "./withdrawalMessages";

export const content = {
    bond: bondMessages,
    foreclose: forecloseMessages,
    global: globalMessages,
    match: matchMessages,
    mock: mockMessages,
    output: outputMessages,
    tournament: tournamentMessages,
    withdrawal: withdrawalMessages,
} as const;
