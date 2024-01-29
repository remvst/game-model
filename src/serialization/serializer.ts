import Entity from "../entity";
import { WorldEvent } from "../events/world-event";
import Trait from "../trait";
import World from "../world";
import { WorldSetup } from "./all-serializers";
import SerializationOptions from "./serialization-options";

export interface AnySerialized {}

export interface Serializer<ObjectType, SerializedType> {
    serialize(value: ObjectType, options: SerializationOptions): SerializedType;
    deserialize(
        serialized: SerializedType,
        options: SerializationOptions,
        output?: ObjectType,
    ): ObjectType;
}

export interface TraitSerializer<
    TraitType extends Trait,
    SerializedTrait extends AnySerialized,
> extends Serializer<TraitType, SerializedTrait> {}
export interface EntitySerializer<SerializedEntity extends AnySerialized>
    extends Serializer<Entity, SerializedEntity> {
    getId(value: SerializedEntity, options: SerializationOptions): string;
}

export interface WorldSerializer<SerializedWorld extends AnySerialized>
    extends Serializer<World, SerializedWorld> {
    worldSetup: WorldSetup;
}
export interface WorldEventSerializer<
    WorldEventType extends WorldEvent,
    SerializedWorldEvent extends AnySerialized,
> extends Serializer<WorldEventType, SerializedWorldEvent> {}

export interface CompositeSerializer<ObjectType, SerializedType>
    extends Serializer<ObjectType, SerializedType> {
    add(key: string, serializer: Serializer<ObjectType, SerializedType>): this;
    getKey(value: SerializedType, options: SerializationOptions): string;
}

export interface Serializers<
    SerializedTrait,
    SerializedEntity,
    SerializedWorld,
    SerializedWorldEvent,
> {
    trait: CompositeSerializer<Trait, SerializedTrait>;
    entity: EntitySerializer<SerializedEntity>;
    world: WorldSerializer<SerializedWorld>;
    worldEvent: CompositeSerializer<WorldEvent, SerializedWorldEvent>;
}
