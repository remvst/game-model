import { Entity, World, firstAvailableId } from "../../src";

describe("firstAvailableId", () => {
    let world: World;

    beforeEach(() => {
        world = new World();
    });

    it("will return the same ID if there is not conflict", () => {
        expect(firstAvailableId(world, "myid")).toBe("myid");
    });

    it("will return a new ID if there is a conflict", () => {
        world.entities.add(new Entity("myid", []));
        expect(firstAvailableId(world, "myid")).toBe("myid1");
    });

    it("will return a new ID with an increment if there is a conflict", () => {
        world.entities.add(new Entity("myid2", []));
        expect(firstAvailableId(world, "myid2")).toBe("myid3");
    });

    it("will return a new ID if there are multiple conflicts", () => {
        world.entities.add(new Entity("myid", []));
        world.entities.add(new Entity("myid1", []));
        world.entities.add(new Entity("myid2", []));
        expect(firstAvailableId(world, "myid")).toBe("myid3");
    });

    it("will be smart enough with numbers", () => {
        world.entities.add(new Entity("myid", []));
        world.entities.add(new Entity("myid1", []));
        world.entities.add(new Entity("myid2", []));
        expect(firstAvailableId(world, "myid1")).toBe("myid3");
        expect(firstAvailableId(world, "myid2")).toBe("myid3");
        expect(firstAvailableId(world, "myid3")).toBe("myid3");
    });
});
