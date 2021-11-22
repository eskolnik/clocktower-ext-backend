/**
 * Remove all Grimoire and Session records older than 1 day
 */

import { initializeDb, getDb } from "../db/db.js";
import Grimoire from "../models/Grimoire.js";
import Session from "../models/Session.js";

function cleanDb () {
    initializeDb();

    const db = getDb();

    const dayOffset = 1000 * 60 * 60 * 24; // 1 Day in milliseconds
    const cutoffDate = Date.now() - dayOffset;

    [Grimoire, Session].forEach(TableClass => {
        try {
            const result = db.prepare(`
            DELETE FROM ${TableClass.tableName} 
            WHERE ${TableClass.tableName}.timestamp < ${cutoffDate}
        `).run();

            console.log(result);
        } catch (err) {
            console.log(err);
        }
    });
}

export default cleanDb;
