import { ObjectSet } from "../../src/collections/object-set";
import { WatchableObjectSet } from "../../src/collections/watchable-object-set";

type ObjectType = {
    key: string;
    value: number;
    buckets: string[];
};

describe("a watchable keyed object set", () => {
    let objectSet: WatchableObjectSet<ObjectType>;

    const obj1: ObjectType = { key: "123", value: 2, buckets: ["bucket1"] };
    const obj2: ObjectType = {
        key: "456",
        value: 3,
        buckets: ["bucket1", "bucket2"],
    };
    const obj3: ObjectType = { key: "789", value: 4, buckets: ["bucket2"] };

    beforeEach(() => {
        objectSet = new WatchableObjectSet(
            new ObjectSet(
                (obj) => obj.key,
                (obj) => obj.buckets,
            ),
        );
    });

    it("does not fire addition/removal until an addition actually happens", () => {
        objectSet.add(obj1);
        objectSet.remove(obj2);

        const spy = jasmine.createSpy();
        objectSet.additions.subscribe(spy);
        objectSet.removals.subscribe(spy);

        expect(spy).not.toHaveBeenCalled();
    });

    it("fires addition when adding an element", () => {
        const spy = jasmine.createSpy();
        objectSet.additions.subscribe(spy);

        expect(objectSet.size).toBe(0);

        objectSet.add(obj1);

        expect(spy).toHaveBeenCalledWith(obj1);
        expect(objectSet.size).toBe(1);
        expect(objectSet.hasKey("123")).toBe(true);
        expect(objectSet.getByKey("123")).toBe(obj1);
    });

    it("does not fire addition when adding an element twice", () => {
        const spy = jasmine.createSpy();
        objectSet.additions.subscribe(spy);

        objectSet.add(obj1);
        objectSet.add(obj1);

        expect(spy).toHaveBeenCalledWith(obj1);
        expect(spy.calls.count()).toBe(1);
    });

    it("fires removal when removing an element", () => {
        const spy = jasmine.createSpy();
        objectSet.additions.subscribe(spy);

        objectSet.add(obj1);
        objectSet.remove(obj1);

        expect(spy).toHaveBeenCalledWith(obj1);
    });

    it("fires removal when removing an element by key", () => {
        const spy = jasmine.createSpy();
        objectSet.removals.subscribe(spy);

        objectSet.add(obj1);
        objectSet.removeByKey("123");

        expect(spy).toHaveBeenCalledWith(obj1);
    });

    it("does not fire removal when removing an element twice", () => {
        const spy = jasmine.createSpy();
        objectSet.removals.subscribe(spy);

        objectSet.add(obj1);
        objectSet.remove(obj1);
        objectSet.remove(obj1);

        expect(spy).toHaveBeenCalledWith(obj1);
        expect(spy.calls.count()).toBe(1);
    });

    it("does not fire removal when removing an element by key that does not exist", () => {
        const spy = jasmine.createSpy();
        objectSet.removals.subscribe(spy);

        objectSet.removeByKey("123");

        expect(spy).not.toHaveBeenCalled();
    });

    it("forwards forEach", () => {
        objectSet.add(obj1);
        objectSet.add(obj2);
        objectSet.add(obj3);

        const spy = jasmine.createSpy().and.callFake((obj) => obj.value === 3);

        objectSet.forEach(spy);

        expect(spy).toHaveBeenCalledWith(obj1);
        expect(spy).toHaveBeenCalledWith(obj2);
        expect(spy).not.toHaveBeenCalledWith(obj3);
    });

    it("forwards bucketSize", () => {
        expect(objectSet.bucketSize("bucket1")).toBe(0);
        expect(objectSet.bucketSize("bucket2")).toBe(0);

        objectSet.add(obj1);
        expect(objectSet.bucketSize("bucket1")).toBe(1);
        expect(objectSet.bucketSize("bucket2")).toBe(0);

        objectSet.add(obj2);
        expect(objectSet.bucketSize("bucket1")).toBe(2);
        expect(objectSet.bucketSize("bucket2")).toBe(1);

        objectSet.add(obj3);
        expect(objectSet.bucketSize("bucket1")).toBe(2);
        expect(objectSet.bucketSize("bucket2")).toBe(2);
    });
});
