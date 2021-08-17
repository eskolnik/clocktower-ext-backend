import migrations from "./migrations/migrations.js";

function migrate(database) {
    migrations.forEach(migration => {
        database.prepare(migration.up).run();
    });
}

function rollback(database) {
    let migrationsReversed = [...migrations].reverse();
    migrationsReversed.forEach(migration => {
        database.prepare(migration.down).run();
    });
}

export default {migrate, rollback};

export {migrate, rollback, migrations};