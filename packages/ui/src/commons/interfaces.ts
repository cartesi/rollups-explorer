import {
    Application as ExplorerApplication,
    RollupVersion as ExplorerRollupVersion,
} from "@cartesi/rollups-explorer-domain/explorer-types";

export type RollupVersion = `${ExplorerRollupVersion}`;

export interface Application
    extends Pick<ExplorerApplication, "id" | "address"> {
    rollupVersion: RollupVersion;
}
