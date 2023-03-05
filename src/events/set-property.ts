import { Property } from '../properties';
import World from '../world';
import { WorldEvent } from './world-event';
import { WorldEventSerializer } from '../serialization/serializer';
import { WorldEventRegistryEntry } from './world-event-registry';
import { EntityProperties } from '../entity';
import { CompositeConfigurable, EnumConfigurable, StringConfigurable } from '@remvst/configurable';
import PropertyRegistry from '../property-registry';
import { propertyValueConfigurable } from '../configurable-utils';

export default class SetProperty implements WorldEvent {

    static readonly key = 'set-property';
    readonly key = SetProperty.key;

    constructor(
        public entityId: string,
        public property: Property<any>,
        public value: any,
    ) {

    }

    apply(world: World): void {
        const entity = world.entity(this.entityId);
        if (!entity) {
            return;
        }

        this.property.set(entity, this.value);
    }

    static registryEntry(propertyRegistry: PropertyRegistry): WorldEventRegistryEntry<SetProperty> {
        return {
            key: SetProperty.key,
            category: 'scripting',
            newEvent: () => new SetProperty('', EntityProperties.x, 0),
            serializer: () => new Serializer(propertyRegistry),
            configurable: (event: SetProperty, world: World) => {
                const property = new EnumConfigurable<Property<any>>({
                    'read': () => event.property,
                    'write': (property, configurable) => {
                        event.property = property;
                        configurable.invalidate();
                    },
                });

                for (const identifier of propertyRegistry.keys()) {
                    property.add(identifier, propertyRegistry.property(identifier)!);
                }

                return new CompositeConfigurable()
                    .add('entityId', new StringConfigurable({
                        'read': () => event.entityId,
                        'write': (entityId) => event.entityId = entityId,
                    }))
                    .add('property', property)
                    .add('value', propertyValueConfigurable(
                        world,
                        event.property, 
                        () => event.value, 
                        (value) => event.value = value
                    ));
            },
        };
    }
}

interface Serialized {
    readonly entityId: string,
    readonly propertyIdentifier: string,
    readonly value: any,
}

class Serializer implements WorldEventSerializer<SetProperty, Serialized> {

    constructor(private readonly propertyRegistry: PropertyRegistry) {
        
    }

    serialize(event: SetProperty): Serialized {
        return {
            'entityId': event.entityId,
            'propertyIdentifier': event.property.identifier,
            'value': event.value,
        }
    }

    deserialize(serialized: Serialized): SetProperty {
        return new SetProperty(
            serialized.entityId,
            this.propertyRegistry.property(serialized.propertyIdentifier)!,
            serialized.value,
        );
    }
}
