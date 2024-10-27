import { World } from "../world";
import { WorldEvent } from "./world-event";

export class ChangePerformed implements WorldEvent {
    apply(_: World) {}
}
