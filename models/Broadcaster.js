import { getDb } from '../db/db.js';

const tableName = 'Broadcasters';

class Broadcaster {
    constructor (
        channelId, secretKey, timestamp
    ) {
        this.channelId = channelId;
        this.secretKey = secretKey;
        this.timestamp = timestamp;
    }

    save () {
        const statement = getDb().prepare(`
        INSERT OR REPLACE INTO ${Broadcaster.tableName}
        VALUES (:channelId, :secretKey, :timestamp)
        `);

        statement.run({
            channelId: this.channelId,
            secretKey: this.secretKey,
            timestamp: this.timestamp
        });
    }

    get messageContent () {
        return {
            channelId: this.channelId,
            secretKey: this.secretKey
        };
    }

    static get tableName () {
        return tableName;
    }

    static fromDbData (data) {
        return new Broadcaster(
            data.channel_id, data.secret_key, data.timestamp
        );
    }

    static loadByChannelId (channelId) {
        try {
            const statement = getDb().prepare(`
            SELECT * FROM ${Broadcaster.tableName}
            WHERE channel_id=?
            LIMIT 1`);
            const result = statement.get(channelId);
            if (!result) {
                return null;
            }
            return this.fromDbData(result);
        } catch (err) {
            return null;
        }
    }

    static loadBySecretKey (secretKey) {
        try {
            const statement = getDb().prepare(`
            SELECT * FROM ${Broadcaster.tableName}
            WHERE secret_key=?
            LIMIT 1`);
            const result = statement.get(secretKey);
            if (!result) {
                return null;
            }
            return this.fromDbData(result);
        } catch (err) {
            return null;
        }
    }

    static create (channelId, secretKey) {
        return new Broadcaster(channelId, secretKey, Date.now());
    }
}

export default Broadcaster;
