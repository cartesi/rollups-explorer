import type { Address, Hex } from "viem";

export type ApplicationParams = {
    application: string | Address;
};

export type EpochParams = ApplicationParams & {
    epochIndex: bigint;
};

export type TournamentParams = EpochParams & {
    tournamentAddress: Address;
};

export type MatchParams = TournamentParams & {
    idHash: Hex;
};

export const pathBuilder = {
    base: "/" as const,
    home: () => pathBuilder.base,
    applications: () => `${pathBuilder.home()}apps` as const,
    application: (params: ApplicationParams) =>
        `${pathBuilder.applications()}/${params.application}` as const,
    epochs: (params: ApplicationParams) =>
        `${pathBuilder.application(params)}/epochs` as const,
    epoch: (params: EpochParams) =>
        `${pathBuilder.epochs(params)}/${params.epochIndex}` as const,
    tournament: (params: TournamentParams) =>
        `${pathBuilder.epoch(params)}/tournaments/${params.tournamentAddress}` as const,
    match: (params: MatchParams) =>
        `${pathBuilder.tournament(params)}/matches/${params.idHash}` as const,
};
