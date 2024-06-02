import { WorldEvent } from "../events/world-event";
import { KeyProvider } from "../key-provider";
import { Trait } from "../trait";
import { World } from "../world";
import { DualSupportCompositeSerializer } from "./dual/dual-support-composite-serializer";
import { DualSupportEntitySerializer } from "./dual/dual-support-entity-serializer";
import { DualSupportWorldSerializer } from "./dual/dual-support-world-serializer";
import { EncoderSequence } from "./encoder";
import { PackedCompositeSerializer } from "./packed/packed-composite-serializer";
import { PackedEntitySerializer } from "./packed/packed-entity-serializer";
import { PackedWorldSerializer } from "./packed/packed-world-serializer";
import { AnySerialized, Serializers } from "./serializer";
import { VerboseSerializedTrait } from "./verbose/verbose-automatic-trait-serializer";
import { VerboseCompositeSerializer } from "./verbose/verbose-composite-serializer";
import {
    VerboseEntitySerializer,
    VerboseSerializedEntity,
} from "./verbose/verbose-entity-serializer";
import {
    VerboseSerializedWorld,
    VerboseWorldSerializer,
} from "./verbose/verbose-world-serializer";

export interface AllSerializers {
    packed: Serializers<
        EncoderSequence,
        EncoderSequence,
        EncoderSequence,
        EncoderSequence
    >;
    verbose: Serializers<
        VerboseSerializedTrait,
        VerboseSerializedEntity,
        VerboseSerializedWorld,
        AnySerialized
    >;
    dual: Serializers<
        VerboseSerializedTrait | EncoderSequence,
        VerboseSerializedEntity | EncoderSequence,
        VerboseSerializedWorld | EncoderSequence,
        AnySerialized | EncoderSequence
    >;
}

export type WorldSetup = (world: World) => void;

export function allSerializers(): AllSerializers {
    const packedWorldEvent = new PackedCompositeSerializer<
        WorldEvent & KeyProvider
    >();
    const verboseWorldEvent = new VerboseCompositeSerializer<
        WorldEvent & KeyProvider,
        AnySerialized
    >();

    const packedTrait = new PackedCompositeSerializer<Trait>();
    const verboseTrait = new VerboseCompositeSerializer<Trait, AnySerialized>();

    const packedEntity = new PackedEntitySerializer(packedTrait);
    const verboseEntity = new VerboseEntitySerializer(verboseTrait);

    const packedWorld = new PackedWorldSerializer(packedEntity);
    const verboseWorld = new VerboseWorldSerializer(verboseEntity);

    return {
        packed: {
            trait: packedTrait,
            entity: packedEntity,
            world: packedWorld,
            worldEvent: packedWorldEvent,
        },

        verbose: {
            trait: verboseTrait,
            entity: verboseEntity,
            world: verboseWorld,
            worldEvent: verboseWorldEvent,
        },

        dual: {
            world: new DualSupportWorldSerializer(verboseWorld, packedWorld),
            entity: new DualSupportEntitySerializer(
                verboseEntity,
                packedEntity,
            ),
            trait: new DualSupportCompositeSerializer(
                verboseTrait,
                packedTrait,
            ),
            worldEvent: new DualSupportCompositeSerializer(
                verboseWorldEvent,
                packedWorldEvent,
            ),
        },
    };
}
