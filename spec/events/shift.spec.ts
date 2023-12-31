import {
    Entity,
    GameModelApp,
    SerializationOptions,
    Shift,
    World,
    vector3,
} from "../../src";

describe("shift event", () => {
    let app: GameModelApp;

    beforeEach(() => {
        app = new GameModelApp();
        app.worldEventRegistry.add(Shift.registryEntry());
        app.finalize();
    });

    it("can be applied", () => {
        const event = new Shift();
        event.entityId = "entityId";
        event.duration = 10;
        event.translation = vector3(1, 2);

        const world = new World();
        const entity = new Entity("entityId", []);
        entity.position.x = 123;
        entity.position.y = 456;
        world.entities.add(entity);

        world.addEvent(event);

        expect(entity.position.x).toBe(123);
        expect(entity.position.y).toBe(456);

        world.cycle(5);

        expect(entity.position.x).toBe(123 + 1 / 2);
        expect(entity.position.y).toBe(456 + 2 / 2);

        world.cycle(5);

        expect(entity.position.x).toBe(123 + 1);
        expect(entity.position.y).toBe(456 + 2);
    });

    it("can be serialized", () => {
        const event = new Shift();
        event.entityId = "ent";
        event.duration = 123;
        event.translation = vector3(1, 2);

        const options = new SerializationOptions();
        const serialized = app.serializers.verbose.worldEvent.serialize(
            event,
            options,
        );
        const deserialized = app.serializers.verbose.worldEvent.deserialize(
            serialized,
            options,
        ) as unknown as Shift;

        expect(deserialized.entityId).toBe(event.entityId);
        expect(deserialized.duration).toBe(event.duration);
        expect(deserialized.translation.x).toEqual(event.translation.x);
        expect(deserialized.translation.y).toEqual(event.translation.y);
    });
});
