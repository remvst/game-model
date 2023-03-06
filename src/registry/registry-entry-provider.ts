import { WorldEvent } from "../events/world-event";
import GameModelApp from "../game-model-app";
import Trait from "../trait";
import { AnyRegistryEntry } from "./trait-registry";
import { AnyWorldEventRegistryEntry } from "./world-event-registry";

export interface RegistryEntryProvider<T extends Trait> {
    registryEntry(app: GameModelApp): AnyRegistryEntry<T>;
}

export interface WorldEventRegistryEntryProvider<T extends WorldEvent> {
    registryEntry(app: GameModelApp): AnyWorldEventRegistryEntry<T>;
}
