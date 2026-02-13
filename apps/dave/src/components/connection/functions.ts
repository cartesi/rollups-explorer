import { descend, prop, sort } from "ramda";
import type { DbNodeConnectionConfig } from "./types";

export const sortByTimestampDesc = sort<DbNodeConnectionConfig>(
    descend<DbNodeConnectionConfig>(prop("timestamp")),
);
