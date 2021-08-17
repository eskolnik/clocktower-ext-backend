import jwt from "jsonwebtoken";
import cache from "../db/cache.js";

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

// function getJWT(channelId) {
//     cache.get();
// }

function verifyJWT(request) {
    const secret = Buffer.from(process.env.SECRET, "base64");
    const tokenArray = request.headers.authorization.split(" ");

    if(tokenArray[0]!=="Bearer") {
        throw new Error("Invalid Authorization");
    }

    const token = tokenArray[1];
    return jwt.verify(token,  secret);
}


export {generateJWT, verifyJWT};