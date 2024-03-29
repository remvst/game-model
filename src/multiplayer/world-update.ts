import { AnySerialized } from "../serialization/serializer";

export interface WorldUpdate<
    SerializedEntity extends AnySerialized,
    SerializedWorldEvent extends AnySerialized,
> {
    worldEvents?: SerializedWorldEvent[];
    entities?: SerializedEntity[];
    shortEntities?: string[];
    pins?: string[];
    unpins?: string[];
}
