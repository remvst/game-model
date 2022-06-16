import { KeyProvider } from './key-provider';
import { TraitSurfaceProvider } from './trait-surface-provider';
import { vector3 } from '.';
import Entity from './entity';
import { EntityEvent } from './events/entity-event';
import { Rectangle } from '@remvst/geometry';

const REUSABLE_GEOMETRY_AREA = new Rectangle(0, 0, 0, 0);

export default abstract class Trait implements KeyProvider {

    private _entity: Entity | null = null;
    enabled: boolean;

    protected readonly lastEntityPosition = vector3();

    constructor() {
        this.enabled = true;
    }

    get entity(): Entity | null {
        return this._entity;
    }

    bind(entity: Entity) {
        this._entity = entity;
        this.lastEntityPosition.x = this._entity.position.x;
        this.lastEntityPosition.y = this._entity.position.y;
        this.lastEntityPosition.z = this._entity.position.z;
    }

    postBind() {
        // to be implemented in subtraits
    }

    dependency<TraitType extends Trait>(traitId: string): TraitType {
        const trait = this.entity!.traits.getByKey(traitId);
        if (!trait) {
            throw new Error('Trait ' + this.key + ' depends on trait ' + traitId + ' but trait was not found');
        }

        return trait as TraitType;
    }

    abstract get key(): string;

    maybeCycle(elapsed: number) {
        if (!this.enabled) {
            return;
        }

        if (!this.entity || !this.entity!.world) {
            return;
        }

        this.cycle(elapsed);

        this.lastEntityPosition.x = this.entity!.x;
        this.lastEntityPosition.y = this.entity!.y;
        this.lastEntityPosition.z = this.entity!.z;
    }

    cycle(elapsed: number) {
        // to be implemented in subtraits
    }

    postCycle() {
        const { surfaceProvider } = this;
        if (surfaceProvider) {
            surfaceProvider.surface(this, REUSABLE_GEOMETRY_AREA);
            this.entity?.world?.sectorSet(this.key, surfaceProvider.sectorSize).insert(this.entity, REUSABLE_GEOMETRY_AREA);
        }
    }

    processEvent(event: EntityEvent) {
        // to be implemented in subtraits
    }

    readonly surfaceProvider: TraitSurfaceProvider | null = null;
}
