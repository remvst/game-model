import { Vector2 } from "@remvst/geometry";
import { entity } from "../../src/entity";
import { repositionEntities } from "../../src/util/reposition-entities";

describe("repositionEntities", () => {
    it("will reposition a single entity", () => {
        const entity1 = entity();
        entity1.position.x = 123;
        entity1.position.y = 456;

        repositionEntities([entity1], new Vector2(456, 123), 1);

        expect(entity1.position.x).toBe(456);
        expect(entity1.position.y).toBe(123);
    });

    it("will reposition two entities", () => {
        const entity1 = entity();
        entity1.position.x = 0;
        entity1.position.y = 100;

        const entity2 = entity();
        entity2.position.x = 100;
        entity2.position.y = 200;

        repositionEntities([entity1, entity2], new Vector2(400, 400), 1);

        expect(entity1.position.x).toBe(350);
        expect(entity1.position.y).toBe(350);

        expect(entity2.position.x).toBe(450);
        expect(entity2.position.y).toBe(450);
    });
});
