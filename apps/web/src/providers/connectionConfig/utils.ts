import { Connection, IndexedDbRepository } from "./types";
import { ConnectionItem, ConnectionsDb } from "./indexedDbRepository";

export const hasInitialize = (
    repository: any,
): repository is IndexedDbRepository<ConnectionsDb> => {
    return (
        "initialize" in repository &&
        typeof repository.initialize === "function"
    );
};

export const formatConnection = (connection: ConnectionItem) => {
    return {
        address: connection.address,
        url: connection.url,
        timestamp: connection.timestamp,
    } as Connection;
};
