import { ExpansionTrait } from "../traits/expansion-trait";
import { World } from "../world";

export function firstAvailableId(world: World, id: string): string {
    if (!worldContainsId(world, id)) {
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
    while (worldContainsId(world, prefix + suffix)) suffix++;
    return prefix + suffix;
}

export function worldContainsId(world: World, id: string): boolean {
    if (world.entity(id)) return true;
    for (const expansion of world.traitsOfType(ExpansionTrait)) {
        if (worldContainsId(expansion.expansion, id)) {
            return true;
        }
    }
    return false;
}
