import GameModelApp from "../game-model-app";
import { Property } from "../properties/properties";
import { PropertyType } from "../properties/property-constraints";
import { RegistryEntry, traitRegistryEntry } from "../registry/trait-registry";
import { AnySerialized, TraitSerializer } from "../serialization/serializer";
import Trait from "../trait";

export default class InterpolatorTrait extends Trait {
    static readonly key = 'mover';
    readonly key = InterpolatorTrait.key;
    readonly disableChunking = true;

    constructor(
        public targetEntityId: string = '',
        public property: Property<number> = null,
        public fromValue: number = 0,
        public toValue: number = 0,
        public duration: number = 0,
    ) {
        super();
    }

    cycle(_: number) {
        if (!this.property) return;

        const ratio = Math.min(1, this.entity!.age / this.duration);

        const targetEntity = this.entity!.world!.entity(this.targetEntityId);
        if (!targetEntity) {
            this.entity!.remove();
            return;
        }

        const newValue = ratio * (this.toValue - this.fromValue) + this.fromValue;
        this.property.set(targetEntity, newValue);

        if (ratio >= 1) {
            this.entity!.remove();
        }
    }

    static registryEntry(app: GameModelApp): RegistryEntry<InterpolatorTrait> {
        return traitRegistryEntry(builder => {
            builder.traitClass(InterpolatorTrait);
            builder.simpleProp('targetEntityId', PropertyType.id());
            builder.property('property', PropertyType.str(), (trait) => trait.property.identifier, (trait, property) => trait.property = app.propertyRegistry.entry(property));
            builder.simpleProp('fromValue', PropertyType.num());
            builder.simpleProp('toValue', PropertyType.num());
            builder.simpleProp('duration', PropertyType.num());
        });
    }
}
