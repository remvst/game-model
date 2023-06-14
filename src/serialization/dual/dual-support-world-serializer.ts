import Entity from "../../entity";
import World from "../../world";
import { WorldSetup } from "../json-serializers";
import SerializationOptions, { SerializationType } from "../serialization-options";
import { WorldSerializer } from "../serializer";

export default class DualSupportWorldSerializer implements WorldSerializer<any> {
    constructor(
        private readonly verbose: WorldSerializer<any>,
        private readonly packed: WorldSerializer<any>,
    ) {

    }

    get worldSetup(): WorldSetup {
        return this.verbose.worldSetup;
    }

    set worldSetup(worldSetup: WorldSetup) {
        this.verbose.worldSetup = worldSetup;
        this.packed.worldSetup = worldSetup;
    }

    filterAndSerialize(world: World, entityFilter: (entity: Entity) => boolean, options: SerializationOptions) {
        if (options.type === SerializationType.PACKED) {
            return this.packed.filterAndSerialize(world, entityFilter, options);
        } else {
            return this.verbose.filterAndSerialize(world, entityFilter, options);
        }
    }

    serialize(world: World, options: SerializationOptions) {
        if (options.type === SerializationType.PACKED) {
            return this.packed.serialize(world, options);
        } else {
            return this.verbose.serialize(world, options);
        }
    }

    deserialize(serialized: any, options: SerializationOptions): World {
        if (options.type === SerializationType.PACKED) {
            return this.packed.deserialize(serialized, options);
        } else {
            return this.verbose.deserialize(serialized, options);
        }
    }
}
