import { forecloseMessages } from "./forecloseMessages";
import { globalMessages } from "./globalMessages";
import { outputMessages } from "./outputMessages";
import { withdrawalMessages } from "./withdrawalMessages";

export const content = {
    foreclose: forecloseMessages,
    global: globalMessages,
    output: outputMessages,
    withdrawal: withdrawalMessages,
} as const;
