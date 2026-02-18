"use client";
import Dexie, { type Table } from "dexie";
import { databaseName } from "../../lib/db";
import {
    type DbNodeConnectionConfig,
    type NodeConnectionConfig,
    type Repository,
} from "./types";

export interface ConnectionItem extends NodeConnectionConfig {
    network: string;
}

/**
 * Implements the Repository interface providing a persistent storage.
 * It uses the IndexedDb underneath.
 */
class IndexedDbRepository extends Dexie implements Repository {
    // Notify the typing system that 'connections' is added by dexie when declaring the stores()
    connections!: Table<NodeConnectionConfig, number>;

    constructor() {
        super(databaseName);
        // Create first version of the connections store with auto-incremented id as primary key
        // Don't declare all columns like in SQL. You only declare properties you want to index for where() clause use.
        this.version(1).stores({
            connections: "++id, name, chain, url, version, type",
        });
    }

    async add(newConn: NodeConnectionConfig) {
        const id = await this.connections.add(newConn);
        return { ...newConn, id } as DbNodeConnectionConfig;
    }

    async remove(id: number) {
        const deleteCount = await this.connections.where({ id }).delete();

        return deleteCount > 0;
    }

    async get(id: number) {
        const connection = (await this.connections.get(
            id,
        )) as DbNodeConnectionConfig;
        return connection ?? null;
    }

    async list() {
        return (await this.connections.toArray()) as DbNodeConnectionConfig[];
    }
}

export default IndexedDbRepository;
