import { EntityProperties } from './../entity';
import { vector3, Vector3 } from './../vector3';
import { CompositeConfigurable, EnumConfigurable, NumberConfigurable } from "@remvst/configurable";
import { WorldEventSerializer } from "../serialization/serializer";
import World from "../world";
import { WorldEvent } from "./world-event";
import { WorldEventRegistryEntry } from "./world-event-registry";
import { Entity, EntityIdConfigurable, PropertyRegistry } from '..';
import { Property } from '../properties';
import InterpolatorTrait from '../traits/interpolator-trait';
import { anyProperty } from '../configurable-utils';

export default class InterpolateProperty implements WorldEvent {
    static readonly key = 'interpolate-property';
    readonly key = InterpolateProperty.key;

    constructor(
        public entityId: string,
        public property: Property<number>,
        public value: number,
        public duration: number,
    ) {
    }

    apply(world: World) {
        const entity = world.entity(this.entityId);
        if (!entity) {
            return;
        }

        // Remove any existing movers. 
        // This might be limiting but helps prevent flickering when multiple movers are applied.
        for (const existingMover of world.entities.bucket(InterpolatorTrait.key)) {
            const existingMoverTrait = existingMover.traitOfType(InterpolatorTrait);
            if (existingMoverTrait!.targetEntityId !== this.entityId) {
                continue;
            }

            existingMover.remove();
        }

        let initialValue: number;
        if (this.entityId) {
            const entity = world.entity(this.entityId);
            if (entity) {
                initialValue = this.property.get(entity);
            } else {
                return;
            }
        }

        world.entities.add(new Entity(undefined, [
            new InterpolatorTrait(
                this.entityId,
                this.property,
                initialValue!,
                this.value,
                this.duration,
            ),
        ]))
    }

    static registryEntry(propertyRegistry: PropertyRegistry): WorldEventRegistryEntry<InterpolateProperty> {
        return {
            key: InterpolateProperty.key,
            category: 'movement',
            newEvent: () => new InterpolateProperty('', EntityProperties.x, 0, 1),
            serializer: () => new MoveSerializer(propertyRegistry),
            configurable: (event, world) => {
                const property = new EnumConfigurable<Property<any>>({
                    'read': () => event.property,
                    'write': (property, configurable) => {
                        event.property = property;
                        configurable.invalidate();
                    },
                });

                for (const identifier of propertyRegistry.keys()) {
                    const split = identifier.split('.');
                    const category = split.length > 0 ? split[0] : '';

                    property.category(category).add(identifier, propertyRegistry.property(identifier)!);
                }

                return new CompositeConfigurable()
                    .add('entityId', new EntityIdConfigurable({
                        world,
                        'read': () => event.entityId,
                        'write': (entityId) => event.entityId = entityId,
                    }))
                    .add('property', anyProperty({
                        'propertyRegistry': propertyRegistry,
                        'read': () => event.property,
                        'write': (property) => event.property = property,
                    }))
                    .add('duration', new NumberConfigurable({
                        'min': 0,
                        'max': 200,
                        'step': 0.1,
                        'read': () => event.duration,
                        'write': duration => event.duration = duration,
                    }));
            },
        }
    }
}

interface Serialized {
    readonly entityId: string,
    readonly propertyIdentifier: string,
    readonly value: number,
    readonly duration: number,
}

export class MoveSerializer implements WorldEventSerializer<InterpolateProperty, Serialized> {

    constructor(private readonly propertyRegistry: PropertyRegistry) {
        
    }

    serialize(event: InterpolateProperty): Serialized {
        return {
            'entityId': event.entityId,
            'propertyIdentifier': event.property.identifier,
            'value': event.value,
            'duration': event.duration,
        };
    }

    deserialize(serialized: Serialized): InterpolateProperty {
        return new InterpolateProperty(
            serialized.entityId, 
            this.propertyRegistry.property(serialized.propertyIdentifier)!, 
            serialized.value, 
            serialized.duration,
        );
    }
}
