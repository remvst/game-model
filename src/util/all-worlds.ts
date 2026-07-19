import { ExpansionTrait, World } from "@remvst/game-model";

export function* allWorlds(world: World): Iterable<World> {
    yield world;

    for (const expansionTrait of world.traitsOfType(ExpansionTrait)) {
        yield* allWorlds(expansionTrait.expansion);
    }
}
