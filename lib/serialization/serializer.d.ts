import { Entity } from "..";
import Trait from "../trait";
import World from "../world";
export interface AnySerialized {
}
export interface Serializer<ObjectType, SerializedType> {
    serialize(value: ObjectType): SerializedType;
    deserialize(serialized: SerializedType): ObjectType;
}
export interface TraitSerializer<TraitType extends Trait, SerializedTrait> extends Serializer<TraitType, SerializedTrait> {
}
export interface EntitySerializer<SerializedEntity> extends Serializer<Entity, SerializedEntity> {
}
export interface WorldSerializer<SerializedWorld> extends Serializer<World, SerializedWorld> {
}
