import { v4 } from "uuid";
import { KeyProvider } from "./key-provider";

import ObjectSet from "./collections/object-set";
import { EntityEvent } from "./events/entity-event";
import EntityEventProcessed from "./events/entity-event-processed";
import GameModelApp from "./game-model-app";
import { AuthorityType } from "./multiplayer/authority";
import { Property, getSet } from "./properties/properties";
import { PropertyType } from "./properties/property-constraints";
import Trait from "./trait";
import { vector3 } from "./vector3";
import World from "./world";

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
    static readonly angle: Property<number> = getSet(
        "angle",
        PropertyType.num(),
        (entity) => entity.angle,
        (entity, angle) => (entity.angle = angle),
    );

    static all() {
        return [this.x, this.y, this.z, this.angle];
    }
}

export default class Entity {
    static idGenerator: (entity: Entity) => string = () => v4();

    private readonly reusableEventProcessedEvent = new EntityEventProcessed(
        this,
    );

    static createdCount = 0;

    readonly id: string;
    readonly traits = new ObjectSet<Trait>((trait) => trait.key);
    world: World | null = null;

    position = vector3();
    private cycleStartPosition = vector3();
    cycleVelocity = vector3();

    angle: number = 0;
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

    bind(world: World) {
        this.world = world;

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

        for (const trait of this.traits.items()) {
            trait.processEvent(event, world);
        }

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

export function entity(
    arg0: string | Trait[],
    arg1?: Trait[],
) {
    let id: string;
    let traits: Trait[];

    if (typeof arg0 === "string") {
        id = arg0;
        traits = arg1;
    } else {
        id = undefined;
        traits = arg0;
    }

    return new Entity(id, traits);
}