import { entity } from "../../src/entity";
import { TriggerEvent } from "../../src/events/trigger-event";
import { ExpansionTrait } from "../../src/traits/expansion-trait";
import { vector3 } from "../../src/vector3";
import { World } from "../../src/world";

describe("expansion trait", () => {
    let world: World;

    beforeEach(() => {
        world = new World();
    });

    it("will remove entities from their world", () => {
        const expansionEntity = entity("expansion", [new ExpansionTrait()]);
        world.entities.add(expansionEntity);

        const expanded1 = entity("expanded1", []);
        expansionEntity
            .traitOfType(ExpansionTrait)
            ?.addExpandedEntity(expanded1);

        expect(expanded1.world).toBe(
            expansionEntity.traitOfType(ExpansionTrait)!.expansion,
        );
    });

    it("will add entities again when triggered", () => {
        const expansionEntity = entity("expansion", [new ExpansionTrait()]);
        world.entities.add(expansionEntity);

        const expanded1 = entity("expanded1", []);
        expansionEntity
            .traitOfType(ExpansionTrait)
            ?.addExpandedEntity(expanded1);

        expansionEntity.addEvent(new TriggerEvent(null));

        expect(expanded1.world).toBe(world);
    });

    it("will add entities relative to their expansion", () => {
        const expansionEntity = entity("expansion", [new ExpansionTrait()]);
        expansionEntity.position.x = 10;
        expansionEntity.position.y = 20;
        world.entities.add(expansionEntity);

        const expanded1 = entity("expanded1", []);
        expanded1.position.x = 5;
        expanded1.position.y = 10;
        expansionEntity
            .traitOfType(ExpansionTrait)
            ?.addExpandedEntity(expanded1);

        expansionEntity.position.x = 200;
        expansionEntity.position.y = 300;

        expansionEntity.addEvent(new TriggerEvent(null));

        expect(expanded1.position).toEqual(vector3(195, 290, 0));
    });

    it("will manage to add entities with conflicting IDs", () => {
        const expansionEntity = entity("expansion", [new ExpansionTrait()]);
        expansionEntity.position.x = 10;
        expansionEntity.position.y = 20;
        world.entities.add(expansionEntity);

        const expandedPlayer = entity("player", []);
        expandedPlayer.position.x = 5;
        expandedPlayer.position.y = 10;
        expansionEntity
            .traitOfType(ExpansionTrait)
            ?.addExpandedEntity(expandedPlayer);

        const player = entity("player", []);
        world.entities.add(player);

        expansionEntity.addEvent(new TriggerEvent(null));

        expect(world.entity("player")).toBe(player);
        expect(world.entity("player1")).toBe(expandedPlayer);
    });
});
