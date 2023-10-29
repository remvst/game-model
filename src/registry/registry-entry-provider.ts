import { WorldEvent } from "../events/world-event";
import GameModelApp from "../game-model-app";
import Trait from "../trait";
import { AnyTraitRegistryEntry } from "./trait-registry";
import { AnyWorldEventRegistryEntry } from "./world-event-registry";

export interface TraitRegistryEntryProvider<T extends Trait> {
    registryEntry(app: GameModelApp): AnyTraitRegistryEntry<T>;
}

export interface WorldEventRegistryEntryProvider<T extends WorldEvent> {
    registryEntry(app: GameModelApp): AnyWorldEventRegistryEntry<T>;
}
