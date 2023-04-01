import { Authority, AuthorityType, Entity, GameModelApp, LocalAuthority, Remove, World } from '../../src';
import WorldUpdatesHelper from '../../src/multiplayer/world-updates-helper';

describe('a helper', () => {
    let world: World;
    let app: GameModelApp;
    let helper: WorldUpdatesHelper;
    let authority: Authority;

    beforeEach(() => {
        app = new GameModelApp();
        app.addWorldEvent(Remove.registryEntry());

        authority = new LocalAuthority();
        world = new World();
        helper = new WorldUpdatesHelper(app, world, authority);
    });

    describe('local updates', () => {
        it('can generate an empty update', () => {
            spyOn(authority, 'entityAuthority').and.returnValue(AuthorityType.FULL);

            const update = helper.generateUpdate();
            expect(update).toEqual({
                'entities': [],
                'worldEvents': [],
            });
        });

        it('will queue events until the next update', () => {
            spyOn(authority, 'worldEventAuthority').and.returnValue(AuthorityType.FULL);

            const event = new Remove('myent');
            world.addEvent(event);

            const update = helper.generateUpdate();
            expect(update).toEqual({
                'entities': [],
                'worldEvents': [app.serializers.worldEvent.serialize(event)],
            });
        });

        it('will not queue events it has no authority over', () => {
            spyOn(authority, 'worldEventAuthority').and.returnValue(AuthorityType.NONE);

            world.addEvent(new Remove('myent'));

            expect(helper.generateUpdate()).toEqual({
                'entities': [],
                'worldEvents': [],
            });
        });

        it('will only send events once', () => {
            spyOn(authority, 'worldEventAuthority').and.returnValue(AuthorityType.FULL);

            const event = new Remove('myent');
            world.addEvent(event);

            helper.generateUpdate();
            const update = helper.generateUpdate();
            expect(update).toEqual({
                'entities': [],
                'worldEvents': [],
            });
        });

        it('will send entities that it has authority over', () => {
            spyOn(authority, 'entityAuthority').and.returnValue(AuthorityType.FULL)

            const localEntity = new Entity('myentity', []);
            world.entities.add(localEntity);

            const update = helper.generateUpdate();
            expect(update).toEqual({
                'entities': [app.serializers.entity.serialize(localEntity)],
                'worldEvents': [],
            });
        });

        it('will not send entities that it has no authority over', () => {
            spyOn(authority, 'entityAuthority').and.returnValue(AuthorityType.NONE)

            const localEntity = new Entity('myentity', []);
            world.entities.add(localEntity);

            const update = helper.generateUpdate();
            expect(update).toEqual({
                'entities': [],
                'worldEvents': [],
            });
        });
    });

    describe('remote updates', () => {
        it('will create remotely added entities', () => {
            const remoteAuthority: Authority = {
                entityAuthority: () => AuthorityType.FULL,
                worldEventAuthority: () => { throw new Error('Function not implemented.') },
            };
    
            helper.applyUpdate({
                worldEvents: [],
                entities: [app.serializers.entity.serialize(new Entity('myentity', []))],
            }, remoteAuthority);
    
            expect(world.entity('myentity')).toBeTruthy();
        });
    
        it('will copy remote entities if they already exist', () => {
            const remoteAuthority: Authority = {
                entityAuthority: () => AuthorityType.FULL,
                worldEventAuthority: () => { throw new Error('Function not implemented.') },
            };

            const localEntity = new Entity('myentity', []);
            spyOn(localEntity, 'copy');
            world.entities.add(localEntity);
    
            helper.applyUpdate({
                worldEvents: [],
                entities: [app.serializers.entity.serialize(new Entity('myentity', []))],
            }, remoteAuthority);
    
            expect(localEntity.copy).toHaveBeenCalledWith(jasmine.any(Entity), app);
        });
    
        it('will not copy entities from an authority that has none', () => {
            const remoteAuthority: Authority = {
                entityAuthority: () => AuthorityType.NONE,
                worldEventAuthority: () => { throw new Error('Function not implemented.') },
            };
    
            helper.applyUpdate({
                worldEvents: [],
                entities: [app.serializers.entity.serialize(new Entity('myentity', []))],
            }, remoteAuthority);
    
            expect(world.entities.size).toBe(0);
        });
    
        it('will not apply events from an authority that has none', () => {
            const remoteAuthority: Authority = {
                entityAuthority: () => { throw new Error('Function not implemented.') },
                worldEventAuthority: () => AuthorityType.NONE,
            };
    
            const eventSpy = jasmine.createSpy();
            world.events.subscribe(eventSpy);
    
            helper.applyUpdate({
                worldEvents: [app.serializers.worldEvent.serialize(new Remove('removedentity'))],
                entities: [],
            }, remoteAuthority);
    
            expect(eventSpy).not.toHaveBeenCalled();
        });
    
        it('will apply events from an authority that has full', () => {
            const remoteAuthority: Authority = {
                entityAuthority: () => { throw new Error('Function not implemented.') },
                worldEventAuthority: () => AuthorityType.FULL,
            };
    
            const eventSpy = jasmine.createSpy();
            world.events.subscribe(eventSpy);
    
            helper.applyUpdate({
                worldEvents: [app.serializers.worldEvent.serialize(new Remove('removedentity'))],
                entities: [],
            }, remoteAuthority);
    
            expect(eventSpy).toHaveBeenCalled();
        });
    });
});