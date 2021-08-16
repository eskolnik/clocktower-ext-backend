import jwt from "jsonwebtoken";

function generateJWT(channelId) {
    // time until JWT expiration in milliseconds - 1 hour
    const expirationBuffer = 60 * 60 * 1000;
    const expiration = Date.now() + expirationBuffer;

    const payload = {
        exp: expiration,
        user_id: process.env.OWNER_USER_ID,
        role: "external",
        channel_id: String(channelId),
        pubsub_perms: {
            send: ["broadcast"]
        }
    };

    const secret = Buffer.from(process.env.SECRET, "base64");

    return {
        token: jwt.sign(payload, secret),
        expiration
    };
}

export {generateJWT};