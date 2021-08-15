// Publish a message to subscribed Twitch extension clients
import axios from "axios";
import fs from "fs";

const TWITCH_PUBSUB_URL = "https://api.twitch.tv/extensions/message/";

function publish(message, token, channelId) {
    // const url = new URL(channelId, TWITCH_PUBSUB_URL).href;
    const url = TWITCH_PUBSUB_URL+String(channelId);
    console.log(url);

    const body = {
        content_type: "application/json",
        message,
        targets: ["broadcast"]
    };

    const options = {
        headers: {
            "Authorization": "Bearer " + token,
            "Client-Id": process.env.CLIENT_ID
        }
    };
    
    return axios.post(url, body, options).then(response => {
        // console.log("success", response);
    });
}

export default publish;
export {publish};