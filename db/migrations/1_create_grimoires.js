const tableName = "Grimoires";

const up = `CREATE TABLE IF NOT EXISTS ${tableName} (
    id          INTEGER NOT NULL PRIMARY KEY,
    channel_id  INTEGER NOT NULL,
    players     STRING NOT NULL,
    edition     STRING,
    session     STRING,
    timestamp   INTEGER NOT NULL,
    version     INTEGER NOT NULL
);`;


const down = `DROP TABLE IF EXISTS ${tableName};`;

export default {up, down};