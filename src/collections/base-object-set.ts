export interface BaseObjectSet<ObjectType> {

    size: number

    add(object: ObjectType): boolean

    remove(object: ObjectType): ObjectType | null

    removeByKey(key: string): ObjectType | null

    getByKey(key: string): ObjectType | null

    hasKey(key: string): boolean

    forEach(fn: (item: ObjectType) => (boolean | void)): void

    forEachItemInBucket(bucketKey: string, fn: (item: ObjectType) => (boolean | void)): void

    bucket(bucketKey: string): Iterable<ObjectType>;

    bucketSize(bucketKey: string): number

    map<MappedType>(fn: (item: ObjectType) => MappedType): MappedType[];
}
