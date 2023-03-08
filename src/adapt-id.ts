import World from "./world";

export const TRIGGERER_ID = '_triggerer';
export const TRAIT_PREFIX = 'trait:';

export default function adaptId(originalId: string, triggererId: string, world: World): string {
    if (originalId === TRIGGERER_ID) {
        return triggererId;
    }

    if (originalId?.startsWith(TRAIT_PREFIX)) {
        const traitKey = originalId.slice(TRAIT_PREFIX.length);
        for (const entity of world.entities.bucket(traitKey)) {
            return entity.id;
        }
    }

    return originalId;
};
