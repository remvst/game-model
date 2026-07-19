import { Trait } from "@remvst/game-model";
import { Vector2Like } from "@remvst/geometry";
import { SpawnType } from "./spawn-trait";

export interface SpawnExtra {
    [key: string]: any;
}

export type SpawnFunc = (extra: SpawnExtra, position: Vector2Like) => Trait[];

export class SpawnMapTrait extends Trait {
    static readonly key = "spawn-map";
    readonly key = SpawnMapTrait.key;

    private readonly spawnMap = new Map<SpawnType, SpawnFunc>();

    define(spawnType: SpawnType, traits: SpawnFunc): this {
        this.spawnMap.set(spawnType, traits);
        return this;
    }

    traitsFor(
        spawnType: SpawnType,
        extra: SpawnExtra,
        position: Vector2Like,
    ): Trait[] {
        const func = this.spawnMap.get(spawnType);
        if (!func) {
            throw new Error(`No definition for spawn type ${spawnType}`);
        }
        return func(extra, position);
    }
}
