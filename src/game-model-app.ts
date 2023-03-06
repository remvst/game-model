import TraitRegistry, { AnyRegistryEntry } from "./registry/trait-registry";
import WorldEventRegistry, { AnyWorldEventRegistryEntry } from "./registry/world-event-registry";
import { jsonSerializers } from "./serialization/json-serializers";

export default class GameModelApp {
    readonly traitRegistry = new TraitRegistry();
    readonly worldEventRegistry = new WorldEventRegistry();
    readonly serializers = jsonSerializers();

    addTrait(entry: AnyRegistryEntry<any>) {
        const actualEntry = this.traitRegistry.add(entry);

        if (actualEntry.serializer) {
            this.serializers.trait.add(actualEntry.key, actualEntry.serializer(actualEntry));
        }
    }

    addWorldEvent(entry: AnyWorldEventRegistryEntry<any>) {
        const actualEntry = this.worldEventRegistry.add(entry);

        if (actualEntry.serializer) {
            this.serializers.worldEvent.add(actualEntry.key, actualEntry.serializer(actualEntry));
        }
    }
}
