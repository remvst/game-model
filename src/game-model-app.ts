import { EntityProperties } from "./entity";
import { Property } from "./properties/properties";
import PropertyRegistry from "./registry/property-registry";
import TraitRegistry from "./registry/trait-registry";
import WorldEventRegistry from "./registry/world-event-registry";
import { jsonSerializers } from "./serialization/json-serializers";

export default class GameModelApp {
    readonly traitRegistry = new TraitRegistry();
    readonly worldEventRegistry = new WorldEventRegistry();
    readonly propertyRegistry = new PropertyRegistry<Property<any>>();
    readonly serializers = jsonSerializers();

    finalize() {
        for (const entityProperty of EntityProperties.all()) {
            this.propertyRegistry.add(entityProperty);
        }

        for (const key of this.traitRegistry.keys()) {
            const entry = this.traitRegistry.entry(key);
            if (entry.serializer) {
                this.serializers.trait.add(entry.key, entry.serializer(this));
            }

            for (const property of entry.properties || []) {
                this.propertyRegistry.add(property);
            }
        }
        for (const key of this.worldEventRegistry.keys()) {
            const entry = this.worldEventRegistry.entry(key);
            if (entry.serializer) {
                this.serializers.worldEvent.add(entry.key, entry.serializer(this));
            }
        }
    }
}
