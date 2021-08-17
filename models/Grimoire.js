import db, { getDb } from "../db/db.js";

const tableName = "Grimoires";

class Grimoire {
    /**
     * 
     * @param {number} id 
     * @param {number} channelId 
     * @param {string} players 
     * @param {string} edition 
     * @param {string} session 
     * @param {number} timestamp 
     * @param {number} version 
     */
    constructor (id, channelId, players, edition, session, timestamp, version) {
        this.id = id;
        this.channelId = channelId;
        this.players = players;
        this.edition = edition;
        this.session = session;
        this.timestamp = timestamp;
        this.version = version;
    }

    /**
     * 
     * @returns {Object}
     */
    createMessageContent() {
        const parsedPlayers = JSON.parse(this.players);
        const parsedEdition = JSON.parse(this.edition);
        return {
            players: parsedPlayers,
            edition: parsedEdition,
            lastUpdated: this.timestamp
        };
    }

    save() {
        const statement = getDb().prepare(`
        INSERT OR REPLACE INTO ${Grimoire.tableName}
        VALUES (:id, :channelId, :players, :edition, :session, :timestamp, :version);`);

        const result = statement.run({
            id: this.id,
            channelId: this.channelId,
            players: this.players,
            edition: this.edition,
            session: this.session,
            timestamp: this.timestamp,
            version: this.version,
        });

        if(result.lastInsertRowId) {
            this.id = result.lastInsertRowId;
        }
    }

    static get tableName() {
        return tableName;
    }

    static fromDbData(data) {
        return new Grimoire(data.id, data.channel_id, data.players, data.edition, data.session, data.timestamp, data.version);
    }

    static loadAllByChannelId(channelId) {
        const statement = getDb().prepare(`
            SELECT * FROM ${Grimoire.tableName}
            WHERE channel_id=?`);

        return statement.all(channelId).map(this.fromDbData);
    }

    static loadMostRecentByChannelId(channelId) {
        try {
            const statement = getDb().prepare(`
            SELECT * FROM ${Grimoire.tableName}
            WHERE channel_id=?
            ORDER BY timestamp DESC
            LIMIT 1`);

            const result =  statement.get(channelId);
            if(!result) {
                return null;
            }
            return(this.fromDbData(result));
        } catch (err) {
            return null;
        }
    }

    /**
    * 
    * @param {number} channelId 
    * @param {string} players 
    * @param {string} edition 
    * @param {string} session 
    * @param {number} version 
    * @returns {Grimoire}
    */
    static build(channelId, players, edition, session, version) {
        return new Grimoire(null, channelId, players, edition, session, Date.now(), version);
    }

}

export default Grimoire;