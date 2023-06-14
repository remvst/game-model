import Entity from "../../entity";
import World from "../../world";
import { ArrayEncoder, ArrayDecoder } from "../encoder";
import { WorldSetup } from "../json-serializers";
import SerializationOptions from "../serialization-options";
import { EntitySerializer, WorldSerializer } from "../serializer";

export class PackedWorldSerializer implements WorldSerializer<string> {

    private readonly encoder = new ArrayEncoder();
    private readonly decoder = new ArrayDecoder();
    
    constructor(
        private readonly entitySerializer: EntitySerializer<string>,
        public worldSetup: WorldSetup,
    ) {

    }

    filterAndSerialize(world: World, entityFilter: (entity: Entity) => boolean, options: SerializationOptions): string {
        this.encoder.reset();
        this.encoder.appendNumber(world.entities.size);

        for (const entity of world.entities.items()) {
            if (!entityFilter(entity)) {
                continue;
            }

            const serialized = this.entitySerializer.serialize(entity, options);
            this.encoder.appendString(serialized);
        }

        return this.encoder.getResult();
    }

    serialize(value: World, options: SerializationOptions): string {
        return this.filterAndSerialize(value, () => true, options);
    }

    deserialize(serialized: string, options: SerializationOptions): World {
        const world = new World();
        this.worldSetup(world);

        this.decoder.setEncoded(serialized);

        const entityCount = this.decoder.nextNumber();
        for (let i = 0 ; i < entityCount ; i++) {
            const serializedEntity = this.decoder.nextString();
            const entity = this.entitySerializer.deserialize(serializedEntity, options);
            world.entities.add(entity);
        }

        return world;
    }

}
