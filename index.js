'use strict';

module.exports = {
    'Entity': require('./src/entity'),
    'Trait': require('./src/trait'),
    'AgingTrait': require('./src/traits/aging-trait'),
    'World': require('./src/world'),
    'WorldEvent': require('./src/events/world-event'),
    'ObjectSet': require('./src/collections/object-set'),
    'WatchableObjectSet': require('./src/collections/watchable-object-set')
};
