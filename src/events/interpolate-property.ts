import { NumberConstraints } from '../properties/property-constraints';
import { EntityProperties } from './../entity';
import { CompositeConfigurable, NumberConfigurable } from "@remvst/configurable";
import { WorldEventSerializer } from "../serialization/serializer";
import World from "../world";
import { WorldEvent } from "./world-event";
import { WorldEventRegistryEntry } from "./world-event-registry";
import { Entity, EntityIdConfigurable, PropertyRegistry } from '..';
import { Property } from '../properties/properties';
import InterpolatorTrait from '../traits/interpolator-trait';
import { propertyValueConfigurable } from '../configurable/property-value-configurable';
import { anyProperty } from '../configurable/any-property-configurable';

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

    static registryEntry(propertyRegistry: PropertyRegistry<Property<any>>): WorldEventRegistryEntry<InterpolateProperty> {
        return {
            key: InterpolateProperty.key,
            category: 'movement',
            newEvent: () => new InterpolateProperty('', EntityProperties.x, 0, 1),
            serializer: () => new Serializer(propertyRegistry),
            configurable: (event, world) => {
                return new CompositeConfigurable()
                    .add('entityId', new EntityIdConfigurable({
                        world,
                        'read': () => event.entityId,
                        'write': (entityId) => event.entityId = entityId,
                    }))
                    .add('property', anyProperty({
                        'propertyRegistry': propertyRegistry,
                        'filter': (prop) => prop.type instanceof NumberConstraints,
                        'read': () => event.property,
                        'write': (property) => event.property = property,
                    }))
                    .add('value', propertyValueConfigurable(
                        world,
                        event.property.type,
                        () => event.value,
                        value => event.value = value,
                    ))
                    .add('duration', new NumberConfigurable({
                        'min': 0,
                        'max': 120,
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

export class Serializer implements WorldEventSerializer<InterpolateProperty, Serialized> {

    constructor(private readonly propertyRegistry: PropertyRegistry<Property<any>>) {
        
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
