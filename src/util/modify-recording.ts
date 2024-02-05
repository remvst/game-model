import GameModelApp from "../game-model-app";
import { FullAuthority } from "../multiplayer/authority";
import WorldUpdatesCollector from "../multiplayer/world-updates-collector";
import WorldUpdatesReceiver from "../multiplayer/world-updates-receiver";
import RecordedFrame from "../recording/recorded-frame";
import ReplayerAuthority from "../recording/replayer-authority";
import SerializationOptions from "../serialization/serialization-options";
import World from "../world";

export function modifyRecording(
    app: GameModelApp,
    frames: RecordedFrame[],
    serializationOptions: SerializationOptions,
    modifyFrame: (world: World) => void,
): RecordedFrame[] {
    const newFrames: RecordedFrame[] = [];

    const world = new World();
    world.authority = new FullAuthority();

    for (const frame of frames) {
        const receiver = new WorldUpdatesReceiver(
            app,
            world,
            serializationOptions,
        );

        const collector = new WorldUpdatesCollector(
            app,
            world,
            serializationOptions,
        );
        collector.authorityOverride = new FullAuthority();
        collector.start();

        world.cycle(frame.age);

        const initialAuthority = world.authority;
        try {
            world.authority = new ReplayerAuthority();
            receiver.applyUpdate(frame.worldUpdate, "", new FullAuthority());
        } finally {
            world.authority = initialAuthority;
        }

        modifyFrame(world);

        newFrames.push({
            age: frame.age,
            worldUpdate: collector.generateUpdate(),
        });
    }

    return newFrames;
}
