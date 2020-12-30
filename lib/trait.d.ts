import Entity from './entity';
export default abstract class Trait {
    protected entity: Entity | null;
    enabled: boolean;
    constructor();
    bind(entity: Entity): void;
    postBind(): void;
    dependency<TraitType extends Trait>(traitId: string): TraitType;
    abstract get key(): string;
    maybeCycle(elapsed: number): void;
    cycle(elapsed: number): void;
}
