import { Rectangle } from '@remvst/geometry';
import { KeyProvider } from './key-provider';
import { TraitSurfaceProvider, entityPositionSurface } from './trait-surface-provider';
import { vector3, World } from '.';
import Entity from './entity';
import { EntityEvent } from './events/entity-event';

const REUSABLE_GEOMETRY_AREA = new Rectangle();

export default abstract class Trait implements KeyProvider {

    private _entity: Entity | null = null;
    enabled: boolean;

    protected readonly lastEntityPosition = vector3();

    readonly queriableSectorSize = 1000;
    readonly surfaceProvider: TraitSurfaceProvider = entityPositionSurface;

    constructor() {
        this.enabled = true;
    }

    get entity(): Entity | null {
        return this._entity;
    }

    bind(entity: Entity) {
        this._entity = entity;
        this.lastEntityPosition.x = entity.position.x;
        this.lastEntityPosition.y = entity.position.y;
        this.lastEntityPosition.z = entity.position.z;

        entity.world?.defineSectorSet(this.key, this.queriableSectorSize);
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

    preCycle() {
        this.makeQueriable();
    }

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

    private makeQueriable() {
        this.surfaceProvider.surface(this, REUSABLE_GEOMETRY_AREA);
        this.entity?.world?.sectorSet(this.key)?.insert(this.entity, REUSABLE_GEOMETRY_AREA);
    }

    processEvent(event: EntityEvent, world: World) {
        // to be implemented in subtraits
    }
}
