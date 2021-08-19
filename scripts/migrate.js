import { initializeDb, migrate } from "../db/db.js";

initializeDb();
migrate();
