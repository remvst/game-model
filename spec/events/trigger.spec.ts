import { Entity, GameModelApp, Trigger, SerializationOptions, World, TriggerEvent } from "../../src";

describe('move to event', () => {
    let app: GameModelApp;

    beforeEach(() => {
        app = new GameModelApp();
        app.worldEventRegistry.add(Trigger.registryEntry());
        app.finalize();
    });

    it('can be applied', () => {
        const event = new Trigger();
        event.entityId = 'entityId';
        event.triggererId = 'triggererId';

        const world = new World();

        const entity = new Entity('entityId', []);
        entity.position.x = 123;
        entity.position.y = 456;
        world.entities.add(entity);

        spyOn(entity, 'addEvent').and.callThrough();

        world.addEvent(event);

        expect(entity.addEvent).toHaveBeenCalled();

        const entityEvent = (entity.addEvent as jasmine.Spy).calls.argsFor(0)[0];
        expect(entityEvent).toBeInstanceOf(TriggerEvent);
        expect((entityEvent as TriggerEvent).triggererId).toBe('triggererId');
    });

    it('can be serialized', () => {
        const event = new Trigger();
        event.entityId = 'ent';
        event.triggererId = 'triggererid'

        const options = new SerializationOptions();
        const serialized = app.serializers.worldEvent.serialize(event, options);
        const deserialized = app.serializers.worldEvent.deserialize(serialized, options) as unknown as Trigger;

        expect(deserialized.entityId).toBe(event.entityId);
        expect(deserialized.triggererId).toBe(event.triggererId);
    });
});