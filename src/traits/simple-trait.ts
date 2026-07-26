import { KeyProvider } from "../key-provider";
import { PropertyConstraints } from "../properties/property-constraints";
import {
    TraitRegistryEntryBuilder,
    traitRegistryEntry,
} from "../registry/trait-registry";
import { Trait } from "../trait";
import { rectangleSurface } from "../trait-surface-provider";

export type PropValue = string | number | boolean | object | PropValue[];
export type PropsObject = Record<string, PropValue>;

export type PropsDef = {
    [key: string]: PropertyConstraints<PropValue>;
};
export type SimpleTraitConstructor<TraitType> = (new (
    props?: Record<string, PropValue>,
) => TraitType) &
    KeyProvider;
export type SimpleTraitProps<TraitType extends SimpleTrait<any>> =
    TraitType["props"];
export type SimpleTraitVolatiles<TraitType extends SimpleTrait<any>> =
    TraitType["volatiles"];
export type DefinitionsOfProps<PropsType extends PropsObject> = {
    [K in keyof PropsType]: PropertyConstraints<PropsType[K]>;
};
export type DefinitionsOf<TraitType extends SimpleTrait<any>> =
    DefinitionsOfProps<TraitType["props"]>;

export abstract class SimpleTrait<
    Props extends PropsObject = {},
    Volatiles extends PropsObject = {},
> extends Trait {
    private static readonly surfaceProvider = rectangleSurface(
        (trait, rect) => {
            rect.centerAround(trait.entity!.x, trait.entity!.y, 0, 0);
        },
    );
    readonly surfaceProvider = SimpleTrait.surfaceProvider;
    readonly queriable = true;

    readonly props: Props;
    readonly volatiles: Partial<Volatiles> = {};

    abstract definitions(): DefinitionsOfProps<Props>;

    constructor(props: Partial<Props> = {}) {
        super();

        const fullProps: any = props;
        for (const [key, constraints] of Object.entries(this.definitions())) {
            fullProps[key] ??= constraints.defaultValue();
        }
        this.props = fullProps;
    }
}

export function simpleTraitRegistryEntry<
    TraitType extends SimpleTrait<any, any>,
>(
    traitClass: SimpleTraitConstructor<TraitType>,
    expand: (builder: TraitRegistryEntryBuilder<TraitType>) => void = () => {},
) {
    return traitRegistryEntry<TraitType>((builder) => {
        builder.traitClass(traitClass);

        const dummy = new traitClass();
        for (const [key, constraint] of Object.entries(dummy.definitions())) {
            builder.property(
                key,
                constraint,

                (trait) => trait.props[key],
                (trait, value) => (trait.props[key] = value),
            );
        }
        expand(builder);
    });
}
