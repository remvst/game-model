import { Subscription } from "rxjs";
import Entity from "../entity";
import { WorldEvent } from "../events/world-event";
import GameModelApp from "../game-model-app";
import SerializationOptions from "../serialization/serialization-options";
import World from "../world";
import { AuthorityType } from "./authority";
import { WorldUpdate } from "./world-update";

export default class WorldUpdatesCollector {
    private queuedEvents: any[] = [];
    private watchedEntities = new Set<string>();
    private worldSubscriptions: Subscription[] = [];
    private readonly entityInitializations = new Map<string, any>();
    private readonly lastGeneratedUpdates = new Map<string, number>();

    constructor(
        private readonly app: GameModelApp,
        private readonly world: World,
        private readonly serializationOptions: SerializationOptions,
    ) {
        this.start();
    }

    start() {
        this.stop();

        this.worldSubscriptions = [
            this.world.events.subscribe((event) => this.onWorldEvent(event)),
            this.world.entities.additions.subscribe((entity) =>
                this.onEntityAdded(entity),
            ),
            this.world.entities.removals.subscribe((entity) =>
                this.onEntityRemoved(entity),
            ),
        ];

        for (const entity of this.world.entities.items()) {
            this.onEntityAdded(entity);
        }
    }

    stop() {
        this.queuedEvents = [];
        this.watchedEntities.clear();

        for (const subscription of this.worldSubscriptions) {
            subscription.unsubscribe();
        }
    }

    private onWorldEvent(event: WorldEvent) {
        switch (this.world.authority.worldEventAuthority(event)) {
            case AuthorityType.NONE:
            case AuthorityType.LOCAL:
                return;
            case AuthorityType.FULL:
            case AuthorityType.FORWARD:
                const serialized =
                    this.app.serializers.packed.worldEvent.serialize(
                        event as any,
                        this.serializationOptions,
                    );
                this.queuedEvents.push(serialized);
                break;
        }
    }

    private onEntityAdded(entity: Entity) {
        switch (this.world.authority.entityAuthority(entity)) {
            case AuthorityType.NONE:
            case AuthorityType.LOCAL:
                return;
            case AuthorityType.FULL:
            case AuthorityType.FORWARD:
                this.watchedEntities.add(entity.id);
                this.entityInitializations.set(
                    entity.id,
                    this.app.serializers.packed.entity.serialize(
                        entity,
                        this.serializationOptions,
                    ),
                );
                break;
        }
    }

    private onEntityRemoved(entity: Entity) {
        this.watchedEntities.delete(entity.id);
    }

    resetUpdateSkipping() {
        this.lastGeneratedUpdates.clear();
    }

    generateUpdate(): WorldUpdate<any, any> {
        const entities: any[] = [];
        const shortEntities = [];

        for (const entityId of this.watchedEntities) {
            const entity = this.world.entity(entityId);
            if (!entity) {
                this.lastGeneratedUpdates.delete(entityId);
                continue;
            }

            // For entities that tend not to change a lot, try to avoid sending them every frame
            const lastUpdate = this.lastGeneratedUpdates.get(entityId);
            if (lastUpdate > 0) {
                const maxUpdateInterval =
                    this.world.authority.maxUpdateInterval(entity);
                if (Math.max(0, entity.age - lastUpdate) < maxUpdateInterval) {
                    shortEntities.push(entity.id);
                    continue;
                }
            }

            this.entityInitializations.delete(entityId);

            try {
                const serialized = this.app.serializers.packed.entity.serialize(
                    entity,
                    this.serializationOptions,
                );
                entities.push(serialized);
                this.lastGeneratedUpdates.set(entityId, entity.age);
            } catch (e) {
                console.warn(
                    `Unable to serialize entity with ID ${entityId}`,
                    e,
                );
            }
        }

        // Entities that were removed by the time the update is generated, send their initial state
        for (const [id, initialState] of this.entityInitializations.entries()) {
            entities.push(initialState);
            this.lastGeneratedUpdates.set(id, 0);
        }

        const worldEvents = this.queuedEvents;
        this.queuedEvents = [];
        this.entityInitializations.clear();

        const res: WorldUpdate<any, any> = {};
        if (entities.length) res.entities = entities;
        if (worldEvents.length) res.worldEvents = worldEvents;
        if (shortEntities.length) res.shortEntities = shortEntities;
        return res;
    }
}
