import { WorldEvent } from "../../events/world-event";
import {
    BooleanConstraints,
    ColorConstraints,
    CompositeConstraints,
    EntityIdConstraints,
    EnumConstraints,
    JsonConstraints,
    ListConstraints,
    NumberConstraints,
    PropertyConstraints,
    StringConstraints,
} from "../../properties/property-constraints";
import { WorldEventRegistryEntry } from "../../registry/world-event-registry";
import { WorldEventSerializer } from "../serializer";

interface Serialized {
    [key: string]: any;
}

export default class VerboseAutomaticWorldEventSerializer<T extends WorldEvent>
    implements WorldEventSerializer<T, Serialized>
{
    constructor(private readonly registryEntry: WorldEventRegistryEntry<T>) {}

    serialize(event: WorldEvent): Serialized {
        const serialized: Serialized = {};
        for (const property of this.registryEntry.properties!) {
            const serializedProperty = this.serializePropertyValue(
                property.type,
                property.get(event),
            );
            serialized[property.localIdentifier!] = serializedProperty;
        }
        return serialized;
    }

    deserialize(serialized: Serialized): T {
        const event = this.registryEntry.newEvent!();
        for (const property of this.registryEntry.properties!) {
            const propertyValue = this.deserializePropertyValue(
                property.type,
                serialized[property.localIdentifier!],
            );
            property.set(event, propertyValue);
        }
        return event;
    }

    private serializePropertyValue(
        type: PropertyConstraints<any>,
        value: any,
    ): any {
        if (type instanceof ListConstraints) {
            return (value as any[]).map((item) =>
                this.serializePropertyValue(type.itemType, item),
            );
        }

        if (type instanceof CompositeConstraints) {
            const res: any = {};
            for (const [key, subType] of type.properties.entries()) {
                res[key] = this.serializePropertyValue(subType, value[key]);
            }
            return res;
        }

        if (
            type instanceof NumberConstraints ||
            type instanceof StringConstraints ||
            type instanceof BooleanConstraints ||
            type instanceof ColorConstraints ||
            type instanceof EntityIdConstraints ||
            type instanceof EnumConstraints
        ) {
            return value;
        }

        if (type instanceof JsonConstraints) {
            return JSON.stringify(value);
        }

        throw new Error(`Unknown property type: ${type}`);
    }

    private deserializePropertyValue(
        type: PropertyConstraints<any>,
        serializedProperty: any,
    ): any {
        if (type instanceof ListConstraints) {
            return (serializedProperty as any[]).map((item) =>
                this.deserializePropertyValue(type.itemType, item),
            );
        }

        if (type instanceof CompositeConstraints) {
            const res: any = {};
            for (const [key, subType] of type.properties.entries()) {
                res[key] = this.deserializePropertyValue(
                    subType,
                    serializedProperty[key],
                );
            }
            return res;
        }

        if (
            type instanceof NumberConstraints ||
            type instanceof StringConstraints ||
            type instanceof BooleanConstraints ||
            type instanceof ColorConstraints ||
            type instanceof EntityIdConstraints ||
            type instanceof EnumConstraints
        ) {
            return serializedProperty;
        }

        if (type instanceof JsonConstraints) {
            return JSON.parse(serializedProperty);
        }

        throw new Error(`Unknown property type: ${type}`);
    }
}
