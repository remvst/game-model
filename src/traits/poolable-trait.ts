import { ReusablePoolBindable } from "@remvst/optimization";
import { EntityRemoved } from "../events/entity-removed";
import {
    DefinitionsOfProps,
    SimpleTrait,
    simpleTraitRegistryEntry,
} from "./simple-trait";

export class PoolableTrait extends SimpleTrait<{}> {
    static readonly key = "poolable";
    readonly key = PoolableTrait.key;

    definitions(): DefinitionsOfProps<{}> {
        return {};
    }

    postBind(): void {
        super.postBind();
        this.entity!.onEvent(EntityRemoved, () => {
            const { pool } = this.entity as unknown as ReusablePoolBindable;
            if (pool) pool.give(this.entity);
        });
    }

    static registryEntry() {
        return simpleTraitRegistryEntry(PoolableTrait);
    }
}
