import migrations from "./migrations/migrations.js";

function migrate (database) {
    migrations.forEach(migration => {
        try {
            database.prepare(migration.up).run();
        } catch (err) {
            console.log("Error during migration: " + migration.tableName, err);
            throw err;
        }
    });
}

function rollback (database) {
    const migrationsReversed = [...migrations].reverse();
    migrationsReversed.forEach(migration => {
        try {
            database.prepare(migration.down).run();
        } catch (err) {
            console.log("Error during rollback: " + migration.tableName, err);
            throw err;
        }
    });
}

export default { migrate, rollback };

export { migrate, rollback, migrations };
