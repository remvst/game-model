import { EntityEvent } from "../events/entity-event";
import { PropertyType } from "../properties/property-constraints";
import { TraitRegistryEntry, traitRegistryEntry } from "../registry/trait-registry";
import { Trait } from "../trait";

export class TraitEnabledChange implements EntityEvent {
    constructor(
        readonly traitKey: string,
        readonly enabled: boolean,
    ) {}
}

export class PeriodicallyEnableTrait extends Trait {
    static readonly key = "periodically-enable";
    readonly key = PeriodicallyEnableTrait.key;

    enabledTraitKey: string = "";
    enabledDuration: number = 2;
    disabledDuration: number = 3;
    offset: number = 0;

    private get cycleDuration(): number {
        return this.enabledDuration + this.disabledDuration;
    }

    private get shouldEnable(): boolean {
        return (
            (this.entity!.age + this.offset) % this.cycleDuration <
            this.enabledDuration
        );
    }

    cycle(): void {
        const trait = this.entity!.trait(this.enabledTraitKey);
        if (!trait) return;

        const enabled = this.shouldEnable;
        if (trait.enabled !== enabled) {
            trait.enabled = enabled;
            this.entity!.addEvent(
                new TraitEnabledChange(this.enabledTraitKey, enabled),
            );
        }
    }

    static registryEntry(): TraitRegistryEntry<PeriodicallyEnableTrait> {
        return traitRegistryEntry((builder) => {
            builder.traitClass(PeriodicallyEnableTrait);
            builder.simpleProp("enabledTraitKey", PropertyType.str());
            builder.simpleProp("enabledDuration", PropertyType.num());
            builder.simpleProp("disabledDuration", PropertyType.num());
            builder.simpleProp("offset", PropertyType.num());
        });
    }
}
