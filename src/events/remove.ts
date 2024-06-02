import { resolveIds } from "../adapt-id";
import { PropertyType } from "../properties/property-constraints";
import {
    WorldEventRegistryEntry,
    worldEventRegistryEntry,
} from "../registry/world-event-registry";
import { World } from "../world";
import { WorldEvent } from "./world-event";

export class Remove implements WorldEvent {
    static readonly key = "remove";
    readonly key = Remove.key;

    constructor(public entityId: string = "") {}

    apply(world: World) {
        for (const entity of resolveIds(this.entityId, null, world)) {
            entity.remove();
        }
    }

    static registryEntry(): WorldEventRegistryEntry<Remove> {
        return worldEventRegistryEntry((builder) => {
            builder.eventClass(Remove);
            builder.category("scripting");
            builder.simpleProp("entityId", PropertyType.id());
        });
    }
}
