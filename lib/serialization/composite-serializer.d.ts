import { KeyProvider } from "../key-provider";
import { AnySerialized, Serializer } from "./serializer";
export interface CompositeSerializerMeta {
    key: string;
    data: AnySerialized;
}
export default class CompositeSerializer<ObjectType extends KeyProvider> implements Serializer<ObjectType, CompositeSerializerMeta> {
    readonly serializers: Map<string, Serializer<ObjectType, AnySerialized>>;
    add(key: string, serializer: Serializer<ObjectType, AnySerialized>): this;
    serialize(value: ObjectType): CompositeSerializerMeta;
    deserialize(value: CompositeSerializerMeta): ObjectType;
}
