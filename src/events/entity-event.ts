import { World } from "../world";

export interface EntityEvent {}

export type EntityEventConstructor<T extends EntityEvent> = new (
    ...params: any
) => T;
export type EntityEventListener<T extends EntityEvent> = (
    event: T,
    world: World,
) => void;
