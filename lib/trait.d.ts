import Entity from './entity';
export default class Trait {
    protected entity: Entity | null;
    enabled: boolean;
    constructor();
    bind(entity: Entity): void;
    postBind(): void;
    dependency(traitId: string): Trait;
    get key(): string;
    maybeCycle(elapsed: number): void;
    cycle(elapsed: number): void;
}
