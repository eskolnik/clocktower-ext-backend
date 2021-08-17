import { getDb } from '../db/db.js';

const tableName = 'Grimoires';

class Grimoire {
    /**
     *
     * @param {number} id
     * @param {string} session
     * @param {number} playerId
     * @param {boolean} isHost
     * @param {string} players
     * @param {string} bluffs
     * @param {string} edition
     * @param {number} timestamp
     * @param {number} version
     */
    constructor (
        id, session, playerId, isHost, players, bluffs, edition, timestamp, version
    ) {
        this.id = id;
        this.session = session;
        this.playerId = playerId;
        this.isHost = isHost;
        this.players = players;
        this.bluffs = bluffs;
        this.edition = edition;
        this.timestamp = timestamp;
        this.version = version;
    }

    /**
     *
     * @returns {Object}
    */
    get messageContent () {
        const parsedPlayers = JSON.parse(this.players);
        const parsedEdition = JSON.parse(this.edition);
        return {
            players: parsedPlayers,
            edition: parsedEdition,
            lastUpdated: this.timestamp
        };
    }

    save () {
        const statement = getDb().prepare(`
        INSERT OR REPLACE INTO ${Grimoire.tableName}
        VALUES (:id, :session, :playerId, :isHost, :players, :bluffs, :edition, :timestamp, :version);`);

        const result = statement.run({
            id: this.id,
            session: this.session,
            playerId: this.playerId,
            isHost: this.isHost,
            players: this.players,
            bluffs: this.bluffs,
            edition: this.edition,
            timestamp: this.timestamp,
            version: this.version
        });

        if (result.lastInsertRowId) {
            this.id = result.lastInsertRowId;
        }
    }

    static get tableName () {
        return tableName;
    }

    static fromDbData (data) {
        return new Grimoire(
            data.id,
            data.session,
            data.playerId,
            data.isHost,
            data.players,
            data.bluffs,
            data.edition,
            data.session,
            data.timestamp,
            data.version
        );
    }

    // static loadAllByChannelId(channelId) {
    //     const statement = getDb().prepare(`
    //         SELECT * FROM ${Grimoire.tableName}
    //         WHERE channel_id=?`);

    //     return statement.all(channelId).map(this.fromDbData);
    // }

    static loadMostRecentByChannelId (channelId) {
        // get secret key from broadcaster
        // get session from secret key
        // get most recent grimoire for session and player id
        try {
            const statement = getDb().prepare(`
            SELECT 
                ${tableName}.id,
                ${tableName}.session,
                ${tableName}.player_id AS playerId,
                ${tableName}.is_host AS isHost,
                ${tableName}.players,
                ${tableName}.bluffs,
                ${tableName}.edition,
                ${tableName}.timestamp,
                ${tableName}.version
            FROM ${Grimoire.tableName} 
            WHERE channel_id=?
            ORDER BY timestamp DESC
            LIMIT 1`);

            const result = statement.get(channelId);
            if (!result) {
                return null;
            }
            return (this.fromDbData(result));
        } catch (err) {
            return null;
        }
    }

    /**
    *
    * @param {number} session
    * @param {string} playerId
    * @param {boolean} isHost
    * @param {string} players
    * @param {string} bluffs
    * @param {string} edition
    * @param {string} session
    * @param {number} version
    * @returns {Grimoire}
    */
    static create (
        session, playerId, isHost, players, bluffs, edition, version
    ) {
        return new Grimoire(
            null, session, playerId, isHost, players, bluffs, edition, Date.now(), version
        );
    }
}

export default Grimoire;
