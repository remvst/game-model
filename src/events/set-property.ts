import { CompositeConfigurable, EnumConfigurable } from "@remvst/configurable";
import { resolveIds } from "../adapt-id";
import { anyProperty } from "../configurable/any-property-configurable";
import EntityIdConfigurable from "../configurable/entity-id-configurable";
import { propertyValueConfigurable } from "../configurable/property-value-configurable";
import { EntityProperties } from "../entity";
import GameModelApp from "../game-model-app";
import { onlyRelevantProperties } from "../properties/only-relevant-properties";
import { Property } from "../properties/properties";
import PropertyRegistry from "../registry/property-registry";
import {
    WorldEventRegistryEntry,
    worldEventRegistryEntry,
} from "../registry/world-event-registry";
import { WorldEventSerializer } from "../serialization/serializer";
import World from "../world";
import { PropertyType } from "./../properties/property-constraints";
import { WorldEvent } from "./world-event";

export default class SetProperty implements WorldEvent {
    static readonly key = "set-property";
    readonly key = SetProperty.key;

    constructor(
        public entityId: string,
        public property: Property<any>,
        public value: any,
    ) {}

    apply(world: World): void {
        for (const entity of resolveIds(this.entityId, null, world)) {
            try {
                this.property.set(entity, this.value);
            } catch (e) {
                console.warn(
                    `Unable to set ${this.property.identifier} on entity ${entity.id}`,
                );
            }
        }
    }

    static registryEntry(
        app: GameModelApp,
    ): WorldEventRegistryEntry<SetProperty> {
        const { traitRegistry, propertyRegistry } = app;

        return worldEventRegistryEntry((builder) => {
            builder.key(SetProperty.key);
            builder.newEvent(() => new SetProperty("", EntityProperties.x, 0));
            builder.serializer(() => new Serializer(app.propertyRegistry));
            builder.simpleProp("entityId", PropertyType.id());
            builder.configurable(
                (app: GameModelApp, event: SetProperty, world: World) => {
                    const property = new EnumConfigurable<Property<any>>({
                        read: () => event.property,
                        write: (property, configurable) => {
                            event.property = property;
                            configurable.invalidate();
                        },
                    });

                    for (const identifier of propertyRegistry.keys()) {
                        const split = identifier.split(".");
                        const category = split.length > 0 ? split[0] : "";

                        property
                            .category(category)
                            .add(
                                identifier,
                                propertyRegistry.entry(identifier)!,
                            );
                    }

                    return new CompositeConfigurable()
                        .add(
                            "entityId",
                            new EntityIdConfigurable({
                                world,
                                read: () => event.entityId,
                                write: (entityId, configurable) => {
                                    event.entityId = entityId;
                                    configurable.invalidate();
                                },
                            }),
                        )
                        .add(
                            "property",
                            anyProperty({
                                propertyRegistry: propertyRegistry,
                                filter: onlyRelevantProperties(
                                    traitRegistry,
                                    world,
                                    () => event.entityId,
                                ),
                                read: () => event.property,
                                write: (property, configurable) => {
                                    event.property = property;

                                    // Make sure we still have the correct value type
                                    event.value = property.type.convert(
                                        event.value,
                                    );

                                    configurable.invalidate();
                                },
                            }),
                        )
                        .add(
                            "value",
                            propertyValueConfigurable(
                                world,
                                event.property.type,
                                () => event.value,
                                (value) => (event.value = value),
                            ),
                        );
                },
            );
        });
    }
}

interface Serialized {
    readonly entityId: string;
    readonly propertyIdentifier: string;
    readonly value: any;
}

class Serializer implements WorldEventSerializer<SetProperty, Serialized> {
    constructor(
        private readonly propertyRegistry: PropertyRegistry<Property<any>>,
    ) {}

    serialize(event: SetProperty): Serialized {
        return {
            entityId: event.entityId,
            propertyIdentifier: event.property.identifier,
            value: event.value,
        };
    }

    deserialize(serialized: Serialized): SetProperty {
        return new SetProperty(
            serialized.entityId,
            this.propertyRegistry.entry(serialized.propertyIdentifier)!,
            serialized.value,
        );
    }
}
