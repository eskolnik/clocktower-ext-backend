import { boolToInt, getDb, intToBool } from "../db/db.js";
const tableName = "Sessions";

/**
 * A Session represents a broadcaster's view of a botc browser tab
 * It includes information about which player / seat they are
 * as well as whether they want the overlay to be active or not
 *
 * This is independent of whether they are host or player
 */
class Session {
    constructor (secretKey, session, playerId, isActive, timestamp) {
        this.secretKey = secretKey.toString();
        this.session = session.toString();
        this.playerId = playerId.toString();
        this.isActive = isActive;
        this.timestamp = timestamp;
    }

    static get tableName () {
        return tableName;
    }

    save () {
        try {
            const statement = getDb().prepare(`
            INSERT OR REPLACE INTO ${Session.tableName}
            VALUES (:secretKey, :session, :playerId, :isActive, :timestamp)`);

            statement.run({
                secretKey: this.secretKey,
                session: this.session,
                playerId: this.playerId,
                isActive: boolToInt(this.isActive),
                timestamp: this.timestamp
            });
        } catch (err) {
            console.log(err);
        }
    }

    static loadBySecretKey (secretKey) {
        const statement = getDb().prepare(`
        SELECT 
            secret_key AS secretKey,
            session,
            player_id AS playerId,
            is_active AS isActive,
            timestamp
        FROM ${Session.tableName}
        WHERE secret_key=?`);

        const result = statement.get(secretKey);

        return new Session(secretKey, result.session, result.playerId, intToBool(result.isActive), result.timestamp);
    }

    static create (secretKey, session, playerId, isActive) {
        return new Session(secretKey, session, playerId, isActive, Date.now());
    }
}

export default Session;
