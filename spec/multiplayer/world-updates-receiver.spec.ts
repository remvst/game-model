import { Authority, AuthorityType, Entity, GameModelApp, LocalAuthority, Remove, World } from '../../src';
import WorldUpdatesReceiver from '../../src/multiplayer/world-updates-receiver';

describe('a helper', () => {
    let world: World;
    let app: GameModelApp;
    let helper: WorldUpdatesReceiver;
    let authority: Authority;

    beforeEach(() => {
        app = new GameModelApp();
        app.addWorldEvent(Remove.registryEntry());

        authority = new LocalAuthority();
        world = new World();
        helper = new WorldUpdatesReceiver(app, world, authority);
    });

    it('will create remotely added entities if it has no authority over them', () => {
        spyOn(authority, 'entityAuthority').and.returnValue(AuthorityType.NONE);

        helper.applyUpdate({
            worldEvents: [],
            entities: [app.serializers.entity.serialize(new Entity('myentity', []))],
        });

        expect(world.entity('myentity')).toBeTruthy();
    });

    it('will copy remote entities if it has no authority over them if they already exist', () => {
        spyOn(authority, 'entityAuthority').and.returnValue(AuthorityType.NONE);

        const localEntity = new Entity('myentity', []);
        spyOn(localEntity, 'copy');
        world.entities.add(localEntity);

        helper.applyUpdate({
            worldEvents: [],
            entities: [app.serializers.entity.serialize(new Entity('myentity', []))],
        });

        expect(localEntity.copy).toHaveBeenCalledWith(jasmine.any(Entity), app);
    });

    it('will remove entities that were previously received but aren\'t anymore', () => {
        spyOn(authority, 'entityAuthority').and.returnValue(AuthorityType.NONE);

        const localEntity = new Entity('myentity', []);
        spyOn(localEntity, 'copy');
        world.entities.add(localEntity);

        helper.applyUpdate({
            worldEvents: [],
            entities: [app.serializers.entity.serialize(new Entity('myentity', []))],
        });
        expect(world.entities.size).toBe(1);

        helper.applyUpdate({
            worldEvents: [],
            entities: [],
        });
        expect(world.entities.size).toBe(0);
    });

    it('will not copy entities if it has authority over them', () => {
        spyOn(authority, 'entityAuthority').and.returnValue(AuthorityType.FULL);

        helper.applyUpdate({
            worldEvents: [],
            entities: [app.serializers.entity.serialize(new Entity('myentity', []))],
        });

        expect(world.entities.size).toBe(0);
    });

    it('will not apply events if it has authority over them', () => {
        spyOn(authority, 'worldEventAuthority').and.returnValue(AuthorityType.FULL);

        const eventSpy = jasmine.createSpy();
        world.events.subscribe(eventSpy);

        helper.applyUpdate({
            worldEvents: [app.serializers.worldEvent.serialize(new Remove('removedentity'))],
            entities: [],
        });

        expect(eventSpy).not.toHaveBeenCalled();
    });

    it('will apply events if it has no authority over them', () => {
        spyOn(authority, 'worldEventAuthority').and.returnValue(AuthorityType.NONE);

        const eventSpy = jasmine.createSpy();
        world.events.subscribe(eventSpy);

        helper.applyUpdate({
            worldEvents: [app.serializers.worldEvent.serialize(new Remove('removedentity'))],
            entities: [],
        });

        expect(eventSpy).toHaveBeenCalled();
    });
});