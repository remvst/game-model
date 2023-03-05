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
import { JsonSerializedEntity, JsonSerializedWorld, JsonSerializers, jsonSerializers } from './serialization/json-serializers';
import TraitRegistry, { RegistryEntry } from './registry/trait-registry';
import WorldEventRegistry, { WorldEventRegistryEntry } from './registry/world-event-registry';
import { CyclePerformanceTracker } from './performance-tracker';
import PropertyRegistry from './registry/property-registry';
import EntitySelectionRequested from './events/entity-selection-requested';
import EntitySelectorTrait from './traits/entity-selector-trait';
import EntityIdConfigurable from './configurable/entity-id-configurable';
import InterpolatorTrait from './traits/interpolator-trait';
import MoveTo from './events/move-to';
import InterpolateProperty from './events/interpolate-property';
import adaptId from './adapt-id';
import { Property, GenericProperty, getSet, traitGetSet, worldEventGetSet } from './properties/properties';
import { PropertyType, PropertyConstraints, NumberConstraints, StringConstraints, EntityIdConstraints, ColorConstraints, BooleanConstraints, ListConstraints, EnumConstraints, CompositeConstraints } from './properties/property-constraints';
import AutomaticTraitSerializer from './serialization/automatic-trait-serializer';

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

    // Events
    WorldEvent,
    EntityEvent,
    EntityEventProcessed,
    EntityRemoved,

    // Serializers
    Serializer,
    TraitSerializer,
    EntitySerializer,
    WorldSerializer,
    WorldEventSerializer,
    AnySerialized,
    JsonSerializedEntity,
    JsonSerializedWorld,
    JsonSerializers,
    AutomaticTraitSerializer,
    jsonSerializers,

    // Registries
    TraitRegistry,
    RegistryEntry,
    WorldEventRegistry,
    WorldEventRegistryEntry,

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

    getSet,
    traitGetSet,
    worldEventGetSet,
    EntityFilter,
    EntityFilters,
    EntitySelectionRequested,
    EntitySelectorTrait,

    // Configurables
    EntityIdConfigurable,

    // Generic events
    SetProperty,
    MoveTo,
    InterpolateProperty,
    
    // Utils
    adaptId,
    rectangleSurface,
    vector3,
};
