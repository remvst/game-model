import { WorldEvent } from "../events/world-event";
import { GameModelApp } from "../game-model-app";
import { Trait } from "../trait";
import { Weapon } from "../weapon/weapon";
import { TraitRegistryEntry } from "./trait-registry";
import { WeaponRegistryEntry } from "./weapon-registry";
import { AnyWorldEventRegistryEntry } from "./world-event-registry";

export interface TraitRegistryEntryProvider<T extends Trait> {
    registryEntry(app: GameModelApp): TraitRegistryEntry<T>;
}

export interface WorldEventRegistryEntryProvider<T extends WorldEvent> {
    registryEntry(app: GameModelApp): AnyWorldEventRegistryEntry<T>;
}

export interface WeaponRegistryEntryProvider {
    registryEntry(app: GameModelApp): WeaponRegistryEntry<Weapon>;
}
