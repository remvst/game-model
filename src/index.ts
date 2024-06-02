import adaptId, { resolveIds } from "./adapt-id";
import ObjectSet from "./collections/object-set";
import WatchableObjectSet from "./collections/watchable-object-set";
import entityConfigurable from "./configurable/entity-configurable";
import { EntityFilter, EntityFilters } from "./configurable/entity-filter";
import EntityIdConfigurable from "./configurable/entity-id-configurable";
import Entity, { entity } from "./entity";
import { EntityEvent } from "./events/entity-event";
import EntityEventProcessed from "./events/entity-event-processed";
import EntityRemoved from "./events/entity-removed";
import EntitySelectionRequested from "./events/entity-selection-requested";
import InterpolateProperty from "./events/interpolate-property";
import MoveTo from "./events/move-to";
import Remove from "./events/remove";
import SetProperty from "./events/set-property";
import Shift from "./events/shift";
import Trigger from "./events/trigger";
import TriggerEvent from "./events/trigger-event";
import { WorldEvent } from "./events/world-event";
import GameModelApp from "./game-model-app";
import { KeyProvider } from "./key-provider";
import {
    Authority,
    AuthorityType,
    FullAuthority,
    LocalAuthority,
} from "./multiplayer/authority";
import Room, { Player } from "./multiplayer/room";
import { WorldUpdate } from "./multiplayer/world-update";
import WorldUpdatesCollector from "./multiplayer/world-updates-collector";
import WorldUpdatesReceiver from "./multiplayer/world-updates-receiver";
import { CyclePerformanceTracker } from "./performance-tracker";
import {
    GenericProperty,
    Property,
    getSet,
    traitGetSet,
    worldEventGetSet,
} from "./properties/properties";
import {
    BooleanConstraints,
    ColorConstraints,
    CompositeConstraints,
    EntityIdConstraints,
    EnumConstraints,
    JsonConstraints,
    ListConstraints,
    NumberConstraints,
    PropertyConstraints,
    PropertyType,
    StringConstraints,
} from "./properties/property-constraints";
import RecordedFrame from "./recording/recorded-frame";
import ReplayerAuthority from "./recording/replayer-authority";
import WorldRecorder from "./recording/world-recorder";
import WorldReplayer from "./recording/world-replayer";
import PropertyRegistry from "./registry/property-registry";
import { Registry } from "./registry/registry";
import {
    TraitRegistryEntryProvider,
    WorldEventRegistryEntryProvider,
} from "./registry/registry-entry-provider";
import TraitRegistry, {
    AutoRegistryEntry,
    RegistryEntry,
    TraitRegistryEntry,
    traitRegistryEntry,
} from "./registry/trait-registry";
import WorldEventRegistry, {
    AutoWorldEventRegistryEntry,
    WorldEventRegistryEntry,
    worldEventRegistryEntry,
} from "./registry/world-event-registry";
import {
    AllSerializers,
    WorldSetup,
    allSerializers,
} from "./serialization/all-serializers";
import {
    ArrayDecoder,
    ArrayEncoder,
    Decoder,
    Encoder,
    EncoderSequence,
} from "./serialization/encoder";
import PackedTraitSerializer from "./serialization/packed/packed-automatic-trait-serializer";
import SerializationOptions, {
    SerializationType,
} from "./serialization/serialization-options";
import {
    AnySerialized,
    EntitySerializer,
    Serializer,
    TraitSerializer,
    WorldEventSerializer,
    WorldSerializer,
} from "./serialization/serializer";
import Trait from "./trait";
import {
    TraitSurfaceProvider,
    rectangleSurface,
} from "./trait-surface-provider";
import CameraTrait from "./traits/camera-trait";
import DelayedActionTrait from "./traits/delayed-action-trait";
import DependencyTrait from "./traits/dependency-trait";
import DisappearingTrait from "./traits/disappearing-trait";
import EntityGroupTrait from "./traits/entity-group-trait";
import EntitySelectorTrait from "./traits/entity-selector-trait";
import EventHolderTrait from "./traits/event-holder-trait";
import EventOnRemovalTrait from "./traits/event-on-removal-trait";
import EventTriggerTrait from "./traits/event-trigger-trait";
import InterpolatorTrait from "./traits/interpolator-trait";
import PositionBindingTrait from "./traits/position-binding-trait";
import RectangleBoundTrait from "./traits/rectangle-bound-trait";
import ScriptTrait from "./traits/script-trait";
import SmoothTargetFollowingTrait from "./traits/smooth-target-following-trait";
import duplicateEntities from "./util/duplicate-entities";
import EntityIdMapping from "./util/entity-id-mapping";
import firstAvailableId from "./util/first-available-id";
import PrefabHelper, { SerializedPrefab } from "./util/prefab-helper";
import { repositionEntities } from "./util/reposition-entities";
import { vector3 } from "./vector3";
import World from "./world";

