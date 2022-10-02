import Entity from "../entity";
import { WorldEvent } from "../events/world-event";
import Trait from "../trait";
import World from "../world";
export interface AnySerialized {
}
export interface Serializer<ObjectType, SerializedType> {
    serialize(value: ObjectType): SerializedType;
    deserialize(serialized: SerializedType): ObjectType;
}
export interface TraitSerializer<TraitType extends Trait, SerializedTrait extends AnySerialized> extends Serializer<TraitType, SerializedTrait> {
}
export interface EntitySerializer<SerializedEntity extends AnySerialized> extends Serializer<Entity, SerializedEntity> {
}
export interface WorldSerializer<SerializedWorld extends AnySerialized> extends Serializer<World, SerializedWorld> {
}
export interface WorldEventSerializer<WorldEventType extends WorldEvent, SerializedWorldEvent extends AnySerialized> extends Serializer<WorldEventType, SerializedWorldEvent> {
}
