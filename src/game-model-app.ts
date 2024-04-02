import { EntityProperties } from "./entity";
import { Property } from "./properties/properties";
import PropertyRegistry from "./registry/property-registry";
import TraitRegistry from "./registry/trait-registry";
import WorldEventRegistry from "./registry/world-event-registry";
import { allSerializers } from "./serialization/all-serializers";
import DualSupportTraitSerializer from "./serialization/dual/dual-support-trait-serializer";
import DualSupportWorldEventSerializer from "./serialization/dual/dual-support-world-event-serializer";
import { hashString } from "./util/hash-string";

export default class GameModelApp {
    readonly traitRegistry = new TraitRegistry();
    readonly worldEventRegistry = new WorldEventRegistry();
    readonly propertyRegistry = new PropertyRegistry<Property<any>>();
    readonly serializers = allSerializers();

    hash: number = 0;

    finalize() {
        const hashStrings = [];

        for (const entityProperty of EntityProperties.all()) {
            this.propertyRegistry.add(entityProperty);

            hashStrings.push(entityProperty.identifier);
        }

        for (const key of Array.from(this.traitRegistry.keys()).sort()) {
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

            hashStrings.push(key);

            for (const property of entry.properties || []) {
                this.propertyRegistry.add(property);
                hashStrings.push(property.identifier);
            }
        }

        for (const key of Array.from(this.worldEventRegistry.keys()).sort()) {
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

            hashStrings.push(entry.key);

            for (const property of entry.properties || []) {
                hashStrings.push(property.identifier);
            }
        }

        this.hash = hashString(hashStrings.join(""));
    }
}
