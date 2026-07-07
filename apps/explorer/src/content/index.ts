import { forecloseMessages } from "./forecloseMessages";
import { globalMessages } from "./globalMessages";

export const content = {
    foreclose: forecloseMessages,
    global: globalMessages,
} as const;
