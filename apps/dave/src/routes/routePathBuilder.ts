import type { Address, Hex } from "viem";

export type ApplicationParams = {
    application: string | Address;
};

export type EpochParams = ApplicationParams & {
    epochIndex: string;
};

export type TournamentParams = EpochParams & {
    tournamentAddress: Address;
};

export type MatchParams = TournamentParams & {
    matchId: Hex;
};

export const routePathBuilder = {
    base: "/" as const,
    home: () => routePathBuilder.base,
    applications: () => `${routePathBuilder.home()}apps` as const,
    application: (params?: ApplicationParams) =>
        `${routePathBuilder.applications()}/${params?.application ?? ":application"}` as const,
    epochs: (params?: ApplicationParams) =>
        `${routePathBuilder.application(params)}/epochs` as const,
    epoch: (params?: EpochParams) =>
        `${routePathBuilder.epochs(params)}/${params?.epochIndex ?? ":epochIndex"}` as const,
    tournament: (params?: TournamentParams) =>
        `${routePathBuilder.epoch(params)}/tournaments/${params?.tournamentAddress ?? ":tournamentAddress"}` as const,
    match: (params?: MatchParams) =>
        `${routePathBuilder.tournament(params)}/matches/${params?.matchId ?? ":matchId"}` as const,
};
