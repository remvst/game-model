import {
    ButtonConfigurable,
    Configurable,
    EnumConfigurable,
    GroupConfigurable,
    StringConfigurable,
} from "@remvst/configurable";
import { Entity } from "../entity";
import { EntitySelectionRequested } from "../events/entity-selection-requested";
import { EntitySelectorTrait } from "../traits/entity-selector-trait";
import { World } from "../world";
import { EntityFilter, EntityFilters } from "./entity-filter";

export class EntityIdConfigurable extends GroupConfigurable {
    readonly read: (configurable: Configurable) => string;
    readonly write: (value: string, configurable: Configurable) => void;
    private filter: EntityFilter;

    constructor(opts: {
        world?: World | null;
        filter?: EntityFilter | null;
        read: (configurable: Configurable) => string;
        write: (value: string, configurable: Configurable) => void;
    }) {
        super();

        this.add(
            new StringConfigurable({
                read: opts.read,
                write: (value, configurable) => {
                    opts.write(value, configurable);
                    configurable.invalidate();
                },
            }),
        );

        this.read = opts.read;
        this.write = opts.write;
        this.filter = opts.filter || EntityFilters.any();

        const { world } = opts;
        if (world) {
            const ids: string[] = [];

            const entityChoices = new EnumConfigurable({
                read: opts.read,
                write: (value, configurable) => {
                    opts.write(value, configurable);
                    configurable.invalidate();
                },
            });
            const descriptionToEntity = new Map<string, Entity>();
            for (const entity of world.entities.items()) {
                if (!this.filter(entity)) {
                    continue;
                }

                ids.push(entity.id);

                const traitKeys = entity.traits.map((trait) => trait.key);
                traitKeys.sort();

                let shownKeys: string[];
                if (traitKeys.length <= 4) {
                    shownKeys = traitKeys;
                } else {
                    shownKeys = traitKeys.slice(0, 4);
                    shownKeys.push(`+${traitKeys.length - shownKeys.length}`);
                }

                const description = `(${shownKeys}) ${entity.id}`;
                descriptionToEntity.set(description, entity);

                for (const trait of entity.traits.items()) {
                    entityChoices
                        .category(trait.key)
                        .add(description, entity.id);
                }
            }

            entityChoices.add("", "");

            const sortedDescriptions = Array.from(
                descriptionToEntity.keys(),
            ).sort();
            sortedDescriptions.forEach((description) => {
                const entity = descriptionToEntity.get(description);
                entityChoices.add(description, entity!.id);
            });

            this.add(entityChoices);

            this.add(
                new ButtonConfigurable({
                    label: "select",
                    onClick: async (configurable) => {
                        const entityId: string = await new Promise(
                            (resolve) => {
                                const event = new EntitySelectionRequested(
                                    this.filter,
                                    resolve,
                                );
                                for (const entitySelector of world.entities.bucket(
                                    EntitySelectorTrait.key,
                                ) || []) {
                                    entitySelector.addEvent(event);
                                }
                            },
                        );
                        if (!entityId) {
                            return;
                        }

                        opts.write(entityId, configurable);
                        configurable.invalidate();
                    },
                }),
            );
        }
    }
}
