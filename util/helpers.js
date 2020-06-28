const _ = require('underscore');

module.exports = {
    construct(proto, object) {
        return Object.assign(Object.create(proto), object);
    },
    randInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    },
    setDefaults(options, defaults) {
        return _.defaults({}, _.clone(options), defaults);
    },
    constrainInt(min, max, int) {
        return Math.floor(Math.max(min, Math.min(int, max)));
    },
}
