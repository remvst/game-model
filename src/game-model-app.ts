import { EntityProperties } from "./entity";
import { Property } from "./properties/properties";
import PropertyRegistry from "./registry/property-registry";
import TraitRegistry from "./registry/trait-registry";
import WorldEventRegistry from "./registry/world-event-registry";
import { allSerializers } from "./serialization/all-serializers";
import DualSupportTraitSerializer from "./serialization/dual/dual-support-trait-serializer";
import DualSupportWorldEventSerializer from "./serialization/dual/dual-support-world-event-serializer";

export default class GameModelApp {
    readonly traitRegistry = new TraitRegistry();
    readonly worldEventRegistry = new WorldEventRegistry();
    readonly propertyRegistry = new PropertyRegistry<Property<any>>();
    readonly serializers = allSerializers();

    finalize() {
        for (const entityProperty of EntityProperties.all()) {
            this.propertyRegistry.add(entityProperty);
        }

        for (const key of this.traitRegistry.keys()) {
            const entry = this.traitRegistry.entry(key);
            if (entry.serializer) {
                const serializer = entry.serializer(this);
                if (serializer instanceof DualSupportTraitSerializer) {
                    this.serializers.packed.trait.add(
                        entry.key,
                        serializer.packed,
                    );
                    this.serializers.verbose.trait.add(
                        entry.key,
                        serializer.verbose,
                    );
                } else {
                    this.serializers.packed.trait.add(
                        entry.key,
                        serializer as any,
                    );
                    this.serializers.verbose.trait.add(entry.key, serializer);
                }
            }

            for (const property of entry.properties || []) {
                this.propertyRegistry.add(property);
            }
        }
        for (const key of this.worldEventRegistry.keys()) {
            const entry = this.worldEventRegistry.entry(key);
            if (entry.serializer) {
                const serializer = entry.serializer(this);
                if (serializer instanceof DualSupportWorldEventSerializer) {
                    this.serializers.packed.worldEvent.add(
                        entry.key,
                        serializer.packed,
                    );
                    this.serializers.verbose.worldEvent.add(
                        entry.key,
                        serializer.verbose,
                    );
                } else {
                    this.serializers.packed.worldEvent.add(
                        entry.key,
                        serializer as any,
                    );
                    this.serializers.verbose.worldEvent.add(
                        entry.key,
                        serializer,
                    );
                }
            }
        }
    }
}
