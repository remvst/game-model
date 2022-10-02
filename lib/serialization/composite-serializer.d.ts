import { KeyProvider } from "../key-provider";
import { AnySerialized, Serializer } from "./serializer";
export interface CompositeSerializerMeta {
    key: string;
    data: AnySerialized;
}
export default class CompositeSerializer<ObjectType extends KeyProvider> implements Serializer<ObjectType, CompositeSerializerMeta> {
    readonly serializers: Map<string, Serializer<ObjectType, AnySerialized>>;
    add<SubObjectType extends ObjectType, SerializedType extends AnySerialized>(key: string, serializer: Serializer<SubObjectType, SerializedType>): this;
    serialize(value: ObjectType): CompositeSerializerMeta;
    deserialize(value: CompositeSerializerMeta): ObjectType;
}
