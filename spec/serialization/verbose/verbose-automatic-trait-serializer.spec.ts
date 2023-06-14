import { TraitSerializer } from '../../../src/serialization/serializer';
import { Trait, traitGetSet, TraitRegistry, PropertyType, PropertyConstraints, SerializationOptions } from "../../../src";
import VerboseAutomaticTraitSerializer from '../../../src/serialization/verbose/verbose-automatic-trait-serializer';

describe('the automatic trait serializer', () => {
    
    class TestTrait extends Trait {
        static readonly key: string = 'testtrait';
        readonly key: string = TestTrait.key;
        
        stringProp = 'hello';
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

        registry.add({
            traitType: TestTrait,
            properties: [
                traitGetSet(TestTrait, 'stringProp', PropertyType.str(), (trait) => trait.stringProp, (trait, stringProp) => trait.stringProp = stringProp),
                traitGetSet(TestTrait, 'stringArrayProp', PropertyType.list(PropertyType.str()), (trait) => trait.stringArrayProp, (trait, stringArrayProp) => trait.stringArrayProp = stringArrayProp),

                traitGetSet(TestTrait, 'entityIdProp', PropertyType.str(), (trait) => trait.entityIdProp, (trait, entityIdProp) => trait.entityIdProp = entityIdProp),
                traitGetSet(TestTrait, 'entityIdArrayProp', PropertyType.list(PropertyType.id()), (trait) => trait.entityIdArrayProp, (trait, entityIdArrayProp) => trait.entityIdArrayProp = entityIdArrayProp),

                traitGetSet(TestTrait, 'boolProp', PropertyType.bool(), (trait) => trait.boolProp, (trait, boolProp) => trait.boolProp = boolProp),
                traitGetSet(TestTrait, 'boolArrayProp', PropertyType.list(PropertyType.bool()), (trait) => trait.boolArrayProp, (trait, boolArrayProp) => trait.boolArrayProp = boolArrayProp),

                traitGetSet(TestTrait, 'numberProp', PropertyType.num(), (trait) => trait.numberProp, (trait, numberProp) => trait.numberProp = numberProp),
                traitGetSet(TestTrait, 'numberArrayProp', PropertyType.list(PropertyType.num()), (trait) => trait.numberArrayProp, (trait, numberArrayProp) => trait.numberArrayProp = numberArrayProp),

                traitGetSet(TestTrait, 'compositeProp', compositeType, (trait) => trait.compositeProp, (trait, compositeProp) => trait.compositeProp = compositeProp),
                traitGetSet(TestTrait, 'compositeArrayProp', PropertyType.list(compositeType), (trait) => trait.compositeArrayProp, (trait, compositeArrayProp) => trait.compositeArrayProp = compositeArrayProp),
            ],
        });

        const entry = registry.entry(TestTrait.key)!;
        serializer = new VerboseAutomaticTraitSerializer(entry);
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

    it('will not deserialize properties that weren\'t first serialized', () => {
        const defaultTrait = new TestTrait();

        const deserialized = serializer.deserialize({
            'stringProp': 'haha serialized string',
        }, new SerializationOptions());
        expect(deserialized.stringProp).toEqual('haha serialized string');

        expect(deserialized.boolProp).toEqual(defaultTrait.boolProp);
        expect(deserialized.boolArrayProp).toEqual(defaultTrait.boolArrayProp);
        expect(deserialized.stringArrayProp).toEqual(defaultTrait.stringArrayProp);
        expect(deserialized.numberProp).toEqual(defaultTrait.numberProp);
        expect(deserialized.numberArrayProp).toEqual(defaultTrait.numberArrayProp);
        expect(deserialized.entityIdProp).toEqual(defaultTrait.entityIdProp);
        expect(deserialized.entityIdArrayProp).toEqual(defaultTrait.entityIdArrayProp);
        expect(deserialized.compositeProp).toEqual(defaultTrait.compositeProp);
    });
});
