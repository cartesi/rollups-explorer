"use client";
import { clone, hasPath, omit, pathOr, values } from "ramda";
import { v4 as uuidv4 } from "uuid";
import { Repository, Specification } from "../types";

export const namespace = `cartesiscan:specs` as const;

type DictKey = Required<Specification>["id"];
type Dict = { [k: DictKey]: Specification };

const deserialize = <T>(jsonString: string) => JSON.parse(jsonString) as T;
const serialize = (cfg: Dict) => JSON.stringify(cfg);

const getConfig = () => {
    const raw = localStorage.getItem(namespace);
    return raw ? deserialize<Dict>(raw) : {};
};

/**
 * Implements the Repository interface providing a persistent storage.
 * It uses the LocalStorage underneath.
 */
const localRepository: Repository = {
    async add(spec: Specification) {
        const cfg = getConfig();
        spec.id = uuidv4();
        spec.timestamp = Date.now();
        cfg[spec.id] = spec;
        localStorage.setItem(namespace, serialize(cfg));

        return clone(spec);
    },

    async has(id) {
        const cfg = getConfig();
        return hasPath([id], cfg);
    },

    async remove(id) {
        const cfg = getConfig();
        if (hasPath([id], cfg)) {
            const newCfg = omit([id], cfg);
            localStorage.setItem(namespace, serialize(newCfg));
        }

        return true;
    },
    async get(id) {
        const cfg = getConfig();
        return pathOr<Specification | null>(null, [id], cfg);
    },

    async list() {
        return values(getConfig());
    },

    async update(spec: Specification) {
        if (!spec.id)
            throw new Error("Trying to update a specification without Id");
        const cfg = getConfig();
        spec.timestamp = Date.now();
        cfg[spec.id] = spec;
        localStorage.setItem(namespace, serialize(cfg));

        return clone(spec);
    },
};

export default localRepository;
