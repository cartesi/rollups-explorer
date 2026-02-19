"use client";
import Dexie, { type Table } from "dexie";
import { clone } from "ramda";
import { v4 } from "uuid";
import { databaseName } from "../../../lib/db";
import {
    type DbSpecification,
    type Repository,
    type Specification,
} from "../types";

/**
 * Implements the Repository interface providing a persistent storage.
 * It uses the IndexedDb underneath.
 */
class SpecificationRepository extends Dexie implements Repository {
    // Notify the typing system that 'specifications' is added by dexie when declaring the stores()
    specifications!: Table<DbSpecification, string>;

    constructor() {
        super(databaseName);

        // Don't declare all columns like in SQL. You only declare properties you want to index for where() clause use.
        this.version(1).stores({
            specifications: "id, name, mode, timestamp",
        });
    }

    async add(spec: Specification) {
        const id = v4();
        const newSpec: DbSpecification = { ...spec, id, timestamp: Date.now() };
        const savedId = await this.specifications.add(newSpec);

        console.log(`savedIdReturned: ${savedId}`);
        console.log(`savedIdGenerated: ${id}`);

        return newSpec;
    }

    async update(spec: DbSpecification): Promise<DbSpecification> {
        if (!spec.id)
            throw new Error("Trying to update a specification without Id");

        spec.timestamp = Date.now();
        const updateCount = await this.specifications.update(spec.id, spec);
        console.info(`Specification(s) updated: ${updateCount}`);

        return clone(spec);
    }

    async remove(id: string): Promise<boolean> {
        const deleteCount = await this.specifications.where({ id }).delete();
        return deleteCount > 0;
    }

    async get(id: string): Promise<Specification | null> {
        const specification = await this.specifications.get(id);

        return specification ?? null;
    }

    async list(): Promise<DbSpecification[]> {
        return await this.specifications.toArray();
    }
}

export default SpecificationRepository;
