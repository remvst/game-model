import { Entity, entity } from "../../src/entity";
import { TriggerEvent } from "../../src/events/trigger-event";
import { Trait } from "../../src/trait";
import { World } from "../../src/world";
import { EventTriggerTrait } from "./../../src/traits/event-trigger-trait";

describe("event trigger trait", () => {
    let world: World;
    let player: Entity;
    let onEnterEventHolder: Entity;
    let onExitEventHolder: Entity;
    let trigger: Entity;
    let onEnterSpy: jasmine.Spy<(event: TriggerEvent, world: World) => void>;
    let onExitSpy: jasmine.Spy<(event: TriggerEvent, world: World) => void>;

    class PlayerTrait extends Trait {
        static readonly key = "player";
        readonly key = PlayerTrait.key;
    }

    beforeEach(() => {
        world = new World();

        player = entity([new PlayerTrait()]);
        world.entities.add(player);

        onEnterEventHolder = entity();
        world.entities.add(onEnterEventHolder);
        onEnterSpy = jasmine.createSpy("onEnterSpy");
        onEnterEventHolder.onEvent(TriggerEvent, onEnterSpy);

        onExitEventHolder = entity();
        world.entities.add(onExitEventHolder);
        onExitSpy = jasmine.createSpy("onExitSpy");
        onExitEventHolder.onEvent(TriggerEvent, onExitSpy);

        trigger = entity([new EventTriggerTrait()]);
        trigger.traitOfType(EventTriggerTrait)!.onEnterIds = [
            onEnterEventHolder.id,
        ];
        trigger.traitOfType(EventTriggerTrait)!.onExitIds = [
            onExitEventHolder.id,
        ];
        trigger.traitOfType(EventTriggerTrait)!.triggerTrait = PlayerTrait.key;
        trigger.traitOfType(EventTriggerTrait)!.triggerCount = Number.MAX_VALUE;
        world.entities.add(trigger);
    });

    it("will trigger onEnter when the player is inside", () => {
        world.cycle(1);

        expect(onEnterSpy).toHaveBeenCalledTimes(1);
        expect(onEnterSpy.calls.mostRecent().args[0]).toEqual(
            new TriggerEvent(player.id),
        );
        expect(onEnterSpy.calls.mostRecent().args[1]).toEqual(world);
    });

    it("will remove itself when the triggerCount is met", () => {
        trigger.traitOfType(EventTriggerTrait)!.triggerCount = 2;
        trigger.traitOfType(EventTriggerTrait)!.onExitIds = [];

        world.cycle(1);
        expect(onEnterSpy).toHaveBeenCalledTimes(1);

        player.position.x = -100;
        world.cycle(1);

        player.position.x = 0;
        world.cycle(1);
        expect(onEnterSpy).toHaveBeenCalledTimes(2);

        expect(world.entity(trigger.id)).toBeFalsy();
    });

    it("will trigger onExit when the player exits", () => {
        world.cycle(1);
        expect(onEnterSpy).toHaveBeenCalledTimes(1);
        expect(onExitSpy).toHaveBeenCalledTimes(0);

        player.position.x = -100;
        world.cycle(1);

        expect(onEnterSpy).toHaveBeenCalledTimes(1);
        expect(onExitSpy).toHaveBeenCalledTimes(1);
    });

    it("will not trigger onEnter twice when remaining inside", () => {
        world.cycle(1);
        expect(onEnterSpy).toHaveBeenCalledTimes(1);

        world.cycle(1);
        expect(onEnterSpy).toHaveBeenCalledTimes(1);
    });

    it("will trigger again when reentering", () => {
        world.cycle(1);
        player.position.x = -100;
        world.cycle(1);
        player.position.x = 0;
        world.cycle(1);

        expect(onEnterSpy).toHaveBeenCalledTimes(2);
        expect(onExitSpy).toHaveBeenCalledTimes(1);
    });

    it("will not trigger onEnter if outside", () => {
        player.position.x = -100;
        player.position.y = -100;
        world.cycle(1);

        expect(onEnterSpy).not.toHaveBeenCalled();
    });

    it("will not trigger if the trait doesnt match", () => {
        trigger.traitOfType(EventTriggerTrait)!.triggerTrait =
            "nonexistent-trait";
        world.cycle(1);

        expect(onEnterSpy).not.toHaveBeenCalled();
    });
});
