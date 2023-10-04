import PrefabHelper, { SerializedPrefab } from './util/prefab-helper';
import SerializationOptions, { SerializationType } from './serialization/serialization-options';
import { Encoder, Decoder, ArrayEncoder, ArrayDecoder, EncoderSequence } from './serialization/encoder';
import { RegistryEntryProvider, WorldEventRegistryEntryProvider } from './registry/registry-entry-provider';
import { EntityFilter, EntityFilters } from './configurable/entity-filter';
import { AnySerialized } from './serialization/serializer';
import { Serializer, TraitSerializer, EntitySerializer, WorldSerializer, WorldEventSerializer } from './serialization/serializer';
import { KeyProvider } from './key-provider';
import { TraitSurfaceProvider, rectangleSurface } from './trait-surface-provider';
import Entity from './entity';
import Trait from './trait';
import World from './world';
import { WorldEvent } from './events/world-event';
import SetProperty from './events/set-property';
import { EntityEvent } from './events/entity-event';
import ObjectSet from './collections/object-set';
import WatchableObjectSet from './collections/watchable-object-set';
import EntityRemoved from './events/entity-removed';
import EntityEventProcessed from './events/entity-event-processed';
import { vector3 } from './vector3';
import { JsonSerializers, jsonSerializers } from './serialization/json-serializers';
import TraitRegistry, { AutoRegistryEntry, RegistryEntry } from './registry/trait-registry';
import WorldEventRegistry, { AutoWorldEventRegistryEntry, WorldEventRegistryEntry } from './registry/world-event-registry';
import { CyclePerformanceTracker } from './performance-tracker';
import PropertyRegistry from './registry/property-registry';
import EntitySelectionRequested from './events/entity-selection-requested';
import EntitySelectorTrait from './traits/entity-selector-trait';
import EntityIdConfigurable from './configurable/entity-id-configurable';
import InterpolatorTrait from './traits/interpolator-trait';
import MoveTo from './events/move-to';
import InterpolateProperty from './events/interpolate-property';
import adaptId, { resolveIds } from './adapt-id';
import { Property, GenericProperty, getSet, traitGetSet, worldEventGetSet } from './properties/properties';
import { PropertyType, PropertyConstraints, NumberConstraints, StringConstraints, EntityIdConstraints, ColorConstraints, BooleanConstraints, ListConstraints, EnumConstraints, CompositeConstraints, JsonConstraints } from './properties/property-constraints';
import AutomaticTraitSerializer from './serialization/automatic-trait-serializer';
import DelayedActionTrait from './traits/delayed-action-trait';
import DisappearingTrait from './traits/disappearing-trait';
import EventHolderTrait from './traits/event-holder-trait';
import EventTriggerTrait from './traits/event-trigger-trait';
import PositionBindingTrait from './traits/position-binding-trait';
import ScriptTrait from './traits/script-trait';
import Remove from './events/remove';
import Shift from './events/shift';
import TriggerEvent from './events/trigger-event';
import Trigger from './events/trigger';
import EntityGroupTrait from './traits/entity-group-trait';
import DependencyTrait from './traits/dependency-trait';
import GameModelApp from './game-model-app';
import { Authority, AuthorityType, LocalAuthority } from './multiplayer/authority';
import Room, { Player } from './multiplayer/room';
import { WorldUpdate } from './multiplayer/world-update';
import { RoomUpdate } from './multiplayer/room-update';
import EventOnRemovalTrait from './traits/event-on-removal-trait';
import PackedTraitSerializer from './serialization/packed/packed-automatic-trait-serializer';
import firstAvailableId from './util/first-available-id';
import duplicateEntities from './util/duplicate-entities';
import EntityIdMapping from './util/entity-id-mapping';
import { repositionEntities } from './util/reposition-entities';
import Vector2, { copyVec2 } from './vector2';
import entityConfigurable from './configurable/entity-configurable';
import { between, ceilToNearest, distance, floorToNearest, isBetween, modulo, normalizeAngle, notBetween, pointDistance, roundFloat, roundToNearest } from './util/math';

export {
    Trait,
    World,
    Entity,
    KeyProvider,

    // Collections
    ObjectSet,
    WatchableObjectSet,
    
    // Surfaces
    TraitSurfaceProvider,

    // Traits
    InterpolatorTrait,
    EventHolderTrait,
    EventTriggerTrait,
    DelayedActionTrait,
    DisappearingTrait,
    PositionBindingTrait,
    ScriptTrait,
    EntitySelectorTrait,
    EntityGroupTrait,
    DependencyTrait,
    EventOnRemovalTrait,

    // Events
    WorldEvent,
    EntityEvent,
    EntityEventProcessed,
    EntityRemoved,
    EntitySelectionRequested,
    Remove,
    SetProperty,
    MoveTo,
    Shift,
    InterpolateProperty,
    TriggerEvent,
    Trigger,
    
    // Serializers
    Serializer,
    TraitSerializer,
    EntitySerializer,
    WorldSerializer,
    WorldEventSerializer,
    AnySerialized,
    JsonSerializers,
    AutomaticTraitSerializer,
    jsonSerializers,
    Encoder,
    Decoder,
    EncoderSequence,
    ArrayEncoder,
    ArrayDecoder,
    PackedTraitSerializer,
    SerializationType,
    SerializationOptions,

    // Registries
    TraitRegistry,
    RegistryEntry,
    WorldEventRegistry,
    WorldEventRegistryEntry,
    AutoRegistryEntry,
    AutoWorldEventRegistryEntry,
    RegistryEntryProvider,
    WorldEventRegistryEntryProvider,

    // App
    GameModelApp,

    // Multiplayer
    Authority,
    AuthorityType,
    LocalAuthority,
    Room,
    RoomUpdate,
    WorldUpdate,
    Player,

    // Perf
    CyclePerformanceTracker,

    // Properties
    Property,
    PropertyType,
    PropertyRegistry,
    GenericProperty,

    // Property types
    PropertyConstraints,
    NumberConstraints,
    StringConstraints,
    EntityIdConstraints,
    ColorConstraints,
    BooleanConstraints,
    ListConstraints,
    EnumConstraints,
    CompositeConstraints,
    JsonConstraints,

    getSet,
    traitGetSet,
    worldEventGetSet,
    EntityFilter,
    EntityFilters,

    // Configurables
    EntityIdConfigurable,
    entityConfigurable,
    
    // Utils
    adaptId,
    resolveIds,
    firstAvailableId,
    EntityIdMapping,
    duplicateEntities,
    repositionEntities,
    SerializedPrefab,
    PrefabHelper,

    // Math
    between,
    notBetween,
    isBetween,
    distance,
    pointDistance,
    roundToNearest,
    floorToNearest,
    ceilToNearest,
    roundFloat,
    normalizeAngle,
    modulo,

    // Geometry
    rectangleSurface,
    vector3,
    Vector2,
    copyVec2,
};
