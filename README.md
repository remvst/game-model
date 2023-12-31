# game-model

A minimalistic game engine built for TypeScript.

The engine provides ways to manage a world, entities, and events. It also provides utilities to serialize worlds so it can be used for saving levels and synchronizing multiplayer gameplay.

It does NOT provide any rendering, sound, physics, controls... **It is up to the developer to build them.**

## Simplistic Example

```typescript
class PlayerTrait {
    static readonly key = "player";
    readonly key = PlayerTrait.key;

    cycle(elapsed: number) {
        this.entity.position.x += elapsed * 50; // move to the right at 50px/s
    }
}

const world = new World();

// Add a player to the world
const player = new Entity(undefined, [new PlayerTrait()]);
player.position.x = 100;
player.position.y = 50;
world.entities.add(player);

world.cycle(1); // advance world clock by 1s

console.log(player.position.x, player.position.y); // 150,50
```

## Full app example

```typescript
class PlayerTrait {
    static readonly key = "player";
    readonly key = PlayerTrait.key;

    speed = 0;

    cycle(elapsed: number) {
        this.entity.position.x += elapsed * this.speed;
    }

    static registryEntry(app: GameModelApp): TraitRegistryEntry<PlayerTrait> {
        return traitRegistryEntry((builder) => {
            builder.traitClass(PlayerTrait);
            builder.simpleProp("speed", PropertyTypes.num());
        });
    }
}

// Singleton app object
const app = new GameModelApp();
app.traitRegistry.add(PlayerTrait.registryEntry(app));
app.finalize();

// ...
const world = new World();

// Add a player to the world
const player = new Entity(undefined, [new PlayerTrait()]);
player.position.x = 100;
player.position.y = 50;
world.entities.add(player);

const serializationOptions = new SerializationOptions();

// Serialize the world
const serializedWorld = app.serializers.world.serialize(
    world,
    serializationOptions,
);
saveToFile();

// Deserialize the world
const deserializedWorld = app.serializers.world.deserialize(
    serializedWorld,
    serializationOptions,
);
```
