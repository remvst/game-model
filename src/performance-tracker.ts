export class CyclePerformanceTracker {
    totalTime = 0;
    readonly cyclesPerTrait = new Map<string, number>();
    readonly timePerTrait = new Map<string, number>();
    readonly timePerEntity = new Map<string, number>();

    addTime(entityId: string, traitKey: string, time: number) {
        this.totalTime += time;
        this.cyclesPerTrait.set(traitKey, (this.cyclesPerTrait.get(traitKey) || 0) + 1);
        this.timePerTrait.set(traitKey, (this.timePerTrait.get(traitKey) || 0) + time);
        this.timePerEntity.set(entityId, (this.timePerEntity.get(entityId) || 0) + time);
    }
}
