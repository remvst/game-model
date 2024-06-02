import { Animation } from "@remvst/animate.js";
import {
    Rectangle,
    Vector2,
    isBetween,
    roundToNearest,
} from "@remvst/geometry";
import { PropertyType } from "../properties/property-constraints";
import {
    TraitRegistryEntry,
    traitRegistryEntry,
} from "../registry/trait-registry";
import { Trait } from "../trait";

export class CameraTrait extends Trait {
    static readonly key = "camera";
    readonly key = CameraTrait.key;
    readonly disableChunking = true;

    private readonly reusableCameraRectangle = new Rectangle(0, 0, 0, 0);
    private readonly reusablePositionOnScreen = new Vector2();

    width = 400;
    height = 400;
    zoom = 1;
    rounding = 0;

    private zoomAnimation: Animation<CameraTrait>;

    zoomTo(zoom: number, duration: number) {
        this.zoomAnimation = null;

        if (duration <= 0) {
            this.zoom = zoom;
            return;
        }

        this.zoomAnimation = new Animation(this)
            .interp("zoom", this.zoom, zoom)
            .during(duration);
    }

    get visibleRectangle(): Rectangle {
        let { x, y } = this.entity.position;
        if (this.rounding > 0) {
            x = roundToNearest(x, this.rounding);
            y = roundToNearest(y, this.rounding);
        }

        this.reusableCameraRectangle.centerAround(
            x,
            y,
            this.width / this.zoom,
            this.height / this.zoom,
        );
        return this.reusableCameraRectangle;
    }

    isVisible(point: Vector2, margin: number): boolean {
        return (
            isBetween(
                this.entity.x - this.width / 2 - margin,
                point.x,
                this.entity.x + this.width / 2 + margin,
            ) &&
            isBetween(
                this.entity.y - this.height / 2 - margin,
                point.y,
                this.entity.y + this.height / 2 + margin,
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
        this.reusablePositionOnScreen.x = (x - visibleRectangle.x) * this.zoom;
        this.reusablePositionOnScreen.y = (y - visibleRectangle.y) * this.zoom;
        return this.reusablePositionOnScreen;
    }

    static registryEntry(): TraitRegistryEntry<CameraTrait> {
        return traitRegistryEntry((builder) => {
            builder.traitClass(CameraTrait);
            builder.simpleProp("zoom", PropertyType.num());
        });
    }
}
