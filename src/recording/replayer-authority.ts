import Entity from "../entity";
import { EntityEvent } from "../events/entity-event";
import { WorldEvent } from "../events/world-event";
import { Authority, AuthorityType } from "../multiplayer/authority";

export default class ReplayerAuthority implements Authority {
    entityAuthority(entity: Entity): AuthorityType {
        return AuthorityType.NONE;
    }

    worldEventAuthority(event: WorldEvent): AuthorityType {
        return AuthorityType.NONE;
    }

    entityEventAuthority(event: EntityEvent, entity: Entity): AuthorityType {
        return AuthorityType.NONE;
    }

    determinesRemoval(entity: Entity, fromPlayerId: string): boolean {
        return false;
    }

    maxUpdateInterval(entity: Entity): number {
        return AuthorityType.NONE;
    }

}