import { IndexedDbRepository } from "./types";
import { ConnectionsDb } from "./indexedDbRepository";

export const hasInitialize = (
    repository: any,
): repository is IndexedDbRepository<ConnectionsDb> => {
    return (
        "initialize" in repository &&
        typeof repository.initialize === "function"
    );
};
