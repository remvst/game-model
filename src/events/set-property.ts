import { Property, PropertyType } from '../properties';
import World from '../world';
import { WorldEvent } from './world-event';
import { WorldEventSerializer } from '../serialization/serializer';
import { WorldEventRegistryEntry } from './world-event-registry';
import { EntityProperties } from '../entity';
import { BooleanConfigurable, CompositeConfigurable, Configurable, EnumConfigurable, NumberConfigurable, StringConfigurable } from '@remvst/configurable';
import PropertyRegistry from '../property-registry';

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
            configurable: (event: SetProperty) => {
                const property = new EnumConfigurable<Property<any>>({
                    'read': () => event.property,
                    'write': (property) => event.property = property,
                });

                for (const identifier of propertyRegistry.keys()) {
                    property.add(identifier, propertyRegistry.property(identifier)!);
                }

                let valueConfigurable: Configurable;
                switch (event.property.type) {
                case PropertyType.BOOLEAN:
                    valueConfigurable = new BooleanConfigurable({
                        'read': () => !!event.value,
                        'write': (value) => event.value = value,
                    });
                    break;
                case PropertyType.STRING:
                    valueConfigurable = new StringConfigurable({
                        'read': () => event.value.toString(),
                        'write': (value) => event.value = value,
                    });
                    break;
                case PropertyType.NUMBER:
                    valueConfigurable = new NumberConfigurable({
                        'read': () => parseFloat(event.value),
                        'write': (value) => event.value = value,
                    });
                    break;
                }

                return new CompositeConfigurable()
                    .add('entityId', new StringConfigurable({
                        'read': () => event.entityId,
                        'write': (entityId) => event.entityId = entityId,
                    }))
                    .add('property', property)
                    .add('value', valueConfigurable);
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
