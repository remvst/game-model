import ObjectSet from './collections/object-set';
import { EntityEvent } from './events/entity-event';
import Trait, { KeyProvider } from './trait';
import World from './world';
export default class Entity {
    private readonly reusableEventProcessedEvent;
    readonly id: string;
    readonly traits: ObjectSet<Trait>;
    world: World | null;
    position: import("./vector3").Vector3;
    cycleStartPosition: import("./vector3").Vector3;
    cycleEndPosition: import("./vector3").Vector3;
    cycleVelocity: import("./vector3").Vector3;
    angle: number;
    age: number;
    timeFactor: number;
    constructor(id: string | undefined, traits: Trait[]);
    get x(): number;
    get y(): number;
    get z(): number;
    set x(x: number);
    set y(y: number);
    set z(z: number);
    bind(world: World): void;
    unbind(): void;
    preCycle(): void;
    cycle(elapsed: number): void;
    postCycle(): void;
    remove(): void;
    trait(traitKey: string): Trait | null;
    traitOfType<T extends Trait>(keyProvider: (new (...params: any) => T) & KeyProvider): T | null;
    addEvent(event: EntityEvent): void;
}
