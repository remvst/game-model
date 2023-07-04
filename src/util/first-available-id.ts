import World from "../world";

export default function firstAvailableId(world: World, id: string): string {
    if (!world.entity(id)) {
        return id;
    }

    let suffix = 1;
    while (world.entity(id + suffix)) suffix++;
    return id + suffix;
}
