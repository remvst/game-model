import { Entity } from "../../src/entity";
import { MoveTo } from "../../src/events/move-to";
import { GameModelApp } from "../../src/game-model-app";
import { SerializationOptions } from "../../src/serialization/serialization-options";
import { World } from "../../src/world";

describe("move to event", () => {
    let app: GameModelApp;

    beforeEach(() => {
        app = new GameModelApp();
        app.worldEventRegistry.add(MoveTo.registryEntry());
        app.finalize();
    });

    it("can be applied", () => {
        const event = new MoveTo();
        event.entityId = "entityId";
        event.duration = 10;
        event.targetEntityId = "target";

        const world = new World();

        const entity = new Entity("entityId", []);
        entity.position.x = 123;
        entity.position.y = 456;
        world.entities.add(entity);

        const target = new Entity("target", []);
        target.position.x = 789;
        target.position.y = 1337;
        world.entities.add(target);

        world.addEvent(event);

        expect(entity.position.x).toBe(123);
        expect(entity.position.y).toBe(456);

        world.cycle(5);

        expect(entity.position.x).toBe((123 + 789) / 2);
        expect(entity.position.y).toBe((456 + 1337) / 2);

        world.cycle(5);

        expect(entity.position.x).toBe(789);
        expect(entity.position.y).toBe(1337);
    });

    it("can be serialized", () => {
        const event = new MoveTo();
        event.entityId = "ent";
        event.duration = 123;
        event.targetEntityId = "targ";

        const options = new SerializationOptions();
        const serialized = app.serializers.verbose.worldEvent.serialize(
            event,
            options,
        );
        const deserialized = app.serializers.verbose.worldEvent.deserialize(
            serialized,
            options,
        ) as unknown as MoveTo;

        expect(deserialized.entityId).toBe(event.entityId);
        expect(deserialized.duration).toBe(event.duration);
        expect(deserialized.targetEntityId).toBe(event.targetEntityId);
    });
});
