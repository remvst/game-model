import { Entity, EntitySerializer, SerializationOptions, SerializationType, World } from "../../../src";
import DualSupportWorldSerializer from "../../../src/serialization/dual/dual-support-world-serializer";
import { EncoderSequence } from "../../../src/serialization/encoder";
import { PackedWorldSerializer } from "../../../src/serialization/packed/packed-world-serializer";
import { VerboseWorldSerializer } from "../../../src/serialization/verbose/verbose-world-serializer";

describe('the dual support world serializer', () => {
    let entitySerializer: EntitySerializer<EncoderSequence>;
    let worldSetup: (world: World) => void;
    
    let serializationOptions: SerializationOptions;
    let packed: PackedWorldSerializer;
    let verbose: VerboseWorldSerializer;
    let serializer: DualSupportWorldSerializer;

    beforeEach(() => {
        entitySerializer = {
            'serialize': jasmine.createSpy().and.returnValue(['zeeentityserialized']),
            'deserialize': jasmine.createSpy(),
        };

        worldSetup = jasmine.createSpy();

        serializationOptions = new SerializationOptions();
        verbose = new VerboseWorldSerializer(entitySerializer, worldSetup);
        packed = new PackedWorldSerializer(entitySerializer, worldSetup);
        serializer = new DualSupportWorldSerializer(verbose, packed);
    });

    it('can serialize as packed', () => {
        const entity = new Entity(undefined, []);
        const world = new World();
        world.entities.add(entity);

        serializationOptions.type = SerializationType.PACKED;
        const serialized = serializer.serialize(world, serializationOptions);

        expect(serialized).toEqual(packed.serialize(world, serializationOptions));
    });

    it('can serialize as verbose', () => {
        const entity = new Entity(undefined, []);
        const world = new World();
        world.entities.add(entity);

        serializationOptions.type = SerializationType.VERBOSE;
        const serialized = serializer.serialize(world, serializationOptions);

        expect(serialized).toEqual(verbose.serialize(world, serializationOptions));
    });
});
