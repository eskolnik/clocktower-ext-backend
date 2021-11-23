import dotenv from "dotenv";
import { initializeDb, rollback } from "../db/db.js";
dotenv.config();

initializeDb();
rollback();
