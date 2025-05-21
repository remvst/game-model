import { v4 } from "uuid";
import { KeyProvider } from "./key-provider";

import { ObjectSet } from "./collections/object-set";
import {
    EntityEvent,
    EntityEventConstructor,
    EntityEventListener,
} from "./events/entity-event";
import { EntityEventProcessed } from "./events/entity-event-processed";
import { GameModelApp } from "./game-model-app";
import { AuthorityType } from "./multiplayer/authority";
import { Property, getSet } from "./properties/properties";
import { PropertyType } from "./properties/property-constraints";
import { Trait } from "./trait";
import { vector3 } from "./vector3";
import { World } from "./world";

function processMicroTime() {
    const [seconds, nanoseconds] = process.hrtime();
    return seconds * 1000000000 + nanoseconds;
}

const now =
    typeof window === "undefined"
        ? processMicroTime
        : performance.now.bind(performance);

export class EntityProperties {
    static readonly x: Property<number> = getSet(
        "position.x",
        PropertyType.num(),
        (entity) => entity.x,
        (entity, x) => (entity.x = x),
    );
    static readonly y: Property<number> = getSet(
        "position.y",
        PropertyType.num(),
        (entity) => entity.y,
        (entity, y) => (entity.y = y),
    );
    static readonly z: Property<number> = getSet(
        "position.z",
        PropertyType.num(),
        (entity) => entity.z,
        (entity, z) => (entity.z = z),
    );
    static readonly rotationX: Property<number> = getSet(
        "rotation.x",
        PropertyType.num(),
        (entity) => entity.rotation.x,
        (entity, rotationX) => (entity.rotation.x = rotationX),
    );
    static readonly rotationY: Property<number> = getSet(
        "rotation.y",
        PropertyType.num(),
        (entity) => entity.rotation.y,
        (entity, rotationY) => (entity.rotation.y = rotationY),
    );
    static readonly rotationZ: Property<number> = getSet(
        "rotation.z",
        PropertyType.num(),
        (entity) => entity.rotation.z,
        (entity, rotationZ) => (entity.rotation.x = rotationZ),
    );

    static all() {
        return [
            this.x,
            this.y,
            this.z,
            this.rotationX,
            this.rotationY,
            this.rotationZ,
        ];
    }
}

export class Entity {
    static idGenerator: (entity: Entity) => string = () => v4();

    private readonly reusableEventProcessedEvent = new EntityEventProcessed(
        this,
    );
    private readonly entityEventListeners = new Map<
        EntityEventConstructor<EntityEvent>,
        EntityEventListener<EntityEvent>[]
    >();
    private generalEventListeners: EntityEventListener<EntityEvent>[] = [];

    static createdCount = 0;

    readonly id: string;
    readonly traits = new ObjectSet<Trait>((trait) => trait.key);
    world: World | null = null;

    readonly position = vector3();
    private cycleStartPosition = vector3();
    cycleVelocity = vector3();

    readonly rotation = vector3();

    age: number = 0;

    constructor(id: string | undefined, traits: Trait[] = []) {
        Entity.createdCount++;

        for (const trait of traits) {
            this.traits.add(trait);
        }

        this.id = id || Entity.idGenerator(this);
    }

    get x() {
        return this.position.x;
    }
    get y() {
        return this.position.y;
    }
    get z() {
        return this.position.z;
    }

    set x(x: number) {
        this.position.x = x;
    }
    set y(y: number) {
        this.position.y = y;
    }
    set z(z: number) {
        this.position.z = z;
    }

    get angle() {
        return this.rotation.z;
    }

    set angle(value: number) {
        this.rotation.z = value;
    }

    bind(world: World) {
        this.world = world;

        for (const trait of this.traits.items()) {
            if (trait.processEvent === Trait.prototype.processEvent) continue;
            this.generalEventListeners.push((event, world) =>
                trait.processEvent(event, world),
            );
        }

        for (const trait of this.traits.items()) {
            trait.bind(this);
        }

        for (const trait of this.traits.items()) {
            trait.postBind();
        }

        this.cycleStartPosition.x = this.position.x;
        this.cycleStartPosition.y = this.position.y;
        this.cycleStartPosition.z = this.position.z;
    }

    unbind() {
        this.world = null;
        this.entityEventListeners.clear();
        this.generalEventListeners = [];
    }

    onEvent<T extends EntityEvent>(
        type: EntityEventConstructor<T>,
        listener: EntityEventListener<T>,
    ) {
        const existingListeners = this.entityEventListeners.get(type);
        if (!existingListeners) {
            this.entityEventListeners.set(type, [listener]);
        } else {
            existingListeners.push(listener);
        }
    }

    preCycle() {
        this.cycleStartPosition.x = this.position.x;
        this.cycleStartPosition.y = this.position.y;
        this.cycleStartPosition.z = this.position.z;
    }

    cycle(elapsed: number) {
        const timeFactor = this.world?.entityTimeFactorProvider(this) || 1;
        const adjusted = elapsed * timeFactor;

        this.age += adjusted;

        for (const trait of this.traits.items()) {
            const before = now();

            trait.maybeCycle(adjusted);

            const after = now();
            this.world?.cyclePerformanceTracker?.addTime(
                this.id,
                trait.key,
                after - before,
            );
        }
    }

    postCycle() {
        this.cycleVelocity.x = this.position.x - this.cycleStartPosition.x;
        this.cycleVelocity.y = this.position.y - this.cycleStartPosition.y;
        this.cycleVelocity.z = this.position.z - this.cycleStartPosition.z;
    }

    remove() {
        if (this.world) {
            this.world.entities.remove(this);
        }
    }

    trait(traitKey: string) {
        return this.traits.getByKey(traitKey);
    }

    traitOfType<T extends Trait>(
        keyProvider: (new (...params: any) => T) & KeyProvider,
    ): T | null {
        const key = keyProvider.key;
        if (!key) {
            throw new Error(
                "Provided trait type does not have a statically defined key",
            );
        }
        return this.traits.getByKey(key) as T | null;
    }

    addEvent(event: EntityEvent) {
        const { world } = this;
        if (!world) {
            return;
        }

        switch (world.authority.entityEventAuthority(event, this)) {
            case AuthorityType.FULL:
            case AuthorityType.LOCAL:
            case AuthorityType.FORWARD:
                break;
            case AuthorityType.NONE:
                return;
        }

        // Call all the listeners for this event
        const listeners = this.entityEventListeners.get(
            event.constructor as EntityEventConstructor<EntityEvent>,
        );
        for (const listener of listeners || []) {
            listener(event, world);
        }

        // Process general event listeners
        for (const listener of this.generalEventListeners) {
            listener(event, world);
        }

        // Propagate to the world
        this.reusableEventProcessedEvent.event = event;
        world.addEvent(this.reusableEventProcessedEvent);
    }

    copy(otherEntity: Entity, app: GameModelApp) {
        this.age = otherEntity.age;
        this.position.x = otherEntity.position.x;
        this.position.y = otherEntity.position.y;
        this.position.z = otherEntity.position.z;
        this.angle = otherEntity.angle;

        for (const trait of otherEntity.traits.items()) {
            const existingTrait = this.trait(trait.key);
            existingTrait.copy(trait, app);
        }
    }
}

export function entity(arg0?: string | Trait[] | null, arg1?: Trait[]) {
    let id: string;
    let traits: Trait[];

    if (arg0 === null || arg0 === undefined || typeof arg0 === "string") {
        id = (arg0 as string) || undefined;
        traits = arg1 || [];
    } else {
        id = undefined;
        traits = arg0 || [];
    }

    return new Entity(id, traits);
}
