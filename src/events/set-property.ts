import { EntityIdConstraints, PropertyType } from './../properties/property-constraints';
import adaptId from '../adapt-id';
import { EntityIdConfigurable, PropertyRegistry } from '..';
import { Property, worldEventGetSet } from '../properties/properties';
import World from '../world';
import { WorldEvent } from './world-event';
import { WorldEventSerializer } from '../serialization/serializer';
import { WorldEventRegistryEntry } from '../registry/world-event-registry';
import { EntityProperties } from '../entity';
import { CompositeConfigurable, EnumConfigurable } from '@remvst/configurable';
import { propertyValueConfigurable } from '../configurable/property-value-configurable';
import { anyProperty } from '../configurable/any-property-configurable';
import { onlyRelevantProperties } from '../properties/only-relevant-properties';
import GameModelApp from '../game-model-app';

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

    static registryEntry(app: GameModelApp): WorldEventRegistryEntry<SetProperty> {
        const { traitRegistry } = app;
        const { properties } = traitRegistry;

        return {
            key: SetProperty.key,
            category: 'scripting',
            newEvent: () => new SetProperty('', EntityProperties.x, 0),
            serializer: () => new Serializer(properties),
            readjust: (event, entity, triggererId) => {
                if (event.property.type instanceof EntityIdConstraints) {
                    event.value = adaptId(event.value, triggererId, entity.world);
                }
            },
            configurable: (event: SetProperty, world: World) => {
                const property = new EnumConfigurable<Property<any>>({
                    'read': () => event.property,
                    'write': (property, configurable) => {
                        event.property = property;
                        configurable.invalidate();
                    },
                });

                for (const identifier of properties.keys()) {
                    const split = identifier.split('.');
                    const category = split.length > 0 ? split[0] : '';

                    property.category(category).add(identifier, properties.property(identifier)!);
                }

                return new CompositeConfigurable()
                    .add('entityId', new EntityIdConfigurable({
                        world,
                        'read': () => event.entityId,
                        'write': (entityId, configurable) => {
                            event.entityId = entityId;
                            configurable.invalidate();
                        },
                    }))
                    .add('property', anyProperty({
                        'propertyRegistry': properties,
                        'filter': onlyRelevantProperties(traitRegistry, world, () => event.entityId),
                        'read': () => event.property,
                        'write': (property, configurable) => {
                            event.property = property;

                            // Make sure we still have the correct value type
                            event.value = property.type.convert(event.value);

                            configurable.invalidate();
                        },
                    }))
                    .add('value', propertyValueConfigurable(
                        world,
                        event.property.type, 
                        () => event.value, 
                        (value) => event.value = value
                    ));
            },
            properties: [
                worldEventGetSet(SetProperty, 'entityId', PropertyType.id(), event => event.entityId, (event, entityId) => event.entityId = entityId),
            ],
        };
    }
}

interface Serialized {
    readonly entityId: string,
    readonly propertyIdentifier: string,
    readonly value: any,
}

class Serializer implements WorldEventSerializer<SetProperty, Serialized> {

    constructor(private readonly propertyRegistry: PropertyRegistry<Property<any>>) {
        
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
