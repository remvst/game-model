import { Rectangle, between } from "@remvst/geometry";
import { PropertyType } from "../properties/property-constraints";
import {
    TraitRegistryEntry,
    traitRegistryEntry,
} from "../registry/trait-registry";
import Trait from "../trait";

export default class RectangleBoundTrait extends Trait {
    static readonly key = "rectangle-bound";
    readonly key = RectangleBoundTrait.key;

    readonly rectangle = new Rectangle();

    cycle(): void {
        this.entity.position.x = between(
            this.rectangle.minX,
            this.entity.position.x,
            this.rectangle.maxX,
        );
        this.entity.position.y = between(
            this.rectangle.minY,
            this.entity.position.y,
            this.rectangle.maxY,
        );
    }

    static registryEntry(): TraitRegistryEntry<RectangleBoundTrait> {
        return traitRegistryEntry((builder) => {
            builder.traitClass(RectangleBoundTrait);
            builder.property(
                "x",
                PropertyType.num(),
                (trait) => trait.rectangle.x,
                (trait, x) => (trait.rectangle.x = x),
            );
            builder.property(
                "y",
                PropertyType.num(),
                (trait) => trait.rectangle.y,
                (trait, y) => (trait.rectangle.y = y),
            );
            builder.property(
                "width",
                PropertyType.num(),
                (trait) => trait.rectangle.width,
                (trait, width) => (trait.rectangle.width = width),
            );
            builder.property(
                "height",
                PropertyType.num(),
                (trait) => trait.rectangle.height,
                (trait, height) => (trait.rectangle.height = height),
            );
        });
    }
}
