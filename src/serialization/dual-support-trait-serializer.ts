import Trait from '../trait';
import { RegistryEntry } from '../registry/trait-registry';
import { TraitSerializer } from './serializer';
import PackedTraitSerializer from './packed-trait-serializer';
import AutomaticTraitSerializer from './automatic-trait-serializer';

interface SerializedJson {
    [key: string]: any;
}

type Serialized = SerializedJson | string;

export default class DualSupportTraitSerializer<T extends Trait> implements TraitSerializer<T, Serialized> {

    private readonly json = new AutomaticTraitSerializer(this.registryEntry);
    private readonly packed = new PackedTraitSerializer(this.registryEntry);

    constructor(private readonly registryEntry: RegistryEntry<T>) {

    }

    serialize(trait: Trait): Serialized {
        return this.packed.serialize(trait);
    }

    deserialize(serialized: Serialized): T {
        if (typeof serialized === 'string') {
            return this.packed.deserialize(serialized);
        }

        return this.json.deserialize(serialized);
    }
}
