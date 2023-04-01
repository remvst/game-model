import Entity from "../entity";
import { WorldEvent } from "../events/world-event";

export enum AuthorityType {
    NONE,
    LOCAL,
    FULL,
}

export interface Authority {
    entityAuthority(entity: Entity): AuthorityType;
    worldEventAuthority(event: WorldEvent): AuthorityType;
}

export class LocalAuthority implements Authority {
    entityAuthority(): AuthorityType {
        return AuthorityType.LOCAL;
    }

    worldEventAuthority(): AuthorityType {
        return AuthorityType.LOCAL;
    }
}