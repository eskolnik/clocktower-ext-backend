import Database from "better-sqlite3";
import {migrate as _migrate} from "./migrate.js";

let db;

function initializeDb() {
    const dbPath = process.env.DB_PATH;
    console.log("db path: ", process.env.DB_PATH);
    db ||= new Database(dbPath, {verbose: console.log});
}

function migrate() {
    _migrate(db);
}


function getDb() {
    return db;
}

export default { initializeDb, migrate, getDb};
export { initializeDb, migrate, getDb};