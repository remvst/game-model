import Trait from "../trait";
import World from "../world";

export default class DelayedActionTrait extends Trait {
    static readonly key = 'delayed-action';
    readonly key = DelayedActionTrait.key;
    readonly disableChunking = true;

    constructor(
        private delay: number,
        private readonly action: (world: World) => void,
    ) {
        super();
    }

    cycle(elapsed: number) {
        this.delay -= elapsed;
        if (this.delay <= 0) {
            const { world } = this.entity!;
            this.entity!.remove();
            this.action(world!);
        }
    }
}
