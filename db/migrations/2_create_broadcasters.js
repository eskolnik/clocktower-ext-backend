const tableName = "Broadcasters";

const up = `CREATE TABLE IF NOT EXISTS ${tableName} (
    channel_id  INTEGER NOT NULL PRIMARY KEY,
    secret_key  STRING NOT NULL,
    timestamp   INTEGER NOT NULL
);`;


const down = `DROP TABLE IF EXISTS ${tableName};`;

export default {up, down};