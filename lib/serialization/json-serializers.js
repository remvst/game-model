"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonSerializers = void 0;
const __1 = require("..");
const entity_1 = require("../entity");
class JsonTraitsSerializer {
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
class JsonEntitySerializer {
    constructor(traitsSerializer) {
        this.traitsSerializer = traitsSerializer;
    }
    serialize(value) {
        const serializedTraits = value.traits
            .map(trait => this.traitsSerializer.serialize(trait));
        return {
            'id': value.id,
            'x': value.x,
            'y': value.y,
            'z': value.z,
            'angle': value.angle,
            'traits': serializedTraits,
        };
    }
    deserialize(serialized) {
        const entity = new entity_1.default(serialized.id, serialized.traits.map((serializedTrait) => {
            return this.traitsSerializer.deserialize(serializedTrait);
        }));
        entity.x = serialized.x;
        entity.y = serialized.y;
        entity.z = serialized.z;
        entity.angle = serialized.angle;
        return entity;
    }
}
class JsonWorldSerializer {
    constructor(entitySerializer) {
        this.entitySerializer = entitySerializer;
    }
    serialize(value) {
        const entities = [];
        value.entities.forEach((entity) => {
            try {
                const serialized = this.entitySerializer.serialize(entity);
                entities.push(serialized);
            }
            catch (e) {
                // entity is not serializable, skip
            }
        });
        return { entities };
    }
    deserialize(serialized) {
        const world = new __1.World();
        serialized.entities.forEach(serializedEntity => {
            try {
                const entity = this.entitySerializer.deserialize(serializedEntity);
                world.entities.add(entity);
            }
            catch (e) {
                console.error('Failed to deserialize', serializedEntity, e);
            }
        });
        return world;
    }
}
function jsonSerializers() {
    const trait = new JsonTraitsSerializer();
    const entity = new JsonEntitySerializer(trait);
    const world = new JsonWorldSerializer(entity);
    return { trait, entity, world };
}
exports.jsonSerializers = jsonSerializers;
