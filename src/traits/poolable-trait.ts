import { ReusablePoolBindable } from "@remvst/optimization";
import { EntityRemoved } from "../events/entity-removed";
import { traitRegistryEntry } from "../registry/trait-registry";
import { Trait } from "../trait";

export class PoolableTrait extends Trait {
    static readonly key = "poolable";
    readonly key = PoolableTrait.key;

    postBind(): void {
        super.postBind();
        this.entity!.onEvent(EntityRemoved, () => {
            const { pool } = this.entity as unknown as ReusablePoolBindable;
            if (pool) pool.give(this.entity);
        });
    }

    static registryEntry() {
        return traitRegistryEntry((builder) => {
            builder.traitClass(PoolableTrait);
        });
    }
}
