import { TraitSerializer } from '../../../src/serialization/serializer';
import { Trait, TraitRegistry, PropertyType, PropertyConstraints, traitRegistryEntry } from "../../../src";
import SerializationOptions from '../../../src/serialization/serialization-options';
import PackedAutomaticTraitSerializer from '../../../src/serialization/packed/packed-automatic-trait-serializer';

describe('the packed trait serializer', () => {
    
    class TestTrait extends Trait {
        static readonly key: string = 'testtrait';
        readonly key: string = TestTrait.key;
        
        stringProp: string | null = 'hello';
        stringArrayProp = ['hello', 'world'];

        entityIdProp = 'zee-id';
        entityIdArrayProp = ['zee', 'id'];

        numberProp = 123;
        numberArrayProp = [456, 789];

        boolProp = false;
        boolArrayProp = [false, true];

        compositeProp = {'id': 'someid', 'delay': 123};
        compositeArrayProp = [{'id': 'someid', 'delay': 123}];
    }

    let registry: TraitRegistry;
    let serializer: TraitSerializer<TestTrait, any>;

    beforeEach(() => {
        registry = new TraitRegistry();

        const compositeType = PropertyType.composite(new Map<string, PropertyConstraints<any>>([
            ['id', PropertyType.id()],
            ['delay', PropertyType.num()],
        ]));

        registry.add(traitRegistryEntry<TestTrait>(builder => {
            builder.traitClass(TestTrait);

            builder.property('stringProp', PropertyType.str(), (trait) => trait.stringProp, (trait, stringProp) => trait.stringProp = stringProp);
            builder.property('stringArrayProp', PropertyType.list(PropertyType.str()), (trait) => trait.stringArrayProp, (trait, stringArrayProp) => trait.stringArrayProp = stringArrayProp);

            builder.property('entityIdProp', PropertyType.str(), (trait) => trait.entityIdProp, (trait, entityIdProp) => trait.entityIdProp = entityIdProp);
            builder.property('entityIdArrayProp', PropertyType.list(PropertyType.id()), (trait) => trait.entityIdArrayProp, (trait, entityIdArrayProp) => trait.entityIdArrayProp = entityIdArrayProp);

            builder.property('boolProp', PropertyType.bool(), (trait) => trait.boolProp, (trait, boolProp) => trait.boolProp = boolProp);
            builder.property('boolArrayProp', PropertyType.list(PropertyType.bool()), (trait) => trait.boolArrayProp, (trait, boolArrayProp) => trait.boolArrayProp = boolArrayProp);

            builder.property('numberProp', PropertyType.num(), (trait) => trait.numberProp, (trait, numberProp) => trait.numberProp = numberProp);
            builder.property('numberArrayProp', PropertyType.list(PropertyType.num()), (trait) => trait.numberArrayProp, (trait, numberArrayProp) => trait.numberArrayProp = numberArrayProp);

            builder.property('compositeProp', compositeType, (trait) => trait.compositeProp, (trait, compositeProp) => trait.compositeProp = compositeProp);
            builder.property('compositeArrayProp', PropertyType.list(compositeType), (trait) => trait.compositeArrayProp, (trait, compositeArrayProp) => trait.compositeArrayProp = compositeArrayProp);
        }));

        const entry = registry.entry(TestTrait.key)!;
        serializer = new PackedAutomaticTraitSerializer(entry);
    });

    it('can serialize then deserialize', () => {
        const trait = new TestTrait();
        expect(() => serializer.serialize(trait, new SerializationOptions())).not.toThrow();
    });

    it('can serialize then deserialize and the properties will be accurate', () => {
        const trait = new TestTrait();
        trait.stringProp = 'yoyo'
        trait.stringArrayProp = ['general', 'kenobi'];

        trait.entityIdProp = 'zee entity id';
        trait.entityIdArrayProp = ['zee', 'entity', 'id'];

        trait.numberProp = 12313124;
        trait.numberArrayProp = [1233, 456];

        trait.boolProp = false;
        trait.boolArrayProp = [true, false, true, false];

        trait.compositeProp = {'id': 'ha', 'delay': 1000};
        trait.compositeArrayProp = [{'id': 'ha', 'delay': 1000}, {'id': 'ha', 'delay': 1000}];

        const serialized = serializer.serialize(trait, new SerializationOptions());
        const deserialized = serializer.deserialize(serialized, new SerializationOptions());

        expect(deserialized.stringProp).toEqual(trait.stringProp);
        expect(deserialized.stringArrayProp).toEqual(trait.stringArrayProp);
        expect(deserialized.numberProp).toEqual(trait.numberProp);
        expect(deserialized.numberArrayProp).toEqual(trait.numberArrayProp);
        expect(deserialized.boolProp).toEqual(trait.boolProp);
        expect(deserialized.boolArrayProp).toEqual(trait.boolArrayProp);
        expect(deserialized.entityIdProp).toEqual(trait.entityIdProp);
        expect(deserialized.entityIdArrayProp).toEqual(trait.entityIdArrayProp);
        expect(deserialized.compositeProp).toEqual(trait.compositeProp);
    });

    it('will work with nullables', () => {
        const trait = new TestTrait();
        trait.stringProp = null;

        const serialized = serializer.serialize(trait, new SerializationOptions());
        const deserialized = serializer.deserialize(serialized, new SerializationOptions());

        expect(deserialized.stringProp).toBe(trait.stringProp);
    });
});
