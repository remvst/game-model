# game-model

A minimalistic game engine built for TypeScript.

The engine provides ways to manage a world, entities, and events. It also provides utilities to serialize worlds so it can be used for saving levels and synchronizing multiplayer gameplay.

It does not provide physics, nor utilities to move the entities around. It is up to the developer to implement them by providing traits.

## Example

```typescript
class GoRightTrait {
    static readonly key = 'go-right';
    readonly key = GoRightTrait.key;

    cycle(elapsed: number) {
        this.entity.position.x += elapsed * 50; // move to the right at 50px/s
    }
}

const world = new World();

const player = new Entity(undefined, [
    new GoRightTrait(),
]);
player.position.x = 100;
player.position.y = 50;
world.entities.add(player);

world.cycle(1); // advance world clock by 1s

console.log(player.position.x, player.position.y); // 150,50
```