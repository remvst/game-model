import { Property } from "../properties/properties";
import Trait from "../trait";

export default class InterpolatorTrait extends Trait {
    static readonly key = 'mover';
    readonly key = InterpolatorTrait.key;
    readonly disableChunking = true;

    constructor(
        readonly targetEntityId: string,
        private readonly property: Property<number>,
        private readonly fromValue: number,
        private readonly toValue: number,
        private readonly duration: number,
    ) {
        super();
    }

    cycle(_: number) {
        const ratio = Math.min(1, this.entity!.age / this.duration);

        const targetEntity = this.entity!.world!.entity(this.targetEntityId);
        if (!targetEntity) {
            this.entity!.remove();
            return;
        }

        const newValue = ratio * (this.toValue - this.fromValue) + this.fromValue;
        this.property.set(targetEntity, newValue);

        if (ratio >= 1) {
            this.entity!.remove();
        }
    }
}
