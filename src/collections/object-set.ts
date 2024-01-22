import { BaseObjectSet } from "./base-object-set";

export default class ObjectSet<ObjectType>
    implements BaseObjectSet<ObjectType>
{
    private readonly objectMap = new Map<string, ObjectType>();
    private readonly bucketMap = new Map<string, ObjectType[]>();

    constructor(
        private readonly getKey: (item: ObjectType) => string,
        private readonly getBuckets?: (item: ObjectType) => string[],
    ) {}

    get size(): number {
        return this.objectMap.size;
    }

    items(): Iterable<ObjectType> {
        return this.objectMap.values();
    }

    bucketSize(bucketKey: string): number {
        return this.bucketMap.get(bucketKey)?.length || 0;
    }

    add(object: ObjectType): boolean {
        const key = this.getKey(object);
        if (this.objectMap.has(key)) {
            return false;
        }

        this.objectMap.set(key, object);

        if (this.getBuckets) {
            this.getBuckets(object).forEach((bucketKey) => {
                let bucket = this.bucketMap.get(bucketKey);
                if (!bucket) {
                    bucket = [];
                    this.bucketMap.set(bucketKey, bucket);
                }

                bucket.push(object);
            });
        }

        return true;
    }

    remove(object: ObjectType): ObjectType | null {
        const key = this.getKey(object);
        if (!this.objectMap.has(key)) {
            return null;
        }

        this.objectMap.delete(key);

        if (this.getBuckets) {
            this.getBuckets(object).forEach((bucketKey) => {
                const bucket = this.bucketMap.get(bucketKey);
                if (!bucket) {
                    return;
                }

                const indexInBucket = bucket.indexOf(object);
                if (indexInBucket >= 0) {
                    bucket.splice(indexInBucket, 1);
                }
            });
        }

        return object;
    }

    bucket(bucketKey: string): Iterable<ObjectType> {
        return this.bucketMap.get(bucketKey) || [];
    }

    removeByKey(key: string): ObjectType | null {
        const object = this.objectMap.get(key);
        if (!object) return null;
        return this.remove(object);
    }

    getByKey(key: string): ObjectType | null {
        return this.objectMap.get(key) || null;
    }

    hasKey(key: string): boolean {
        return this.objectMap.has(key);
    }

    forEach(fn: (item: ObjectType) => boolean | void) {
        for (const value of this.items()) {
            if (fn(value)) {
                return true;
            }
        }

        return false;
    }

    map<MappedType>(fn: (item: ObjectType) => MappedType): MappedType[] {
        const res: MappedType[] = [];
        for (const value of this.items()) {
            res.push(fn(value));
        }
        return res;
    }
}
