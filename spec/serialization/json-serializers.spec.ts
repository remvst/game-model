import { TraitSerializer } from './../../src/serialization/serializer';
import { JsonSerializers, jsonSerializers } from './../../src/serialization/json-serializers';
import Trait from "../../src/trait";
import World from '../../src/world';
import Entity from '../../src/entity';

describe('JSON serializers', () => {
    
    class TestTrait1 extends Trait {
        static readonly key: string = 'testtrait1';
        readonly key: string = TestTrait1.key;
        constructor(readonly prop: string) {
            super();
        }
    }

    class TestTrait1Serializer implements TraitSerializer<TestTrait1, {prop: string}> {
        serialize(value: TestTrait1): {prop: string} {
            return {prop: value.prop};
        }
        deserialize(serialized: {prop: string}): TestTrait1 {
            return new TestTrait1(serialized.prop);
        }
    }

    class TestTrait2 extends Trait {
        readonly key: string = 'testtrait2';
    }

    let serializers: JsonSerializers;

    beforeEach(() => {
        serializers = jsonSerializers();

        serializers.trait
            .add(TestTrait1.key, new TestTrait1Serializer());
    });

    it('can serialize an empty world', () => {
        const world = new World();
        const serialized = serializers.world.serialize(world);
        const deserialized = serializers.world.deserialize(serialized);

        expect(deserialized.entities.size).toBe(0);
    });

    it('can serialize a world with an entity', () => {
        const entity = new Entity('ent', []);
        
        const world = new World();
        world.entities.add(entity);

        const serialized = serializers.world.serialize(world);
        const deserialized = serializers.world.deserialize(serialized);

        expect(deserialized.entities.size).toBe(1);
        expect(Array.from(deserialized.entities.items())[0].id).toBe(entity.id);
    });

    it('can serialize a world with an entity with a trait', () => {
        const entity = new Entity('ent', [
            new TestTrait1('myprop'),
        ]);
        
        const world = new World();
        world.entities.add(entity);

        const serialized = serializers.world.serialize(world);
        const deserialized = serializers.world.deserialize(serialized);

        expect(deserialized.entities.size).toBe(1);

        const deserializedEntity = Array.from(deserialized.entities.items())[0];
        const traits = Array.from(deserializedEntity.traits.items());

        expect(deserializedEntity.id).toBe(entity.id);
        expect(deserializedEntity.traits.size).toBe(1);
        expect(traits.length).toBe(1);
        expect((traits[0] as TestTrait1).prop).toBe('myprop');
    });

    it('will skip entities with non-serializable traits', () => {
        const entity = new Entity('ent', [
            new TestTrait1('myprop'),
            new TestTrait2(),
        ]);
        
        const world = new World();
        world.entities.add(entity);

        const serialized = serializers.world.serialize(world);
        const deserialized = serializers.world.deserialize(serialized);

        expect(deserialized.entities.size).toBe(0);
    });
});
