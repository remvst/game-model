import Entity, { EntityProperties } from "../../src/entity";
import InterpolateProperty from "../../src/events/interpolate-property";
import GameModelApp from "../../src/game-model-app";
import SerializationOptions from "../../src/serialization/serialization-options";
import World from "../../src/world";

describe("interpolate property event", () => {
    let app: GameModelApp;

    beforeEach(() => {
        app = new GameModelApp();
        app.worldEventRegistry.add(InterpolateProperty.registryEntry(app));
        app.finalize();
    });

    it("can be applied", () => {
        const event = new InterpolateProperty(
            "entityId",
            EntityProperties.x,
            1337,
            10,
        );

        const world = new World();

        const entity = new Entity("entityId", []);
        entity.position.x = 123;
        world.entities.add(entity);

        world.addEvent(event);
        expect(entity.position.x).toBe(123);

        world.cycle(5);
        expect(entity.position.x).toBe((123 + 1337) / 2);

        world.cycle(5);
        expect(entity.position.x).toBe(1337);
    });

    it("can be serialized", () => {
        const event = new InterpolateProperty(
            "entityId",
            EntityProperties.x,
            1337,
            10,
        );

        expect(event.entityId).toBe("entityId");
        expect(event.property).toBe(EntityProperties.x);
        expect(event.value).toBe(1337);
        expect(event.duration).toBe(10);

        const options = new SerializationOptions();
        const serialized = app.serializers.verbose.worldEvent.serialize(
            event,
            options,
        );
        const deserialized = app.serializers.verbose.worldEvent.deserialize(
            serialized,
            options,
        ) as unknown as InterpolateProperty;

        expect(deserialized.entityId).toBe(event.entityId);
        expect(deserialized.duration).toBe(event.duration);
        expect(deserialized.property).toBe(event.property);
        expect(deserialized.value).toBe(event.value);
    });
});
