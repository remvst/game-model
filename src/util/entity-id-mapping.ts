import { World } from "../world";
import { worldContainsId } from "./first-available-id";

export class EntityIdMapping {
    private readonly sourceToDestinationId = new Map<string, string>();

    constructor(world: World, sourceEntityIds: string[]) {
        for (const sourceId of sourceEntityIds) {
            if (!world.entity(sourceId)) {
                this.sourceToDestinationId.set(sourceId, sourceId);
                continue;
            }

            let suffix = 1;
            while (
                worldContainsId(world, sourceId + suffix) ||
                this.sourceToDestinationId.has(sourceId + suffix)
            ) {
                suffix++;
            }
            this.sourceToDestinationId.set(sourceId, sourceId + suffix);
        }
    }

    destinationId(sourceId: string): string {
        return this.sourceToDestinationId.get(sourceId);
    }
}
