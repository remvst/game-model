import { BaseObjectSet } from './base-object-set';
export default class ObjectSet<ObjectType> implements BaseObjectSet<ObjectType> {
    private getKey;
    private getBuckets;
    private list;
    private objectMap;
    private bucketMap;
    constructor(getKey: (item: ObjectType) => string, getBuckets?: ((item: ObjectType) => string[]) | undefined);
    get size(): number;
    add(object: ObjectType): boolean;
    remove(object: ObjectType): ObjectType | null;
    forEachItemInBucket(bucketKey: string, fn: (item: ObjectType) => (boolean | void)): true | undefined;
    removeByKey(key: string): ObjectType | null;
    getByKey(key: string): ObjectType | null;
    hasKey(key: string): boolean;
    forEach(fn: (item: ObjectType) => (boolean | void)): boolean;
    map<MappedType>(fn: (item: ObjectType) => MappedType): MappedType[];
}
