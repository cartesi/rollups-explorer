"use client";
import Dexie, { Table } from "dexie";
import { AsyncRepository, Connection } from "./types";
import localRepository, { namespace, networkId } from "./localRepository";

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

/**
 * Implements the Repository interface providing a persistent storage.
 * It uses the IndexedDb underneath.
 */
const indexedDbRepository: AsyncRepository<ConnectionsDb> = {
    db: null,
    async connect() {
        if (!this.db) {
            this.db = new ConnectionsDb();
        }
        return this.db;
    },
    async initialize() {
        const db = await this.connect();
        const asyncConnectionsCount = await db.connections
            .where("network")
            .equals(networkId)
            .count();
        const localStorageConnections = await localRepository.list();

        if (asyncConnectionsCount === 0 && localStorageConnections.length > 0) {
            const connections = localStorageConnections.map((connection) => ({
                ...connection,
                network: networkId,
            })) as ConnectionItem[];
            this.db?.connections.bulkPut(connections);
        }
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
        const connection = await db.connections
            .where("network")
            .equals(networkId)
            .and((connection) => connection.address === addr)
            .first();

        return Boolean(connection);
    },
    async remove(addr) {
        const db = await this.connect();
        try {
            await db.connections
                .where("network")
                .equals(networkId)
                .and((connection) => connection.address === addr)
                .delete();
            return true;
        } catch (err) {
            return false;
        }
    },
    async get(addr) {
        const db = await this.connect();
        const connection = (await db.connections
            .where("network")
            .equals(networkId)
            .and((connection) => connection.address === addr)
            .first()) as ConnectionItem;

        return formatConnection(connection);
    },
    async list() {
        const db = await this.connect();
        const connections = await db.connections
            .where("network")
            .equals(networkId)
            .toArray();

        return connections.map(formatConnection);
    },
};

export default indexedDbRepository;
