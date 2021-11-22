import { boolToInt, getDb, intToBool } from "../db/db.js";
import Broadcaster from "./Broadcaster.js";
import Session from "./Session.js";

const tableName = "Grimoires";

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
     * @param {string} roles
     * @param {number} timestamp
     * @param {number} version
     */
    constructor (
        id, session, playerId, isHost, players, bluffs, edition, roles, timestamp, version
    ) {
        this.id = id;
        this.session = session;
        this.playerId = playerId;
        this.isHost = isHost;
        this.players = players;
        this.bluffs = bluffs;
        this.edition = edition;
        this.roles = roles;
        this.timestamp = timestamp;
        this.version = version;
    }

    /**
     *
     * @returns {Object}
    */
    get messageContent () {
        // const parsedPlayers = JSON.parse(this.players);
        // const parsedEdition = JSON.parse(this.edition);
        return {
            players: this.players,
            edition: this.edition,
            roles: this.roles,
            lastUpdated: this.timestamp
        };
    }

    save () {
        const statement = getDb().prepare(`
        INSERT OR REPLACE INTO ${Grimoire.tableName}
        VALUES (:id, :session, :playerId, :isHost, :players, :bluffs, :edition, :roles, :timestamp, :version);`);

        const result = statement.run({
            id: this.id,
            session: this.session,
            playerId: this.playerId,
            isHost: boolToInt(this.isHost),
            players: JSON.stringify(this.players),
            bluffs: JSON.stringify(this.bluffs),
            edition: JSON.stringify(this.edition),
            roles: JSON.stringify(this.roles),
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
            intToBool(data.isHost),
            JSON.parse(data.players),
            JSON.parse(data.bluffs),
            JSON.parse(data.edition),
            JSON.parse(data.roles),
            data.timestamp,
            data.version
        );
    }

    static loadMostRecentByChannelId (channelId) {
        try {
            const grimoireTable = Grimoire.tableName;
            const sessionTable = Session.tableName;
            const casterTable = Broadcaster.tableName;

            const db = getDb();
            const statement = db.prepare(`
            SELECT 
                ${grimoireTable}.id,
                ${grimoireTable}.session,
                ${grimoireTable}.player_id AS playerId,
                ${grimoireTable}.is_host AS isHost,
                ${grimoireTable}.players,
                ${grimoireTable}.bluffs,
                ${grimoireTable}.edition,
                ${grimoireTable}.roles,
                ${grimoireTable}.timestamp,
                ${grimoireTable}.version
            FROM ${grimoireTable} 
            INNER JOIN ${sessionTable} ON ${sessionTable}.session=${grimoireTable}.session
            INNER JOIN ${casterTable} ON ${casterTable}.secret_key=${sessionTable}.secret_key
            WHERE ${casterTable}.channel_id = ? 
            ORDER BY ${grimoireTable}.timestamp DESC
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
    * @param {string} roles
    * @param {string} session
    * @param {number} version
    * @returns {Grimoire}
    */
    static create (
        session, playerId, isHost, players, bluffs, edition, roles, version
    ) {
        return new Grimoire(
            null, session, playerId, isHost, players, bluffs, edition, roles, Date.now(), version
        );
    }
}

export default Grimoire;
