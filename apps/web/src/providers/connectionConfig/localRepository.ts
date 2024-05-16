"use client";
import { hasPath, omit, path, pathOr, values } from "ramda";
import { Config, Connection, Repository } from "./types";

export const networkId = process.env.NEXT_PUBLIC_CHAIN_ID || "31337";
export const namespace = `cartesiscan:conn` as const;
const deserialize = <T>(jsonString: string) => JSON.parse(jsonString) as T;
const serialize = (cfg: Config) => JSON.stringify(cfg);

export const getConfig = () => {
    const raw = localStorage.getItem(namespace);
    return raw ? deserialize<Config>(raw) : { [networkId]: {} };
};

/**
 * Implements the Repository interface providing a persistent storage.
 * It uses the LocalStorage underneath.
 */
const localRepository: Repository = {
    async add(conn: Connection) {
        const cfg = getConfig();
        conn.timestamp = Date.now();
        if (cfg[networkId]) {
            cfg[networkId][conn.address] = conn;
        } else {
            cfg[networkId] = { [conn.address]: conn };
        }

        localStorage.setItem(namespace, serialize(cfg));
        return { ...conn };
    },

    async has(addr) {
        const cfg = getConfig();
        return hasPath([networkId, addr], cfg);
    },

    async remove(addr) {
        const cfg = getConfig();
        if (hasPath([networkId, addr], cfg)) {
            const newEntry = omit([addr], cfg[networkId]);
            cfg[networkId] = newEntry;
            localStorage.setItem(namespace, serialize(cfg));
        }

        return true;
    },
    async get(addr) {
        const cfg = getConfig();
        return pathOr<Connection | null>(null, [networkId, addr], cfg);
    },

    async list() {
        const cfg = getConfig();
        return values(path([networkId], cfg));
    },
};

export default localRepository;
