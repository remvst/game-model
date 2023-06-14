import { KeyProvider } from './../key-provider';
import Trait from "../trait";
import World from "../world";
import { CompositeSerializer, EntitySerializer, Serializers, WorldSerializer } from "./serializer";
import { WorldEvent } from '../events/world-event';
import { VerboseWorldSerializer } from './verbose/verbose-world-serializer';
import VerboseEntitySerializer from './verbose/verbose-entity-serializer';
import VerboseCompositeSerializer from './verbose/verbose-composite-serializer';
import { PackedWorldSerializer } from './packed/packed-world-serializer';
import PackedEntitySerializer from './packed/packed-entity-serializer';
import PackedCompositeSerializer from './packed/packed-composite-serializer';
import DualSupportEntitySerializer from './dual/dual-support-entity-serializer';
import DualSupportCompositeSerializer from './dual/dual-support-composite-serializer';
import DualSupportWorldSerializer from './dual/dual-support-world-serializer';

export interface JsonSerializers extends Serializers {
    trait: CompositeSerializer<Trait, any>;
    entity: EntitySerializer<any>;
    world: WorldSerializer<any>;
    worldEvent: CompositeSerializer<WorldEvent & KeyProvider, any>;
};

export type WorldSetup = (world: World) => void;

export function jsonSerializers(opts?: {
    worldSetup?: WorldSetup,
}): JsonSerializers {
    const worldEvent = new VerboseCompositeSerializer<WorldEvent & KeyProvider>();

    const trait = new DualSupportCompositeSerializer<Trait>(
        new VerboseCompositeSerializer<Trait>(),
        new PackedCompositeSerializer<Trait>(),
    );

    const entity = new DualSupportEntitySerializer(
        new VerboseEntitySerializer(trait),
        new PackedEntitySerializer(trait),
    );

    const world = new DualSupportWorldSerializer(
        new VerboseWorldSerializer(entity, opts?.worldSetup || (() => {})),
        new PackedWorldSerializer(entity, opts?.worldSetup || (() => {})),
    )

    return { trait, entity, world, worldEvent };
}
