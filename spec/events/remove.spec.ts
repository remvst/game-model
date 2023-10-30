import { Entity, GameModelApp, Remove, SerializationOptions, World } from "../../src";

describe('remove event', () => {
    let app: GameModelApp;

    beforeEach(() => {
        app = new GameModelApp();
        app.worldEventRegistry.add(Remove.registryEntry());
        app.finalize();
    });

    it('can be applied', () => {
        const event = new Remove('entityId');
        const world = new World();
        const entity = new Entity('entityId', []);
        world.entities.add(entity);

        world.addEvent(event);

        expect(entity.world).toBe(null);
    });

    it('can be serialized', () => {
        const event = new Remove();
        event.entityId = 'ent';
        const options = new SerializationOptions();
        const serialized = app.serializers.worldEvent.serialize(event, options);
        const deserialized = app.serializers.worldEvent.deserialize(serialized, options) as Remove;

        expect(deserialized.entityId).toBe(event.entityId);
    });
});