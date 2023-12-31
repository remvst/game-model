import { Entity, EntityIdMapping, World } from "../../src";

describe("EntityIdMapping", () => {
    let world: World;

    beforeEach(() => {
        world = new World();
    });

    it("will return the same IDs if they're not in the destination world", () => {
        const mapping = new EntityIdMapping(world, ["myid1", "myid2"]);

        expect(mapping.destinationId("myid1")).toBe("myid1");
        expect(mapping.destinationId("myid2")).toBe("myid2");
    });

    it("will return new IDs to avoid conflicts", () => {
        world.entities.add(new Entity("firstentity", []));
        world.entities.add(new Entity("firstentity1", []));
        world.entities.add(new Entity("secondentity", []));

        const mapping = new EntityIdMapping(world, [
            "firstentity",
            "secondentity",
            "thirdentity",
        ]);

        expect(mapping.destinationId("firstentity")).toBe("firstentity2");
        expect(mapping.destinationId("secondentity")).toBe("secondentity1");
        expect(mapping.destinationId("thirdentity")).toBe("thirdentity");
    });
});
