// Publish a message to subscribed Twitch extension clients
import axios from 'axios';

const TWITCH_PUBSUB_URL = 'https://api.twitch.tv/extensions/message';

function publish (message, token, channelId) {
    const url = `${TWITCH_PUBSUB_URL}/${channelId}`;
    console.log(url);

    const body = {
        content_type: 'application/json',
        message,
        targets: ['broadcast']
    };

    const options = {
        headers: {
            Authorization: 'Bearer ' + token,
            'Client-Id': process.env.CLIENT_ID
        }
    };

    return axios.post(url, body, options);
}

export default publish;
export { publish };
