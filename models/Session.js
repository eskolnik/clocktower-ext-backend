import { getDb } from '../db/db.js';
const tableName = 'Sessions';

class Session {
    constructor (secretKey, session, playerId, isActive, timestamp) {
        this.secretKey = secretKey;
        this.session = session;
        this.playerId = playerId;
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

            statement.run();
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

        const result = statement.get();

        return new Session(result.secretKey, result.session, result.playerId, result.isActive, result.timestamp);
    }

    static fromDbData (data) {

    }

    static create (secretKey, session, playerId, isActive) {
        return new Session(secretKey, session, playerId, isActive, Date.now());
    }
}

export default Session;
