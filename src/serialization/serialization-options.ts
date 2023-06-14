export enum SerializationType {
    VERBOSE = 'vb',
    PACKED = 'pk',
}

export default class SerializationOptions {
    type: SerializationType = SerializationType.VERBOSE;
}
