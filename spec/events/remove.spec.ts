import { GameModelApp, Remove, SerializationOptions } from "../../src";

describe('remove event', () => {
    let app: GameModelApp;

    beforeEach(() => {
        app = new GameModelApp();
        app.worldEventRegistry.add(Remove.registryEntry());
        app.finalize();
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