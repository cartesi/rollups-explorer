import { forecloseMessages } from "./forecloseMessages";
import { globalMessages } from "./globalMessages";
import { outputMessages } from "./outputMessages";
import { tournamentMessages } from "./tournamentMessages";
import { withdrawalMessages } from "./withdrawalMessages";

export const content = {
    foreclose: forecloseMessages,
    global: globalMessages,
    output: outputMessages,
    tournament: tournamentMessages,
    withdrawal: withdrawalMessages,
} as const;
