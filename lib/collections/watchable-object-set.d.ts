import { Subject } from 'rxjs';
import { BaseObjectSet } from './base-object-set';
export default class WatchableObjectSet<ObjectType> implements BaseObjectSet<ObjectType> {
    private wrappedSet;
    additions: Subject<ObjectType>;
    removals: Subject<ObjectType>;
    constructor(wrappedSet: BaseObjectSet<ObjectType>);
    get size(): number;
    bucketSize(bucketKey: string): number;
    add(object: ObjectType): boolean;
    remove(object: ObjectType): ObjectType | null;
    removeByKey(key: string): ObjectType | null;
    getByKey(key: string): ObjectType | null;
    hasKey(key: string): boolean;
    forEach(fn: (item: ObjectType) => (boolean | void)): void;
    map<MappedType>(fn: (item: ObjectType) => MappedType): MappedType[];
    forEachItemInBucket(bucketKey: string, fn: (item: ObjectType) => boolean | undefined): void;
    bucket(bucketKey: string): Iterable<ObjectType>;
}
