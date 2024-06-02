import { World } from "../world";

export interface WorldEvent {
    apply(world: World): void;
}
