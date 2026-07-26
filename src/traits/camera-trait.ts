import { Animation } from "@remvst/animate.js";
import {
    Rectangle,
    Vector2,
    isBetween,
    roundToNearest,
} from "@remvst/geometry";
import { PropertyType } from "../properties/property-constraints";
import { RegistryEntry } from "../registry/trait-registry";
import {
    DefinitionsOfProps,
    SimpleTrait,
    simpleTraitRegistryEntry,
} from "./simple-trait";

export class CameraTrait extends SimpleTrait<{
    width: number;
    height: number;
    zoom: number;
    rounding: number;
}> {
    static readonly key = "camera";
    readonly key = CameraTrait.key;
    readonly disableChunking = true;

    private readonly reusableCameraRectangle = new Rectangle(0, 0, 0, 0);
    private readonly reusablePositionOnScreen = new Vector2();

    private zoomAnimation: Animation<CameraTrait["props"]>;

    constructor(props: Partial<CameraTrait["props"]> = {}) {
        props.width ??= 400;
        props.height ??= 400;
        props.zoom ??= 1;
        super(props);
    }

    definitions(): DefinitionsOfProps<CameraTrait["props"]> {
        return {
            width: PropertyType.num(),
            height: PropertyType.num(),
            zoom: PropertyType.num(),
            rounding: PropertyType.num(),
        };
    }

    zoomTo(zoom: number, duration: number) {
        this.zoomAnimation = null;

        if (duration <= 0) {
            this.props.zoom = zoom;
            return;
        }

        this.zoomAnimation = new Animation(this.props)
            .interp("zoom", this.props.zoom, zoom)
            .during(duration);
    }

    get visibleRectangle(): Rectangle {
        let { x, y } = this.entity.position;
        if (this.props.rounding > 0) {
            x = roundToNearest(x, this.props.rounding);
            y = roundToNearest(y, this.props.rounding);
        }

        this.reusableCameraRectangle.centerAround(
            x,
            y,
            this.props.width / this.props.zoom,
            this.props.height / this.props.zoom,
        );
        return this.reusableCameraRectangle;
    }

    isVisible(point: Vector2, margin: number): boolean {
        return (
            isBetween(
                this.entity.x - this.props.width / 2 - margin,
                point.x,
                this.entity.x + this.props.width / 2 + margin,
            ) &&
            isBetween(
                this.entity.y - this.props.height / 2 - margin,
                point.y,
                this.entity.y + this.props.height / 2 + margin,
            )
        );
    }

    cycle(elapsed: number) {
        this.zoomAnimation?.cycle(elapsed);
        if (this.zoomAnimation?.finished) {
            this.zoomAnimation = null;
        }
    }

    positionOnScreen(x: number, y: number): Vector2 {
        const { visibleRectangle } = this;
        this.reusablePositionOnScreen.x =
            (x - visibleRectangle.x) * this.props.zoom;
        this.reusablePositionOnScreen.y =
            (y - visibleRectangle.y) * this.props.zoom;
        return this.reusablePositionOnScreen;
    }

    static registryEntry(): RegistryEntry<CameraTrait> {
        return simpleTraitRegistryEntry(CameraTrait);
    }
}
