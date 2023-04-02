import Entity from "../entity";
import { WorldEvent } from "../events/world-event";

export enum AuthorityType {
    NONE,
    LOCAL,
    CREATE,
    FULL,
}

export interface Authority {
    entityAuthority(entity: Entity): AuthorityType;
    worldEventAuthority(event: WorldEvent): AuthorityType;
    determinesRemoval(entity: Entity): boolean;
}

export class LocalAuthority implements Authority {
    entityAuthority(): AuthorityType {
        return AuthorityType.LOCAL;
    }

    worldEventAuthority(): AuthorityType {
        return AuthorityType.LOCAL;
    }

    determinesRemoval(): boolean {
        return true;
    }
}