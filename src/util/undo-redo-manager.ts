import { Entity } from "../entity";
import { ChangePerformed } from "../events/change-performed";
import { GameModelApp } from "../game-model-app";
import { SerializationOptions } from "../serialization/serialization-options";
import { World } from "../world";
import { PrefabHelper } from "./prefab-helper";

export class UndoRedoManager {
    private stateBeforeChange: string | null = null;
    private readonly undoStack: string[] = [];
    private readonly redoStack: string[] = [];
    private performingUndoRedo = false;
    private transactionHasChange = false;
    private isInTransaction = false;

    maxStackSize = 100;

    serializationOptions = new SerializationOptions();

    constructor(
        private readonly world: World,
        private readonly app: GameModelApp,
    ) {
        this.world.entities.additions.subscribe((entity) => {
            if (this.isSerializable(entity)) {
                this.onChangePerformed();
            }
        });
        this.world.entities.removals.subscribe((entity) => {
            if (this.isSerializable(entity)) {
                this.onChangePerformed();
            }
        });
        this.world.events.subscribe((event) => {
            if (event instanceof ChangePerformed) {
                this.onChangePerformed();
            }
        });
        this.saveState();
    }

    transaction(frame: () => void) {
        if (this.isInTransaction) {
            frame();
            return;
        }

        this.isInTransaction = true;
        frame();
        this.isInTransaction = false;

        if (this.transactionHasChange) {
            this.transactionHasChange = false;
            this.saveState();
        }
    }

    private saveState() {
        if (this.isInTransaction) {
            this.transactionHasChange = true;
            return;
        }

        const serializer = this.app.serializers.verbose.world;
        const serialized = JSON.stringify(
            serializer.serialize(this.world, this.serializationOptions),
        );

        if (serialized === this.stateBeforeChange) return;

        if (this.stateBeforeChange) {
            this.undoStack.push(this.stateBeforeChange);
        }

        this.stateBeforeChange = serialized;
        this.redoStack.splice(0, this.redoStack.length);

        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
    }

    onChangePerformed() {
        if (this.performingUndoRedo) return;
        this.saveState();
    }

    undo() {
        const state = this.undoStack.pop();
        if (state) {
            this.applyState(state);
            this.redoStack.push(this.stateBeforeChange);
            this.stateBeforeChange = state;
        }
    }

    redo() {
        const state = this.redoStack.pop();
        if (state) {
            this.applyState(state);
            this.undoStack.push(this.stateBeforeChange);
            this.stateBeforeChange = state;
        }
    }

    private isSerializable(entity: Entity): boolean {
        for (const trait of entity.traits.items()) {
            const entry = this.app.traitRegistry.entry(trait.key);
            if (!entry || !entry.serializer) {
                return false;
            }
        }
        return true;
    }

    private applyState(state: string) {
        this.performingUndoRedo = true;

        const removals: Entity[] = [];
        for (const entity of this.world.entities.items()) {
            if (this.isSerializable(entity)) {
                removals.push(entity);
            }
        }

        for (const removal of removals) {
            removal.remove();
        }

        new PrefabHelper(this.app).instantiatePrefab(
            JSON.parse(state),
            this.world,
            null,
            1,
        );

        this.performingUndoRedo = false;
    }
}
