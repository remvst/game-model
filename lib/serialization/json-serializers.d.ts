import { KeyProvider } from './../key-provider';
import Entity from "../entity";
import Trait from "../trait";
import World from "../world";
import CompositeSerializer from "./composite-serializer";
import { AnySerialized, EntitySerializer, TraitSerializer, WorldSerializer } from "./serializer";
import { WorldEvent } from '../events/world-event';
interface SerializedEntity {
    id: string;
    x: number;
    y: number;
    z: number;
    angle: number;
    traits: AnySerialized[];
}
interface SerializedWorld {
    entities: AnySerialized[];
}
declare class JsonEntitySerializer implements EntitySerializer<SerializedEntity> {
    private readonly traitsSerializer;
    constructor(traitsSerializer: TraitSerializer<Trait, AnySerialized>);
    serialize(value: Entity): SerializedEntity;
    deserialize(serialized: SerializedEntity): Entity;
}
declare class JsonWorldSerializer implements WorldSerializer<SerializedWorld> {
    private readonly entitySerializer;
    constructor(entitySerializer: EntitySerializer<AnySerialized>);
    serialize(value: World): SerializedWorld;
    deserialize(serialized: SerializedWorld): World;
}
export declare type JsonSerializers = {
    'trait': CompositeSerializer<Trait>;
    'entity': JsonEntitySerializer;
    'world': JsonWorldSerializer;
    'worldEvent': CompositeSerializer<WorldEvent & KeyProvider>;
};
export declare function jsonSerializers(): JsonSerializers;
export {};
