import Database from "better-sqlite3";
import { migrate as _migrate, rollback as _rollback } from "./migrate.js";

let db;

function initializeDb () {
    const dbPath = process.env.DB_PATH || "./db/dev.db";
    db ||= new Database(dbPath);
}

function migrate () {
    _migrate(db);
}

function getDb () {
    return db;
}

function rollback () {
    _rollback(db);
}

// SQLite doesn't know what booleans are
function boolToInt (bool) {
    return bool ? 1 : 0;
}
function intToBool (int) {
    return int !== 0;
}

export default { initializeDb, migrate, rollback, getDb, boolToInt, intToBool };
export { initializeDb, migrate, rollback, getDb, boolToInt, intToBool };
