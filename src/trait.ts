import { Rectangle } from "@remvst/geometry";
import { GameModelApp, World, vector3 } from ".";
import SectorObjectSet from "./collections/sector-object-set";
import Entity from "./entity";
import { EntityEvent } from "./events/entity-event";
import { KeyProvider } from "./key-provider";
import {
    TraitSurfaceProvider,
    entityPositionSurface,
} from "./trait-surface-provider";

const REUSABLE_GEOMETRY_AREA = new Rectangle();

export default abstract class Trait implements KeyProvider {
    private _entity: Entity | null = null;
    enabled: boolean = true;

    static createdCount = 0;

    protected readonly lastEntityPosition = vector3();

    readonly queriableSectorSize: number = 1000;
    readonly surfaceProvider: TraitSurfaceProvider = entityPositionSurface;
    readonly disableChunking: boolean = false;
    readonly queriable: boolean = false;

    constructor() {
        Trait.createdCount++;
    }

    get entity(): Entity | null {
        return this._entity;
    }

    get world(): World | null {
        return this.entity?.world || null;
    }

    bind(entity: Entity) {
        this._entity = entity;
        this.lastEntityPosition.x = entity.position.x;
        this.lastEntityPosition.y = entity.position.y;
        this.lastEntityPosition.z = entity.position.z;

        if (this.queriable) {
            entity.world?.defineSectorSet(this.key, this.queriableSectorSize);
        }
    }

    postBind() {
        // to be implemented in subtraits
    }

    dependency<TraitType extends Trait>(traitId: string): TraitType {
        const trait = this.entity!.traits.getByKey(traitId);
        if (!trait) {
            throw new Error(
                "Trait " +
                    this.key +
                    " depends on trait " +
                    traitId +
                    " but trait was not found",
            );
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

    makeQueriable(sectorSet: SectorObjectSet<Entity>) {
        this.surfaceProvider.surface(this, REUSABLE_GEOMETRY_AREA);
        sectorSet.insert(this.entity, REUSABLE_GEOMETRY_AREA);
    }

    processEvent(event: EntityEvent, world: World) {
        // to be implemented in subtraits
    }

    copy(otherTrait: Trait, app: GameModelApp) {
        this.enabled = otherTrait.enabled;

        const entry = app.traitRegistry.entry(this.key);
        if (entry) {
            for (const property of entry.properties || []) {
                const value = property.get(otherTrait.entity);
                property.set(this.entity, value);
            }
        }
    }
}
