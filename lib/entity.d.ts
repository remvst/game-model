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
    constructor(id: string | undefined, traits: Trait[]);
    bind(world: World): void;
    unbind(): void;
    cycle(elapsed: number): void;
    remove(): void;
    trait(traitKey: string): Trait | null;
    traitOfType<T extends Trait>(keyProvider: (new (...params: any) => T) & KeyProvider): T | null;
    addEvent(event: EntityEvent): void;
}
