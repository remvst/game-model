import {
    Authority,
    AuthorityType,
    Entity,
    GameModelApp,
    LocalAuthority,
    Remove,
    SerializationOptions,
    World,
} from "../../src";
import WorldUpdatesReceiver from "../../src/multiplayer/world-updates-receiver";

describe("a world updates receiver", () => {
    let world: World;
    let app: GameModelApp;
    let helper: WorldUpdatesReceiver;
    let authority: Authority;
    let remoteAuthority: Authority;

    beforeEach(() => {
        app = new GameModelApp();
        app.worldEventRegistry.add(Remove.registryEntry());
        app.finalize();

        authority = new LocalAuthority();
        remoteAuthority = new LocalAuthority();
        world = new World();
        world.authority = authority;

        helper = new WorldUpdatesReceiver(
            app,
            world,
            new SerializationOptions(),
        );
    });

    it("will create remotely added entities if it has no authority over them", () => {
        spyOn(authority, "entityAuthority").and.returnValue(AuthorityType.NONE);

        helper.applyUpdate(
            {
                entities: [
                    app.serializers.packed.entity.serialize(
                        new Entity("myentity", []),
                        new SerializationOptions(),
                    ),
                ],
            },
            "",
            remoteAuthority,
        );

        expect(world.entity("myentity")).toBeTruthy();
    });

    it("will copy remote entities if it has no authority over them if they already exist", () => {
        const localEntity = new Entity("myentity", []);
        spyOn(localEntity, "copy");
        world.entities.add(localEntity);

        spyOn(authority, "entityAuthority").and.returnValue(AuthorityType.NONE);

        helper.applyUpdate(
            {
                entities: [
                    app.serializers.packed.entity.serialize(
                        new Entity("myentity", []),
                        new SerializationOptions(),
                    ),
                ],
            },
            "",
            remoteAuthority,
        );

        expect(localEntity.copy).toHaveBeenCalledWith(jasmine.any(Entity), app);
    });

    it("will remove entities that were previously received but aren't anymore", () => {
        spyOn(authority, "entityAuthority").and.returnValue(AuthorityType.NONE);

        const localEntity = new Entity("myentity", []);
        spyOn(localEntity, "copy");
        world.entities.add(localEntity);

        helper.applyUpdate(
            {
                entities: [
                    app.serializers.packed.entity.serialize(
                        new Entity("myentity", []),
                        new SerializationOptions(),
                    ),
                ],
            },
            "",
            remoteAuthority,
        );
        expect(world.entities.size).toBe(1);

        helper.applyUpdate({}, "", remoteAuthority);
        expect(world.entities.size).toBe(0);
    });

    it("will not remove entities that are in the short list", () => {
        spyOn(authority, "entityAuthority").and.returnValue(AuthorityType.NONE);

        const localEntity = new Entity("myentity", []);
        spyOn(localEntity, "copy");
        world.entities.add(localEntity);

        helper.applyUpdate(
            {
                entities: [
                    app.serializers.packed.entity.serialize(
                        new Entity("myentity", []),
                        new SerializationOptions(),
                    ),
                ],
            },
            "",
            remoteAuthority,
        );
        expect(world.entities.size).toBe(1);

        helper.applyUpdate(
            {
                shortEntities: ["myentity"],
            },
            "",
            remoteAuthority,
        );
        expect(world.entities.size).toBe(1);
    });

    it("will not copy entities if it has authority over them", () => {
        spyOn(authority, "entityAuthority").and.returnValue(AuthorityType.FULL);

        helper.applyUpdate(
            {
                entities: [
                    app.serializers.packed.entity.serialize(
                        new Entity("myentity", []),
                        new SerializationOptions(),
                    ),
                ],
            },
            "",
            remoteAuthority,
        );

        expect(world.entities.size).toBe(0);
    });

    it("will not apply events if it has authority over them", () => {
        spyOn(authority, "worldEventAuthority").and.returnValue(
            AuthorityType.FULL,
        );

        const eventSpy = jasmine.createSpy();
        world.events.subscribe(eventSpy);

        helper.applyUpdate(
            {
                worldEvents: [
                    app.serializers.packed.worldEvent.serialize(
                        new Remove("removedentity"),
                        new SerializationOptions(),
                    ),
                ],
            },
            "",
            remoteAuthority,
        );

        expect(eventSpy).not.toHaveBeenCalled();
    });

    it("will apply events if it has no authority over them", () => {
        spyOn(authority, "worldEventAuthority").and.returnValue(
            AuthorityType.NONE,
        );

        const eventSpy = jasmine.createSpy();
        world.events.subscribe(eventSpy);

        helper.applyUpdate(
            {
                worldEvents: [
                    app.serializers.packed.worldEvent.serialize(
                        new Remove("removedentity"),
                        new SerializationOptions(),
                    ),
                ],
            },
            "",
            remoteAuthority,
        );

        expect(eventSpy).toHaveBeenCalled();
    });
});
