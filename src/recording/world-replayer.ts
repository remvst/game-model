import GameModelApp from "../game-model-app";
import { FullAuthority } from "../multiplayer/authority";
import WorldUpdatesReceiver from "../multiplayer/world-updates-receiver";
import SerializationOptions, {
    SerializationType,
} from "../serialization/serialization-options";
import World from "../world";
import RecordedFrame from "./recorded-frame";
import ReplayerAuthority from "./replayer-authority";

export default class WorldReplayer {
    readonly options = (() => {
        const options = new SerializationOptions();
        options.type = SerializationType.PACKED;
        options.includeEntityAges = true;
        return options;
    })();

    private readonly updatesReceiver = new WorldUpdatesReceiver(
        this.app,
        this.world,
        this.options,
    );
    private readonly recorderAuthority = new FullAuthority();
    private readonly replayerAuthority = new ReplayerAuthority();

    age = 0;
    duration = this.frames[this.frames.length - 1]?.age || 0;

    constructor(
        private readonly app: GameModelApp,
        private readonly world: World,
        private readonly frames: RecordedFrame[],
    ) {}

    cycle(elapsed: number) {
        this.age += elapsed;
        while (this.frames[0] && this.age >= this.frames[0].age) {
            const frame = this.frames.shift();

            const authorityBefore = this.world.authority;
            try {
                this.world.authority = this.replayerAuthority;
                this.updatesReceiver.applyUpdate(
                    frame.worldUpdate,
                    "",
                    this.recorderAuthority,
                );
            } finally {
                this.world.authority = authorityBefore;
            }
        }
    }
}
