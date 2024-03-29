// In memory cache, for JWTs only

const cache = {};

function set (key, value) {
    cache[key] = value;
}

function get (key) {
    return cache[key];
}

export default { get, set };
export { get, set };
