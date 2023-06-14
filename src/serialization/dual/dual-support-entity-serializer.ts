import Trait from '../../trait';
import { EntitySerializer } from '../serializer';
import SerializationOptions, { SerializationType } from '../serialization-options';
import Entity from '../../entity';

export default class DualSupportEntitySerializer implements EntitySerializer<any> {

    constructor(
        private readonly verbose: EntitySerializer<any>,
        private readonly packed: EntitySerializer<string>,
    ) {
        
    }

    serialize(entity: Entity, options: SerializationOptions): any {
        if (options.type === SerializationType.PACKED) {
            return this.packed.serialize(entity, options);
        } else {
            return this.verbose.serialize(entity, options);
        }
    }

    deserialize(serialized: any, options: SerializationOptions): Entity {
        if (options.type === SerializationType.PACKED) {
            return this.packed.deserialize(serialized, options);
        } else {
            return this.verbose.deserialize(serialized, options);
        }
    }
}
