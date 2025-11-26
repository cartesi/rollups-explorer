import type { Application, Epoch, Tournament } from "../components/types";

export type EpochWithTournament = Epoch & { tournament?: Tournament };
export type ApplicationEpochs = Application & { epochs: EpochWithTournament[] };
