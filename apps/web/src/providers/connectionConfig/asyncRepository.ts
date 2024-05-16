"use client";
import Dexie, { Table } from "dexie";
import { Connection, Repository } from "./types";
import localRepository, { networkId, namespace } from "./localRepository";

const formatConnection = (connection: ConnectionItem) => {
    return {
        address: connection.address,
        url: connection.url,
        timestamp: connection.timestamp,
    } as Connection;
};

export interface ConnectionItem extends Connection {
    network: string;
}

export class ConnectionsDb extends Dexie {
    // 'connections' is added by dexie when declaring the stores()
    // We just tell the typing system this is the case
    connections!: Table<ConnectionItem>;

    constructor() {
        super(namespace);
        this.version(1).stores({
            // Primary key and indexed props
            connections: "address, url, timestamp, network",
        });
    }
}

export interface AsyncRepository extends Repository {
    db: ConnectionsDb | null;
    initialize: () => void;
    isInitialized: boolean;
    connect: () => Promise<ConnectionsDb>;
}

/**
 * Implements the Repository interface providing a persistent storage.
 * It uses the IndexedDb underneath.
 */
const indexedDbRepository: AsyncRepository = {
    db: null,
    isInitialized: false,
    async initialize() {
        const indexedDbConnectionsCount = await this.db?.connections
            .where("network")
            .equals(networkId)
            .count();
        const localStorageConnections = await localRepository.list();

        if (
            indexedDbConnectionsCount === 0 &&
            localStorageConnections.length > 0
        ) {
            const connections = localStorageConnections.map((connection) => ({
                ...connection,
                network: networkId,
            })) as ConnectionItem[];
            return this.db?.connections.bulkPut(connections);
        }
    },
    async connect() {
        if (!this.db) {
            this.db = new ConnectionsDb();
        }
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
        return this.db;
    },
    async add(conn: Connection) {
        const connectionItem: ConnectionItem = {
            ...conn,
            timestamp: Date.now(),
            network: networkId,
        };

        const db = await this.connect();
        return db.connections.add(connectionItem);
    },

    async has(addr) {
        const db = await this.connect();
        const connection = await db.connections.get({
            network: networkId,
            address: addr,
        });

        return Boolean(connection);
    },

    async remove(addr) {
        const db = await this.connect();
        try {
            await db.connections.delete({
                network: networkId,
                address: addr,
            });
            return true;
        } catch (err) {
            return false;
        }
    },
    async get(addr) {
        const db = await this.connect();
        const connection = (await db.connections.get({
            network: networkId,
            address: addr,
        })) as ConnectionItem;

        return formatConnection(connection);
    },
    async list() {
        const db = await this.connect();

        const connections = await db.connections
            .where("network")
            .equals(networkId)
            .toArray();

        console.log("indexedDbRepository::list::", connections);

        return connections.map(formatConnection);
    },
};

export default indexedDbRepository;
