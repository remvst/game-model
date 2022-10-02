"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonSerializers = void 0;
const entity_1 = require("../entity");
const world_1 = require("../world");
const composite_serializer_1 = require("./composite-serializer");
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
        const world = new world_1.default();
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
    const trait = new composite_serializer_1.default();
    const entity = new JsonEntitySerializer(trait);
    const world = new JsonWorldSerializer(entity);
    const worldEvent = new composite_serializer_1.default();
    return { trait, entity, world, worldEvent };
}
exports.jsonSerializers = jsonSerializers;
