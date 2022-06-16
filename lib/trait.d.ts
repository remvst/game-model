import { KeyProvider } from './key-provider';
import { TraitSurfaceProvider } from './trait-surface-provider';
import Entity from './entity';
import { EntityEvent } from './events/entity-event';
export default abstract class Trait implements KeyProvider {
    private _entity;
    enabled: boolean;
    protected readonly lastEntityPosition: import("./vector3").Vector3;
    constructor();
    get entity(): Entity | null;
    bind(entity: Entity): void;
    postBind(): void;
    dependency<TraitType extends Trait>(traitId: string): TraitType;
    abstract get key(): string;
    preCycle(): void;
    maybeCycle(elapsed: number): void;
    cycle(elapsed: number): void;
    postCycle(): void;
    private makeQueriable;
    processEvent(event: EntityEvent): void;
    readonly surfaceProvider: TraitSurfaceProvider | null;
}
