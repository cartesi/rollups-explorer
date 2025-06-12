import {
    Application as ExplorerApplication,
    RollupVersion as ExplorerRollupVersion,
} from "@cartesi/rollups-explorer-domain/explorer-types";

export type RollupVersion = `${ExplorerRollupVersion}`;

export type Application = Pick<
    ExplorerApplication,
    "id" | "address" | "rollupVersion"
>;