export {
    AllSerializers,
    AnySerialized,
    ArrayDecoder,
    ArrayEncoder,
    // Multiplayer
    Authority,
    AuthorityType,
    AutoRegistryEntry,
    AutoWorldEventRegistryEntry,
    BooleanConstraints,
    CameraTrait,
    ColorConstraints,
    CompositeConstraints,
    // Perf
    CyclePerformanceTracker,
    Decoder,
    DelayedActionTrait,
    DependencyTrait,
    DisappearingTrait,
    Encoder,
    EncoderSequence,
    Entity,
    EntityEvent,
    EntityEventProcessed,
    EntityFilter,
    EntityFilters,
    EntityGroupTrait,
    // Configurables
    EntityIdConfigurable,
    EntityIdConstraints,
    EntityIdMapping,
    EntityRemoved,
    EntitySelectionRequested,
    EntitySelectorTrait,
    EntitySerializer,
    EnumConstraints,
    EventHolderTrait,
    EventOnRemovalTrait,
    EventTriggerTrait,
    FullAuthority,
    // App
    GameModelApp,
    GenericProperty,
    InterpolateProperty,
    // Traits
    InterpolatorTrait,
    JsonConstraints,
    KeyProvider,
    ListConstraints,
    LocalAuthority,
    MoveTo,
    NumberConstraints,
    // Collections
    ObjectSet,
    PackedTraitSerializer,
    Player,
    PositionBindingTrait,
    PrefabHelper,
    // Properties
    Property,
    // Property types
    PropertyConstraints,
    PropertyRegistry,
    PropertyType,
    RecordedFrame,
    RectangleBoundTrait,
    Registry,
    RegistryEntry,
    Remove,
    // Recording
    ReplayerAuthority,
    Room,
    ScriptTrait,
    SerializationOptions,
    SerializationType,
    SerializedPrefab,
    // Serializers
    Serializer,
    SetProperty,
    Shift,
    SmoothTargetFollowingTrait,
    StringConstraints,
    Trait,
    // Registries
    TraitRegistry,
    TraitRegistryEntry,
    TraitRegistryEntryProvider,
    TraitSerializer,
    // Surfaces
    TraitSurfaceProvider,
    Trigger,
    TriggerEvent,
    WatchableObjectSet,
    World,
    // Events
    WorldEvent,
    WorldEventRegistry,
    WorldEventRegistryEntry,
    WorldEventRegistryEntryProvider,
    WorldEventSerializer,
    WorldRecorder,
    WorldReplayer,
    WorldSerializer,
    WorldSetup,
    WorldUpdate,
    WorldUpdatesCollector,
    WorldUpdatesReceiver,
    // Utils
    adaptId,
    allSerializers,
    duplicateEntities,
    entity,
    entityConfigurable,
    firstAvailableId,
    getSet,
    // Geometry
    rectangleSurface,
    repositionEntities,
    resolveIds,
    traitGetSet,
    traitRegistryEntry,
    vector3,
    worldEventGetSet,
    worldEventRegistryEntry,
};

export * from "./multiplayer/room-update";

// Utils
export * from "./util/hash-string";
export * from "./util/modify-recording";

// Legacy
export * from "@remvst/geometry";
