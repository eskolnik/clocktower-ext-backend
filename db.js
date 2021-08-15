let db = {};

function set(key, value) {
    db[key] = value;
}

function get(key) {
    return db[key];
}

export default {get, set};
export {get, set};