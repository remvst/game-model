import Entity from "../entity";
import { EntityEvent } from "../events/entity-event";
import { WorldEvent } from "../events/world-event";

export enum AuthorityType {
    NONE,
    LOCAL,
    FORWARD,
    FULL,
}

export interface Authority {
    entityAuthority(entity: Entity): AuthorityType;
    worldEventAuthority(event: WorldEvent): AuthorityType;
    entityEventAuthority(event: EntityEvent, entity: Entity): AuthorityType;
    determinesRemoval(entity: Entity, fromPlayerId: string): boolean;
    maxUpdateInterval(entity: Entity): number;
}

export class LocalAuthority implements Authority {
    entityAuthority(): AuthorityType {
        return AuthorityType.LOCAL;
    }

    worldEventAuthority(): AuthorityType {
        return AuthorityType.LOCAL;
    }

    entityEventAuthority(): AuthorityType {
        return AuthorityType.LOCAL;
    }

    determinesRemoval(): boolean {
        return true;
    }

    maxUpdateInterval(entity: Entity): number {
        return 0;
    }
}

export class FullAuthority implements Authority {
    entityAuthority(): AuthorityType {
        return AuthorityType.FULL;
    }

    worldEventAuthority(): AuthorityType {
        return AuthorityType.FULL;
    }

    entityEventAuthority(): AuthorityType {
        return AuthorityType.FULL;
    }

    determinesRemoval(): boolean {
        return true;
    }

    maxUpdateInterval(entity: Entity): number {
        return 0;
    }
}