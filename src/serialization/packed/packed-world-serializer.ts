import World from "../../world";
import { WorldSetup } from "../all-serializers";
import { ArrayDecoder, ArrayEncoder, EncoderSequence } from "../encoder";
import SerializationOptions from "../serialization-options";
import { EntitySerializer, WorldSerializer } from "../serializer";

export class PackedWorldSerializer implements WorldSerializer<EncoderSequence> {
    private readonly encoder = new ArrayEncoder();
    private readonly decoder = new ArrayDecoder();

    worldSetup: WorldSetup = () => {};

    constructor(
        private readonly entitySerializer: EntitySerializer<EncoderSequence>,
    ) {}

    serialize(world: World, options: SerializationOptions): EncoderSequence {
        this.encoder.reset();

        const ids = new Set<string>();

        for (const entity of world.entities.items()) {
            if (options.shouldSerializeEntity(entity)) {
                ids.add(entity.id);
            }
        }

        this.encoder.appendNumber(ids.size);

        for (const id of ids) {
            const serialized = this.entitySerializer.serialize(
                world.entity(id),
                options,
            );
            this.encoder.appendSequence(serialized);
        }

        return this.encoder.getResult();
    }

    deserialize(
        serialized: EncoderSequence,
        options: SerializationOptions,
    ): World {
        const world = new World();
        this.worldSetup(world);

        this.decoder.setEncoded(serialized);

        const entityCount = this.decoder.nextNumber();
        for (let i = 0; i < entityCount; i++) {
            const serializedEntity = this.decoder.nextSequence();
            const entity = this.entitySerializer.deserialize(
                serializedEntity,
                options,
            );
            world.entities.add(entity);
        }

        return world;
    }
}
