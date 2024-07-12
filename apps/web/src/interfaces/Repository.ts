export interface IRepository<EntityT, AttributeT extends keyof EntityT> {
    add: (entity: EntityT) => Promise<EntityT>;
    remove: (attr: Required<EntityT>[AttributeT]) => Promise<boolean>;
    has: (attr: Required<EntityT>[AttributeT]) => Promise<boolean>;
    get: (attr: Required<EntityT>[AttributeT]) => Promise<EntityT | null>;
    list: () => Promise<EntityT[]>;
}
