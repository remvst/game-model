import { EntityEvent } from "../events/entity-event";
import { PropertyType } from "../properties/property-constraints";
import { TraitRegistryEntry } from "../registry/trait-registry";
import {
    DefinitionsOfProps,
    SimpleTrait,
    simpleTraitRegistryEntry,
} from "./simple-trait";

export class TraitEnabledChange implements EntityEvent {
    constructor(
        readonly traitKey: string,
        readonly enabled: boolean,
    ) {}
}

export class PeriodicallyEnableTrait extends SimpleTrait<{
    enabledTraitKey: string;
    enabledDuration: number;
    disabledDuration: number;
    offset: number;
}> {
    static readonly key = "periodically-enable";
    readonly key = PeriodicallyEnableTrait.key;

    definitions(): DefinitionsOfProps<PeriodicallyEnableTrait["props"]> {
        return {
            enabledTraitKey: PropertyType.str(),
            enabledDuration: PropertyType.num(),
            disabledDuration: PropertyType.num(),
            offset: PropertyType.num(),
        };
    }

    private get cycleDuration(): number {
        return this.props.enabledDuration + this.props.disabledDuration;
    }

    private get shouldEnable(): boolean {
        return (
            (this.entity!.age + this.props.offset) % this.cycleDuration <
            this.props.enabledDuration
        );
    }

    cycle(): void {
        const trait = this.entity!.trait(this.props.enabledTraitKey);
        if (!trait) return;

        const enabled = this.shouldEnable;
        if (trait.enabled !== enabled) {
            trait.enabled = enabled;
            this.entity!.addEvent(
                new TraitEnabledChange(this.props.enabledTraitKey, enabled),
            );
        }
    }

    static registryEntry(): TraitRegistryEntry<PeriodicallyEnableTrait> {
        return simpleTraitRegistryEntry(PeriodicallyEnableTrait);
    }
}
