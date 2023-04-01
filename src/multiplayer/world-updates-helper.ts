import { Subscription } from "rxjs";
import Entity from "../entity";
import { WorldEvent } from "../events/world-event";
import GameModelApp from "../game-model-app";
import { CompositeSerializerMeta } from "../serialization/composite-serializer";
import { JsonSerializedEntity } from "../serialization/json-serializers";
import World from "../world";
import { Authority, AuthorityType } from "./authority";
import { WorldUpdate } from "./world-update";

export default class WorldUpdatesHelper {

    private queuedEvents: CompositeSerializerMeta[] = [];
    private watchedEntities = new Set<string>();
    private worldSubscriptions: Subscription[] = [];

    constructor(
        private readonly app: GameModelApp,
        private readonly world: World,
        private readonly authority: Authority,
    ) {
        this.start();
    }

    start() {
        this.stop();

        this.worldSubscriptions = [
            this.world.events.subscribe((event) => this.onWorldEvent(event)),
            this.world.entities.additions.subscribe((entity) => this.onEntityAdded(entity)),
            this.world.entities.removals.subscribe((entity) => this.onEntityRemoved(entity)),
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
        switch (this.authority.worldEventAuthority(event)) {    
        case AuthorityType.NONE:
        case AuthorityType.LOCAL:
            return;
        case AuthorityType.FULL:
            const serialized = this.app.serializers.worldEvent.serialize(event as any);
            this.queuedEvents.push(serialized);
            break;
        }
    }

    private onEntityAdded(entity: Entity) {
        switch (this.authority.entityAuthority(entity)) {    
        case AuthorityType.NONE:
        case AuthorityType.LOCAL:
            return;
        case AuthorityType.FULL:
            this.watchedEntities.add(entity.id);
            break;
        }
    }

    private onEntityRemoved(entity: Entity) {
        this.watchedEntities.delete(entity.id);
    }

    generateUpdate(): WorldUpdate<JsonSerializedEntity, CompositeSerializerMeta> {
        const entities: JsonSerializedEntity[] = [];

        for (const entityId of this.watchedEntities) {
            const entity = this.world.entity(entityId);
            if (!entity) continue;
            try {
                const serialized = this.app.serializers.entity.serialize(entity)
                entities.push(serialized);
            } catch (e) {
                console.warn(`Unable to serialize entity with ID ${entityId}`, e);
            }
        }

        const worldEvents = this.queuedEvents;
        this.queuedEvents = [];

        return { entities, worldEvents };
    }

    applyUpdate(
        update: WorldUpdate<JsonSerializedEntity, CompositeSerializerMeta>, 
        authority: Authority,
    ) {
        for (const serializedEntity of update.entities) {
            const deserialized = this.app.serializers.entity.deserialize(serializedEntity);
            switch (authority.entityAuthority(deserialized)) {    
            case AuthorityType.NONE:
            case AuthorityType.LOCAL:
                continue;
            case AuthorityType.FULL:
                const existing = this.world.entity(deserialized.id);
                if (!existing) {
                    // Entity doesn't exist locally yet, just add it
                    this.world.entities.add(deserialized);
                } else {
                    // Entity already exists, copy properties
                    existing.copy(deserialized, this.app);
                }
            }
        }

        for (const serializedWorldEvent of update.worldEvents) {
            const deserialized = this.app.serializers.worldEvent.deserialize(serializedWorldEvent);
            switch (authority.worldEventAuthority(deserialized)) {    
                case AuthorityType.NONE:
                case AuthorityType.LOCAL:
                    continue;
                case AuthorityType.FULL:
                    this.world.addEvent(deserialized);
                }
        }
    }
}