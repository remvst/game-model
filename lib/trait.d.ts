import Entity from './entity';
import { EntityEvent } from './events/entity-event';
export interface KeyProvider {
    readonly key: string;
}
export default abstract class Trait implements KeyProvider {
    protected entity: Entity | null;
    enabled: boolean;
    protected readonly lastEntityPosition: import("./vector3").Vector3;
    constructor();
    bind(entity: Entity): void;
    postBind(): void;
    dependency<TraitType extends Trait>(traitId: string): TraitType;
    abstract get key(): string;
    maybeCycle(elapsed: number): void;
    cycle(elapsed: number): void;
    processEvent(event: EntityEvent): void;
}
