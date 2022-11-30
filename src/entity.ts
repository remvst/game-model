import { KeyProvider } from './key-provider';
import { v4 } from 'uuid';

import ObjectSet from './collections/object-set';
import { EntityEvent } from './events/entity-event';
import EntityEventProcessed from './events/entity-event-processed';
import Trait from './trait';
import { vector3 } from './vector3';
import World from './world';

function processMicroTime() {
    const [seconds, nanoseconds] = process.hrtime()
    return seconds * 1000000000 + nanoseconds;
}

const now = typeof window === 'undefined' ? processMicroTime : performance.now.bind(performance);

export default class Entity {

    private readonly reusableEventProcessedEvent = new EntityEventProcessed(this);

    readonly id: string;
    readonly traits: ObjectSet<Trait>;
    world: World | null = null;

    position = vector3();
    private cycleStartPosition = vector3();
    cycleVelocity = vector3();

    angle: number;
    age: number;
    timeFactor: number;

    constructor(
        id: string | undefined,
        traits: Trait[],
    ) {
        this.id = id || v4();
        this.angle = 0;
        this.age = 0;
        this.timeFactor = 1;

        this.traits = new ObjectSet(trait => trait.key);

        for (const trait of traits) {
            this.traits.add(trait);
        }
    }

    get x() { return this.position.x; }
    get y() { return this.position.y; }
    get z() { return this.position.z; }

    set x(x: number) { this.position.x = x; }
    set y(y: number) { this.position.y = y; }
    set z(z: number) { this.position.z = z; }

    bind(world: World) {
        this.world = world;

        for (const trait of this.traits.items()) {
            trait.bind(this);
        }

        for (const trait of this.traits.items()) {
            trait.postBind();
        }
    }

    unbind() {
        this.world = null;
    }

    preCycle() {
        this.cycleStartPosition.x = this.position.x;
        this.cycleStartPosition.y = this.position.y;
        this.cycleStartPosition.z = this.position.z;

        for (const trait of this.traits.items()) {
            trait.preCycle();
        }
    }

    cycle(elapsed: number) {
        const adjusted = elapsed * this.timeFactor;

        this.age += adjusted;

        for (const trait of this.traits.items()) {
            const before = now();

            trait.maybeCycle(adjusted);

            const after = now();
            this.world?.cyclePerformanceTracker?.addTime(this.id, trait.key, after - before);
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

    traitOfType<T extends Trait>(keyProvider: (new (...params: any) => T) & KeyProvider): T | null {
        const key = keyProvider.key;
        if (!key) {
            throw new Error('Provided trait type does not have a statically defined key');
        }
        return this.traits.getByKey(key) as (T | null);
    }

    addEvent(event: EntityEvent) {
        const { world } = this;
        if (!world) {
            return;
        }

        for (const trait of this.traits.items()) {
            trait.processEvent(event, world);
        }

        if (world) {
            this.reusableEventProcessedEvent.event = event;
            world.addEvent(this.reusableEventProcessedEvent);
        }
    }
};
