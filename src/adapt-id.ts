export default function adaptId(originalId: string, triggererId: string): string {
    if (originalId === '_triggerer') {
        return triggererId;
    }
    return originalId;
};
