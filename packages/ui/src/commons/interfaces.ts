import { Hex } from "viem";

export type RollupVersion = "v1" | "v2";

export interface Application {
    id: string;
    address: string | Hex;
    rollupVersion: RollupVersion;
}
