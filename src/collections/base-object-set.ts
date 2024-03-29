export interface BaseObjectSet<ObjectType> {
    size: number;

    add(object: ObjectType): boolean;

    remove(object: ObjectType): ObjectType | null;

    removeByKey(key: string): ObjectType | null;

    getByKey(key: string): ObjectType | null;

    hasKey(key: string): boolean;

    forEach(fn: (item: ObjectType) => boolean | void): void;

    items(): Iterable<ObjectType>;

    bucket(bucketKey: string): Iterable<ObjectType>;

    bucketSize(bucketKey: string): number;
}
