const tableName = "Sessions";

const up = `CREATE TABLE IF NOT EXISTS ${tableName} (
    secret_key  STRING NOT NULL PRIMARY KEY,
    session     STRING NOT NULL,
    player_id   STRING NOT NULL,
    is_active   BOOLEAN NOT NULL CHECK (is_active IN (0, 1)),
    timestamp   INTEGER NOT NULL
);`;

const down = `DROP TABLE IF EXISTS ${tableName};`;

export default { up, down, tableName };
