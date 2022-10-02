import { World } from "..";
import Entity from "../entity";
import Trait from "../trait";
import { AnySerialized, EntitySerializer, TraitSerializer, WorldSerializer } from "./serializer";
interface MetaSerializedTrait extends AnySerialized {
    key: string;
    data: AnySerialized;
}
interface SerializedEntity {
    id: string;
    x: number;
    y: number;
    z: number;
    angle: number;
    traits: MetaSerializedTrait[];
}
interface SerializedWorld {
    entities: SerializedEntity[];
}
declare class JsonTraitsSerializer implements TraitSerializer<Trait, MetaSerializedTrait> {
    readonly serializers: Map<string, TraitSerializer<Trait, any>>;
    add(key: string, serializer: TraitSerializer<Trait, any>): this;
    serialize(value: Trait): MetaSerializedTrait;
    deserialize(value: MetaSerializedTrait): Trait;
}
declare class JsonEntitySerializer implements EntitySerializer<SerializedEntity> {
    private readonly traitsSerializer;
    constructor(traitsSerializer: JsonTraitsSerializer);
    serialize(value: Entity): SerializedEntity;
    deserialize(serialized: SerializedEntity): Entity;
}
declare class JsonWorldSerializer implements WorldSerializer<SerializedWorld> {
    private readonly entitySerializer;
    constructor(entitySerializer: JsonEntitySerializer);
    serialize(value: World): SerializedWorld;
    deserialize(serialized: SerializedWorld): World;
}
export declare type JsonSerializers = {
    'trait': JsonTraitsSerializer;
    'entity': JsonEntitySerializer;
    'world': JsonWorldSerializer;
};
export declare function jsonSerializers(): JsonSerializers;
export {};
