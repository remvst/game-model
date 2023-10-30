import { GameModelApp, MoveTo, SerializationOptions } from "../../src";

describe('move to event', () => {
    let app: GameModelApp;

    beforeEach(() => {
        app = new GameModelApp();
        app.worldEventRegistry.add(MoveTo.registryEntry());
        app.finalize();
    });

    it('can be serialized', () => {
        const event = new MoveTo();
        event.entityId = 'ent';
        event.duration = 123;
        event.targetEntityId = 'targ';

        const options = new SerializationOptions();
        const serialized = app.serializers.worldEvent.serialize(event, options);
        const deserialized = app.serializers.worldEvent.deserialize(serialized, options) as unknown as MoveTo;

        expect(deserialized.entityId).toBe(event.entityId);
        expect(deserialized.duration).toBe(event.duration);
        expect(deserialized.targetEntityId).toBe(event.targetEntityId);
    });
});