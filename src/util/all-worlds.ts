import { ExpansionTrait } from "../traits/expansion-trait";
import { World } from "../world";

export function* allWorlds(world: World): Iterable<World> {
    yield world;

    for (const expansionTrait of world.traitsOfType(ExpansionTrait)) {
        yield* allWorlds(expansionTrait.expansion);
    }
}
