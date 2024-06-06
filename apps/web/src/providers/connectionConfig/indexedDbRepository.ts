"use client";
import Dexie, { Table } from "dexie";
import { Connection, Repository } from "./types";
import localRepository, { namespace, networkId } from "./localRepository";
import { Address } from "viem";

export interface ConnectionItem extends Connection {
    network: string;
}

/**
 * Implements the Repository interface providing a persistent storage.
 * It uses the IndexedDb underneath.
 */
class IndexedDbRepository extends Dexie implements Repository {
    // Notify the typing system that 'connections' is added by dexie when declaring the stores()
    connections!: Table<ConnectionItem>;

    constructor() {
        super(namespace);
        // Create first version of the connections store with address as primary key and indexed props
        this.version(1).stores({
            connections: "address, url, timestamp, network",
        });

        // When the db is ready, initialize data for it
        this.connections.db.on(
            "ready",
            () =>
                new Promise((resolve) => {
                    this.initialize().then(resolve);
                }),
        );
    }

    private async initialize() {
        // Get existing connections from indexedDbRepository
        const indexedDbConnections = await this.connections
            .where("network")
            .equals(networkId)
            .toArray();

        // Get existing connections from localRepository
        const localRepositoryConnections = await localRepository.list();

        // Check if data from localRepository should be migrated to indexedDbRepository
        if (
            indexedDbConnections.length === 0 &&
            localRepositoryConnections.length > 0
        ) {
            const connections = localRepositoryConnections.map(
                (connection) => ({
                    ...connection,
                    network: networkId,
                }),
            ) as ConnectionItem[];

            // Save augmented connections
            await this.connections.bulkPut(connections);

            // Remove connections from localRepository to keep a single source of truth
            await Promise.all(
                connections.map((c) => localRepository.remove(c.address)),
            );
        }
    }

    private formatConnection(connection: ConnectionItem) {
        return {
            address: connection.address,
            url: connection.url,
            timestamp: connection.timestamp,
        } as Connection;
    }

    async add(conn: Connection) {
        const connectionItem: ConnectionItem = {
            ...conn,
            timestamp: Date.now(),
            network: networkId,
        };

        return this.connections.add(connectionItem);
    }

    async has(addr: Address) {
        const connection = await this.connections
            .where("network")
            .equals(networkId)
            .and((connection) => connection.address === addr)
            .first();

        return Boolean(connection);
    }

    async remove(addr: Address) {
        await this.connections
            .where("network")
            .equals(networkId)
            .and((connection) => connection.address === addr)
            .delete();

        return true;
    }

    async get(addr: Address) {
        const connection = (await this.connections
            .where("network")
            .equals(networkId)
            .and((connection) => connection.address === addr)
            .first()) as ConnectionItem;

        return this.formatConnection(connection);
    }

    async list() {
        const connections = await this.connections
            .where("network")
            .equals(networkId)
            .toArray();

        return connections.map(this.formatConnection);
    }
}

export default IndexedDbRepository;
