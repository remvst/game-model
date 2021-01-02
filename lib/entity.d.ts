import ObjectSet from './collections/object-set';
import Trait from './trait';
import World from './world';
export default class Entity {
    readonly id: string;
    readonly traits: ObjectSet<Trait>;
    world: World | null;
    x: number;
    y: number;
    angle: number;
    age: number;
    timeFactor: number;
    constructor(id: string | undefined, traits: Trait[]);
    bind(world: World): void;
    unbind(): void;
    cycle(elapsed: number): void;
    remove(): void;
    trait(traitKey: string): Trait | null;
}
