'use strict';

module.exports = {
    'Entity': require('./src/entity'),
    'Trait': require('./src/traits/trait'),
    'AgingTrait': require('./src/traits/aging-trait'),
    'World': require('./src/world'),
    'KeyedObjectSet': require('./src/collections/keyed-object-set'),
    'BucketedKeyedObjectSet': require('./src/collections/bucketed-keyed-object-set'),
    'WatchableObjectSet': require('./src/collections/watchable-object-set'),
};
