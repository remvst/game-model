import { KeyProvider } from './../key-provider';
import Entity from "../entity";
import Trait from "../trait";
import World from "../world";
import CompositeSerializer from "./composite-serializer";
import { AnySerialized, EntitySerializer, TraitSerializer, WorldSerializer } from "./serializer";
import { WorldEvent } from '../events/world-event';
export interface JsonSerializedEntity {
    id: string;
    x: number;
    y: number;
    z: number;
    angle: number;
    traits: AnySerialized[];
}
export interface JsonSerializedWorld {
    entities: AnySerialized[];
}
declare class JsonEntitySerializer implements EntitySerializer<JsonSerializedEntity> {
    private readonly traitsSerializer;
    constructor(traitsSerializer: TraitSerializer<Trait, AnySerialized>);
    serialize(value: Entity): JsonSerializedEntity;
    deserialize(serialized: JsonSerializedEntity): Entity;
}
declare class JsonWorldSerializer implements WorldSerializer<JsonSerializedWorld> {
    private readonly entitySerializer;
    constructor(entitySerializer: EntitySerializer<AnySerialized>);
    serialize(value: World): JsonSerializedWorld;
    deserialize(serialized: JsonSerializedWorld): World;
}
export declare type JsonSerializers = {
    'trait': CompositeSerializer<Trait>;
    'entity': JsonEntitySerializer;
    'world': JsonWorldSerializer;
    'worldEvent': CompositeSerializer<WorldEvent & KeyProvider>;
};
export declare function jsonSerializers(): JsonSerializers;
export {};
