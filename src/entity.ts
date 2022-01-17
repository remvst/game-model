import { v4 } from 'uuid';

import ObjectSet from './collections/object-set';
import { EntityEvent } from './events/entity-event';
import Trait, { KeyProvider } from './trait';
import World from './world';

export default class Entity {

    readonly id: string;
    readonly traits: ObjectSet<Trait>;
    world: World | null;

    x: number;
    y: number;
    z: number;
    angle: number;
    age: number;
    timeFactor: number;

    constructor(id: string | undefined = undefined, traits: Trait[]) {
        this.id = id || v4();
        this.world = null;

        this.x = 0;
        this.y = 0;
        this.z = 0;
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

    bind(world: World) {
        this.world = world;
    }

    unbind() {
        this.world = null;
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
    }

};
