export default {
    construct(proto, object) {
        return Object.assign(Object.create(proto), object);
    },
    randInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
}
