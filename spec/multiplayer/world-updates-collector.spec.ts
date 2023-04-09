import { Authority, AuthorityType, Entity, GameModelApp, LocalAuthority, Remove, World } from '../../src';
import WorldUpdatesCollector from '../../src/multiplayer/world-updates-collector';

describe('a helper', () => {
    let world: World;
    let app: GameModelApp;
    let helper: WorldUpdatesCollector;
    let authority: Authority;

    beforeEach(() => {
        app = new GameModelApp();
        app.addWorldEvent(Remove.registryEntry());

        authority = new LocalAuthority();
        world = new World();
        helper = new WorldUpdatesCollector(app, world, authority);
    });

    it('can generate an empty update', () => {
        spyOn(authority, 'entityAuthority').and.returnValue(AuthorityType.FULL);

        const update = helper.generateUpdate();
        expect(update).toEqual({
            'entities': [],
            'worldEvents': [],
            'shortEntities': [],
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
            'shortEntities': [],
        });
    });

    it('will not queue events it has no authority over', () => {
        spyOn(authority, 'worldEventAuthority').and.returnValue(AuthorityType.NONE);

        world.addEvent(new Remove('myent'));

        expect(helper.generateUpdate()).toEqual({
            'entities': [],
            'worldEvents': [],
            'shortEntities': [],
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
            'shortEntities': [],
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
            'shortEntities': [],
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
            'shortEntities': [],
        });
    });
});