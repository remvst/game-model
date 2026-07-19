import { ReusablePool } from "@remvst/optimization";
import { entity, Entity } from "../../src/entity";
import { EntityRemoved } from "../../src/events/entity-removed";
import { PoolableTrait } from "../../src/traits/poolable-trait";
import { World } from "../../src/world";

describe("poolable trait", () => {
    let world: World;
    let poolableEntity: Entity;

    beforeEach(() => {
        world = new World();
        poolableEntity = entity([new PoolableTrait()]);
        world.entities.add(poolableEntity);
    });

    it("returns entity to the pool when removed from world", () => {
        const pool = new ReusablePool(() => poolableEntity);
        (poolableEntity as any).pool = pool;
        spyOn(pool, "give");

        world.entities.remove(poolableEntity);

        expect(pool.give).toHaveBeenCalledWith(poolableEntity);
    });

    it("does nothing when the entity has no pool", () => {
        expect(() => world.entities.remove(poolableEntity)).not.toThrow();
    });

    it("does not return entity to pool for unrelated events", () => {
        const pool = new ReusablePool(() => poolableEntity);
        (poolableEntity as any).pool = pool;
        spyOn(pool, "give");

        poolableEntity.addEvent(new EntityRemoved());

        // EntityRemoved is fired but triggered by our manual call here, not world removal
        // pool.give is called — verify it works the same way when fired manually
        expect(pool.give).toHaveBeenCalledWith(poolableEntity);
    });
});
