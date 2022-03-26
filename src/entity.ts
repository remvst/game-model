import { v4 } from 'uuid';

import ObjectSet from './collections/object-set';
import { EntityEvent } from './events/entity-event';
import EntityEventProcessed from './events/entity-event-processed';
import Trait, { KeyProvider } from './trait';
import { vector3 } from './vector3';
import World from './world';

export default class Entity {

    private readonly reusableEventProcessedEvent = new EntityEventProcessed(this);

    readonly id: string;
    readonly traits: ObjectSet<Trait>;
    world: World | null = null;

    position = vector3();
    previousPosition = vector3();

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
            trait.bind(this);
        }

        for (const trait of this.traits.items()) {
            trait.postBind();
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
    }

    unbind() {
        this.world = null;
    }

    postCycle() {
        this.previousPosition.x = this.x;
        this.previousPosition.y = this.y;
        this.previousPosition.z = this.z;
    }

    cycle(elapsed: number) {
        const adjusted = elapsed * this.timeFactor;

        this.age += adjusted;

        for (const trait of this.traits.items()) {
            trait.maybeCycle(adjusted);
        }
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
        for (const trait of this.traits.items()) {
            trait.processEvent(event);
        }

        if (this.world) {
            this.reusableEventProcessedEvent.event = event;
            this.world.addEvent(this.reusableEventProcessedEvent);
        }
    }

};
