import GameModelApp from "../game-model-app";
import SerializationOptions from "../serialization/serialization-options";
import World from "../world";
import { Authority, AuthorityType } from "./authority";
import { WorldUpdate } from "./world-update";

export default class WorldUpdatesReceiver {
    private previousEntityIds = new Map<string, Set<string>>();

    constructor(
        private readonly app: GameModelApp,
        private readonly world: World,
        private readonly serializationOptions: SerializationOptions,
    ) {}

    applyUpdate(
        update: WorldUpdate<any, any>,
        fromPlayerId: string,
        authority: Authority,
    ) {
        const missingIds =
            this.previousEntityIds.get(fromPlayerId) || new Set();
        const newPreviousEntityIds = new Set<string>();
        this.previousEntityIds.set(fromPlayerId, newPreviousEntityIds);

        for (const serializedEntity of update.entities || []) {
            const deserialized = this.app.serializers.packed.entity.deserialize(
                serializedEntity,
                this.serializationOptions,
            );
            missingIds.delete(deserialized.id);

            if (
                this.world.authority.determinesRemoval(
                    deserialized,
                    fromPlayerId,
                )
            ) {
                newPreviousEntityIds.add(deserialized.id);
            }

            switch (this.world.authority.entityAuthority(deserialized)) {
                case AuthorityType.FORWARD:
                case AuthorityType.NONE:
                    const existing = this.world.entity(deserialized.id);
                    if (!existing) {
                        // Entity doesn't exist locally yet, just add it
                        this.world.entities.forceAdd(deserialized);
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

        for (const short of update.shortEntities || []) {
            newPreviousEntityIds.add(short);
            missingIds.delete(short);
        }

        for (const missingId of missingIds) {
            this.world.entity(missingId)?.remove();
        }

        for (const serializedWorldEvent of update.worldEvents || []) {
            const deserialized =
                this.app.serializers.packed.worldEvent.deserialize(
                    serializedWorldEvent,
                    this.serializationOptions,
                );

            switch (this.world.authority.worldEventAuthority(deserialized)) {
                case AuthorityType.NONE:
                case AuthorityType.LOCAL:
                case AuthorityType.FORWARD:
                    this.world.addEvent(deserialized, authority);
                    break;

                case AuthorityType.FULL:
                    continue;
            }
        }
    }
}
