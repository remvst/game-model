import { CompositeConfigurable } from "@remvst/configurable";
import Entity from "../entity";
import GameModelApp from "../game-model-app";

export default function entityConfigurable(app: GameModelApp, entity: Entity) {
    const entityConfigurable = new CompositeConfigurable();

    for (const trait of entity.traits.items()) {
        const registryEntry = app.traitRegistry.entry(trait.key);
        const traitConfigurable = registryEntry.configurable(trait);
        entityConfigurable.add(trait.key, traitConfigurable);
    }

    return entityConfigurable;
}
