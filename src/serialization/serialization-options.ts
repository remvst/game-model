export enum SerializationType {
    VERBOSE,
    PACKED,
}

export default class SerializationOptions {
    type: SerializationType = SerializationType.VERBOSE;
}
