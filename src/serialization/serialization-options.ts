import Entity from "../entity";

export enum SerializationType {
    VERBOSE = 'vb',
    PACKED = 'pk',
}

export default class SerializationOptions {
    type: SerializationType = SerializationType.VERBOSE;
    shouldSerializeEntity: (entity: Entity) => boolean = () => true;
}
