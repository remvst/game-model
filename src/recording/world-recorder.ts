import { GameModelApp } from "../game-model-app";
import { Authority } from "../multiplayer/authority";
import { WorldUpdatesCollector } from "../multiplayer/world-updates-collector";
import {
    SerializationOptions,
    SerializationType,
} from "../serialization/serialization-options";
import { World } from "../world";
import { RecordedFrame } from "./recorded-frame";

export class WorldRecorder {
    readonly options = (() => {
        const options = new SerializationOptions();
        options.type = SerializationType.VERBOSE;
        options.includeEntityAges = true;
        return options;
    })();

    readonly frames: RecordedFrame[] = [];
    private nextFrame = 0;
    private age = 0;
    private recording = false;

    private readonly updatesCollector = new WorldUpdatesCollector(
        this.app,
        this.world,
        this.options,
    );

    constructor(
        private readonly app: GameModelApp,
        private readonly world: World,
        private readonly frameInterval: number,
        private readonly recorderAuthority: Authority,
    ) {
        this.world.authority = this.recorderAuthority;
        this.updatesCollector.stop();
    }

    start() {
        if (this.recording) return;
        this.recording = true;
        this.nextFrame = 0;
        this.updatesCollector.start();
    }

    pause() {
        if (!this.recording) return;
        this.recording = false;
        this.updatesCollector.stop();
    }

    reset() {
        this.age = 0;
        this.nextFrame = 0;
        this.frames.splice(0, this.frames.length);
    }

    cycle(elapsed: number) {
        this.age += elapsed;

        if (!this.recording) return;

        this.nextFrame -= elapsed;
        if (this.nextFrame <= 0) {
            this.nextFrame = this.frameInterval;

            const update = this.updatesCollector.generateUpdate();
            this.frames.push(new RecordedFrame(this.age, update));
        }
    }
}
