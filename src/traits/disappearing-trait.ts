import Trait from "../trait";

export default class DisappearingTrait extends Trait {

    constructor(
        private readonly maxAge: number,
        private readonly sideEffect: ((trait: DisappearingTrait) => void) = () => {},
    ) {
        super();
        this.maxAge = maxAge;
    }

    readonly key = 'disappearing';

    cycle(_: number) {
        if (this.entity!.age >= this.maxAge) {
            this.sideEffect(this);
            this.entity!.remove();
        }
    }
}
