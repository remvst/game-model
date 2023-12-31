import World from "../world";

export default function firstAvailableId(world: World, id: string): string {
    if (!world.entity(id)) {
        return id;
    }

    let numberSuffixLength = 0;
    while (
        numberSuffixLength < id.length &&
        id.charAt(id.length - 1 - numberSuffixLength) >= "0" &&
        id.charAt(id.length - 1 - numberSuffixLength) <= "9"
    ) {
        numberSuffixLength++;
    }

    let suffix =
        numberSuffixLength > 0
            ? parseInt(id.slice(id.length - numberSuffixLength))
            : 1;
    const prefix = id.slice(0, id.length - numberSuffixLength);
    while (world.entity(prefix + suffix)) suffix++;
    return prefix + suffix;
}
