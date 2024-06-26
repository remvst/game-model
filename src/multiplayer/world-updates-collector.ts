import { Subscription } from "rxjs";
import { Entity } from "../entity";
import { WorldEvent } from "../events/world-event";
import { GameModelApp } from "../game-model-app";
import { SerializationOptions } from "../serialization/serialization-options";
import { World } from "../world";
import { Authority, AuthorityType } from "./authority";
import { WorldUpdate } from "./world-update";

export class WorldUpdatesCollector {
    private queuedEvents: any[] = [];
    private watchedEntities = new Set<string>();
    private worldSubscriptions: Subscription[] = [];
    private readonly entityInitializations = new Map<string, any>();
    private readonly lastGeneratedUpdates = new Map<string, number>();

    authorityOverride: Authority | null = null;

    private readonly pinnedEntityIds = new Set<string>();
    private readonly unsentPins = new Set<string>();
    private readonly unsentUnpins = new Set<string>();

    constructor(
        private readonly app: GameModelApp,
        private readonly world: World,
        private readonly serializationOptions: SerializationOptions,
    ) {
        this.start();
    }

    pin(entityId: string) {
        this.pinnedEntityIds.add(entityId);
        this.unsentPins.add(entityId);
        this.unsentUnpins.delete(entityId);
    }

    private unpin(entityId: string) {
        this.pinnedEntityIds.delete(entityId);
        this.unsentPins.delete(entityId);
        this.unsentUnpins.add(entityId);
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
        const authority = this.authorityOverride || this.world.authority;
        switch (authority.worldEventAuthority(event)) {
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
        const authority = this.authorityOverride || this.world.authority;
        switch (authority.entityAuthority(entity)) {
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
        this.unpin(entity.id);
    }

    resetUpdateSkipping() {
        this.lastGeneratedUpdates.clear();

        for (const pinnedId of this.pinnedEntityIds) {
            this.unsentPins.add(pinnedId);
        }
    }

    generateUpdate(): WorldUpdate<any, any> {
        const entities: any[] = [];
        const shortEntities = [];
        const authority = this.authorityOverride || this.world.authority;
        const pins: string[] = [];

        for (const entityId of this.watchedEntities) {
            const entity = this.world.entity(entityId);
            if (!entity) {
                this.lastGeneratedUpdates.delete(entityId);
                this.unpin(entityId);
                continue;
            }

            // For pinned entities, only add them to the update if the pin hasn't been sent yet
            if (this.pinnedEntityIds.has(entityId)) {
                if (this.unsentPins.has(entityId)) {
                    pins.push(entityId);
                } else {
                    continue;
                }
            }

            // For entities that tend not to change a lot, try to avoid sending them every frame
            const lastUpdate = this.lastGeneratedUpdates.get(entityId);
            if (lastUpdate > 0) {
                const maxUpdateInterval = authority.maxUpdateInterval(entity);
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

        const unpins = Array.from(this.unsentUnpins);
        this.unsentUnpins.clear();

        const worldEvents = this.queuedEvents;
        this.queuedEvents = [];
        this.entityInitializations.clear();

        for (const entityId of pins) {
            this.unsentPins.delete(entityId);
        }

        const res: WorldUpdate<any, any> = {};
        if (entities.length) res.entities = entities;
        if (worldEvents.length) res.worldEvents = worldEvents;
        if (shortEntities.length) res.shortEntities = shortEntities;
        if (pins.length) res.pins = pins;
        if (unpins.length) res.unpins = unpins;
        return res;
    }
}
