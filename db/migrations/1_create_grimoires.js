const tableName = "Grimoires";

const up = `CREATE TABLE IF NOT EXISTS ${tableName} (
    id          INTEGER NOT NULL PRIMARY KEY,
    session     STRING,
    player_id   STRING NOT NULL,
    is_host     INTEGER,
    players     STRING,
    bluffs      STRING,
    edition     STRING,
    timestamp   INTEGER NOT NULL,
    version     INTEGER NOT NULL
);`;


const down = `DROP TABLE IF EXISTS ${tableName};`;

export default {up, down};