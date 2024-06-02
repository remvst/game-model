import { Entity } from "./entity";
import { EntityGroupTrait } from "./traits/entity-group-trait";
import { World } from "./world";

export const TRIGGERER_ID = "_triggerer";
export const TRAIT_PREFIX = "trait:";
export const GROUP_PREFIX = "group:";

export function adaptId(
    originalId: string,
    triggererId: string,
    world: World,
): string {
    if (originalId === TRIGGERER_ID) {
        return triggererId;
    }

    // This causes issues, check if still needed
    // if (originalId?.startsWith(TRAIT_PREFIX)) {
    //     const traitKey = originalId.slice(TRAIT_PREFIX.length);
    //     for (const entity of world.entities.bucket(traitKey)) {
    //         return entity.id;
    //     }
    // }

    return originalId;
}

export function* resolveIds(
    originalId: string,
    triggererId: string,
    world: World,
): Iterable<Entity> {
    if (originalId === TRIGGERER_ID) {
        const triggerer = world.entity(triggererId);
        if (triggerer) {
            yield triggerer;
        }
        return;
    }

    if (originalId?.startsWith(TRAIT_PREFIX)) {
        const traitKey = originalId.slice(TRAIT_PREFIX.length);
        for (const entity of world.entities.bucket(traitKey)) {
            yield entity;
        }
        return;
    }

    if (originalId?.startsWith(GROUP_PREFIX)) {
        const groupId = originalId.slice(GROUP_PREFIX.length);
        const groupTrait = world.entity(groupId)?.traitOfType(EntityGroupTrait);
        if (groupTrait) {
            yield* groupTrait.entities(world);
        }
        return;
    }

    const entity = world.entity(originalId);
    if (entity) {
        yield entity;
    }
    return;
}
