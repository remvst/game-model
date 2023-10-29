import { Entity, GameModelApp, PropertyType, Trait, TraitRegistry, World, duplicateEntities, traitGetSet, traitRegistryEntry } from '../../src';

describe('duplicateEntities', () => {
    let world: World;
    let app: GameModelApp;

    class TestTrait extends Trait {
        static readonly key = 'test';
        readonly key = TestTrait.key;

        referencedId: string;
    }

    beforeEach(() => {
        world = new World();

        app = new GameModelApp();
        app.traitRegistry.add(traitRegistryEntry<TestTrait>(builder => {
            builder.traitClass(TestTrait);
            builder.property(
                'referencedId', 
                PropertyType.id(), 
                (trait) => trait.referencedId, 
                (trait, referencedId) => trait.referencedId = referencedId,
            );
        }));
        app.finalize();
    });

    it('will duplicate a lonely entity', () => {
        const entity1 = new Entity('ent1', [new TestTrait()]);
        entity1.traitOfType(TestTrait)!.referencedId = 'myref';

        const duplicated = duplicateEntities(
            [entity1],
            world,
            app.serializers.entity,
            app.traitRegistry,
        );
        expect(duplicated.length).toBe(1);
        expect(duplicated[0].traits.size).toBe(1);
        expect(duplicated[0].traitOfType(TestTrait)?.referencedId).toBe('myref');
    });

    it('will duplicate a lonely entity that is already in the target world', () => {
        const entity1 = new Entity('ent1', [new TestTrait()]);
        entity1.traitOfType(TestTrait)!.referencedId = 'myref';
        world.entities.add(entity1);

        const [copy] = duplicateEntities(
            [entity1],
            world,
            app.serializers.entity,
            app.traitRegistry,
        );
        expect(copy.id).not.toBe(entity1.id);
    });

    it('does not add entities to the world', () => {
        const entity1 = new Entity('ent1', [new TestTrait()]);
        entity1.traitOfType(TestTrait)!.referencedId = 'myref';

        const [copy] = duplicateEntities(
            [entity1],
            world,
            app.serializers.entity,
            app.traitRegistry,
        );
        expect(world.entity(copy.id)).toBeFalsy();
    });

    it('will duplicate entities with references', () => {
        const entity1 = new Entity('ent1', [new TestTrait()]);
        entity1.traitOfType(TestTrait)!.referencedId = 'ent2';
        world.entities.add(entity1);

        const entity2 = new Entity('ent2', [new TestTrait()]);
        entity2.traitOfType(TestTrait)!.referencedId = 'ent2';
        world.entities.add(entity2);

        const duplicated = duplicateEntities(
            [entity1, entity2],
            world,
            app.serializers.entity,
            app.traitRegistry,
        );
        expect(duplicated.length).toBe(2);

        const [copy1, copy2] = duplicated;

        expect(copy1.id).not.toBe('ent1');
        expect(copy2.id).not.toBe('ent2');

        expect(copy1.traitOfType(TestTrait)?.referencedId).toBe(copy2.id);
        expect(copy2.traitOfType(TestTrait)?.referencedId).toBe(copy2.id);
    });
});
