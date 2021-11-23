import dotenv from "dotenv";
import { initializeDb, migrate } from "../db/db.js";
dotenv.config();

initializeDb();
migrate();
