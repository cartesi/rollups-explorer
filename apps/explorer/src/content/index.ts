import { forecloseMessages } from "./forecloseMessages";
import { globalMessages } from "./globalMessages";
import { outputMessages } from "./outputMessages";

export const content = {
    foreclose: forecloseMessages,
    global: globalMessages,
    output: outputMessages,
} as const;
