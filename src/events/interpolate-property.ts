import {
    CompositeConfigurable,
    NumberConfigurable,
} from "@remvst/configurable";
import { resolveIds } from "../adapt-id";
import { anyProperty } from "../configurable/any-property-configurable";
import { EntityIdConfigurable } from "../configurable/entity-id-configurable";
import { propertyValueConfigurable } from "../configurable/property-value-configurable";
import { GameModelApp } from "../game-model-app";
import { onlyRelevantProperties } from "../properties/only-relevant-properties";
import { Property, worldEventGetSet } from "../properties/properties";
import {
    NumberConstraints,
    PropertyType,
} from "../properties/property-constraints";
import { PropertyRegistry } from "../registry/property-registry";
import { WorldEventRegistryEntry } from "../registry/world-event-registry";
import { WorldEventSerializer } from "../serialization/serializer";
import { InterpolatorTrait } from "../traits/interpolator-trait";
import { World } from "../world";
import { Entity, EntityProperties } from "./../entity";
import { SetProperty } from "./set-property";
import { WorldEvent } from "./world-event";

export class InterpolateProperty implements WorldEvent {
    static readonly key = "interpolate-property";
    readonly key = InterpolateProperty.key;

    constructor(
        public entityId: string,
        public property: Property<number>,
        public value: number,
        public duration: number,
    ) {}

    apply(world: World) {
        for (const entity of resolveIds(this.entityId, null, world)) {
            // Remove any existing movers.
            // This might be limiting but helps prevent flickering when multiple movers are applied.
            for (const existingMover of world.entities.bucket(
                InterpolatorTrait.key,
            ) || []) {
                const existingMoverTrait =
                    existingMover.traitOfType(InterpolatorTrait);
                if (existingMoverTrait!.targetEntityId !== this.entityId) {
                    continue;
                }

                existingMover.remove();
            }

            const initialValue = this.property.get(entity);
            world.entities.add(
                new Entity(undefined, [
                    new InterpolatorTrait(
                        entity.id,
                        this.property,
                        initialValue!,
                        this.value,
                        this.duration,
                    ),
                ]),
            );
        }
    }

    static registryEntry(
        app: GameModelApp,
    ): WorldEventRegistryEntry<InterpolateProperty> {
        const { traitRegistry, propertyRegistry } = app;

        return {
            key: InterpolateProperty.key,
            category: "movement",
            newEvent: () =>
                new InterpolateProperty("", EntityProperties.x, 0, 1),
            serializer: () => new Serializer(propertyRegistry),
            configurable: (event, world) => {
                return new CompositeConfigurable()
                    .add(
                        "entityId",
                        new EntityIdConfigurable({
                            world,
                            read: () => event.entityId,
                            write: (entityId) => (event.entityId = entityId),
                        }),
                    )
                    .add(
                        "property",
                        anyProperty({
                            propertyRegistry: propertyRegistry,
                            filter: (prop) =>
                                prop.type instanceof NumberConstraints &&
                                onlyRelevantProperties(
                                    traitRegistry,
                                    world,
                                    () => event.entityId,
                                )(prop),
                            read: () => event.property,
                            write: (property) => (event.property = property),
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
                    )
                    .add(
                        "duration",
                        new NumberConfigurable({
                            min: 0,
                            max: 120,
                            step: 0.1,
                            read: () => event.duration,
                            write: (duration) => (event.duration = duration),
                        }),
                    );
            },
            properties: [
                worldEventGetSet(
                    SetProperty,
                    "entityId",
                    PropertyType.id(),
                    (event) => event.entityId,
                    (event, entityId) => (event.entityId = entityId),
                ),
            ],
        };
    }
}

interface Serialized {
    readonly entityId: string;
    readonly propertyIdentifier: string;
    readonly value: number;
    readonly duration: number;
}

class Serializer
    implements WorldEventSerializer<InterpolateProperty, Serialized>
{
    constructor(
        private readonly propertyRegistry: PropertyRegistry<Property<any>>,
    ) {}

    serialize(event: InterpolateProperty): Serialized {
        return {
            entityId: event.entityId,
            propertyIdentifier: event.property.identifier,
            value: event.value,
            duration: event.duration,
        };
    }

    deserialize(serialized: Serialized): InterpolateProperty {
        return new InterpolateProperty(
            serialized.entityId,
            this.propertyRegistry.entry(serialized.propertyIdentifier)!,
            serialized.value,
            serialized.duration,
        );
    }
}
