import GameModelApp from "../game-model-app";
import { CompositeSerializerMeta } from "../serialization/composite-serializer";
import { JsonSerializedEntity } from "../serialization/json-serializers";
import World from "../world";
import { Authority, AuthorityType } from "./authority";
import { WorldUpdate } from "./world-update";

const ALWAYS_TRUE = () => true;

export default class WorldUpdatesReceiver {

    private previousEntityIds = new Map<string, Set<string>>();

    constructor(
        private readonly app: GameModelApp,
        private readonly world: World,
        private readonly authority: Authority,
    ) {
    }

    applyUpdate(
        update: WorldUpdate<JsonSerializedEntity, CompositeSerializerMeta>, 
        fromPlayerId: string,
    ) {
        const missingIds = this.previousEntityIds.get(fromPlayerId) || new Set();
        const newPreviousEntityIds = new Set<string>();
        this.previousEntityIds.set(fromPlayerId, newPreviousEntityIds);

        for (const serializedEntity of update.entities) {
            const deserialized = this.app.serializers.entity.deserialize(serializedEntity);
            missingIds.delete(serializedEntity.id);

            if (this.authority.determinesRemoval(deserialized, fromPlayerId)) {
                newPreviousEntityIds.add(serializedEntity.id);
            }

            switch (this.authority.entityAuthority(deserialized)) {
            case AuthorityType.FORWARD:
            case AuthorityType.NONE:
                const existing = this.world.entity(deserialized.id);
                if (!existing) {
                    // Entity doesn't exist locally yet, just add it
                    const previousAllow = this.world.entities.allowAddition;
                    try {
                        this.world.entities.allowAddition = ALWAYS_TRUE;
                        this.world.entities.add(deserialized);
                    } finally {
                        this.world.entities.allowAddition = previousAllow;
                    }
                } else {
                    // Entity already exists, copy properties
                    deserialized.bind(this.world); // Bind to the world to avoid crashes
                    existing.copy(deserialized, this.app);
                }
                break;
                
            case AuthorityType.LOCAL:
            case AuthorityType.FULL:
                continue;
            }
        }

        for (const missingId of missingIds) {
            this.world.entity(missingId)?.remove();
        }

        for (const serializedWorldEvent of update.worldEvents) {
            const deserialized = this.app.serializers.worldEvent.deserialize(serializedWorldEvent);

            switch (this.authority.worldEventAuthority(deserialized)) {
            case AuthorityType.NONE:
                this.world.addEvent(deserialized);
                break;
                
            case AuthorityType.LOCAL:
            case AuthorityType.FULL:
            case AuthorityType.FORWARD:
                continue;
            }
        }
    }
}