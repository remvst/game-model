import { CompositeConfigurable } from "@remvst/configurable";
import EntityIdConfigurable from "../configurable/entity-id-configurable";
import TriggerEvent from "../events/trigger-event";
import { RegistryEntry, traitRegistryEntry } from "../registry/trait-registry";
import Trait from "../trait";
import { PropertyType } from '../properties/property-constraints';

export default class DependencyTrait extends Trait {
    static readonly key = 'dependency';
    readonly key = DependencyTrait.key;
    readonly disableChunking = true;

    private readonly seenDependsOnIds = new Set<string>();

    constructor(
        public dependerIds: string[] = [],
        public dependsOnIds: string[] = [],
    ) {
        super();
    }

    cycle(_: number) {
        let dependencyBroken = true;

        for (const id of this.dependsOnIds) {
            if (this.entity.world.entity(id)) {
                this.seenDependsOnIds.add(id);
                dependencyBroken = false; // at least one dependency is fulfilled, no need to remove
            }

            if (!this.seenDependsOnIds.has(id)) {
                dependencyBroken = false; // the entity it depends on doesn't even exist yet
            }
        }

        if (!dependencyBroken) {
            return;
        }

        for (const dependerId of this.dependerIds) {
            const depender = this.entity.world.entity(dependerId);
            if (!depender) continue;

            if (depender.trait('event-holder') || depender.trait('event-trigger') || depender.trait('script')) {
                depender.addEvent(new TriggerEvent(null));
            } else {
                depender.remove();
            }
        }

        this.entity.remove();
    }

    entityIdList(
        list: () => string[],
        listName: string,
        updateList: (ids: string[]) => void,
    ): CompositeConfigurable {
        const configurable = new CompositeConfigurable();

        const listContent = list();
        for (let i = 0 ; i <= listContent.length ; i++) {
            const label = `${listName}[${i}]`;
            configurable.add(label, new EntityIdConfigurable({
                'world': this.entity?.world,
                'read': () => listContent[i],
                'write': (id, configurable) => {
                    const newIds = listContent.slice();
                    newIds[i] = id;
                    updateList(newIds.filter(id => !!id));
                    configurable.invalidate();
                }
            }));
        }

        return configurable;
    }

    static registryEntry(): RegistryEntry<DependencyTrait> {
        return traitRegistryEntry(builder => {
            builder.traitClass(DependencyTrait);
            builder.category('scripting');
            builder.property('dependerIds', PropertyType.list(PropertyType.id()), (trait) => trait.dependerIds, (trait, dependerIds) => trait.dependerIds = dependerIds);
            builder.property('dependsOnIds', PropertyType.list(PropertyType.id()), (trait) => trait.dependerIds, (trait, dependerIds) => trait.dependerIds = dependerIds);
        });
    }
}
