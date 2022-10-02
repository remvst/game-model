"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CompositeSerializer {
    constructor() {
        this.serializers = new Map();
    }
    add(key, serializer) {
        this.serializers.set(key, serializer);
        return this;
    }
    serialize(value) {
        const serializer = this.serializers.get(value.key);
        if (!serializer) {
            throw new Error(`Cannot serialize trait ${value.key}`);
        }
        return {
            'key': value.key,
            'data': serializer.serialize(value),
        };
    }
    deserialize(value) {
        const serializer = this.serializers.get(value.key);
        if (!serializer) {
            throw new Error(`Cannot deserialize trait ${value.key}`);
        }
        return serializer.deserialize(value.data);
    }
}
exports.default = CompositeSerializer;
