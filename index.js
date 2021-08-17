import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import db from './db/db.js';
import cache from './db/cache.js';
import { getJWT, verifyJWT } from './utils/authentication.js';
import publish from './utils/publish.js';
import Grimoire from './models/Grimoire.js';
import Session from './models/Session.js';
import Broadcaster from './models/Broadcaster.js';
import {
    ReasonPhrases,
    StatusCodes,
    getReasonPhrase,
    getStatusCode
} from 'http-status-codes';
dotenv.config();

const app = express();

const VERSION = 1;

app.use(cors());

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const port = process.env.PORT;

function initialize () {
    console.log('initializing db...');
    db.initializeDb(process.env.DB_PATH);
    db.migrate();
}

// FOR DEV ONLY, non-JWT-auth'd grimoire endpoint
app.get('/grimoire/:channelId', (req, res) => {
    const { channelId } = req.params;

    let grimoire;
    try {
        grimoire = Grimoire.loadMostRecentByChannelId(channelId);
    } catch (err) {
        res.status(404).send('Resource Not Found');
    }

    if (!grimoire) {
        res.status(404).send('Resource Not Found');
    }

    res.send(JSON.stringify({ grimoire: grimoire.messageContent }));
});

// Loads the grimoire for a channelId based on JWT Auth
// Currently only capable of loading the broadcaster's view
app.get('/grimoire/', (req, res) => {
    let decodedToken;

    try {
        decodedToken = verifyJWT(req);
    } catch (err) {
        console.log(err);
        res.status(403).send('Forbidden');
        return;
    }

    if (!decodedToken) {
        res.status(404).send('Forbidden');
    }

    const channelId = decodedToken.channelId;

    const grimoire = Grimoire.loadMostRecentByChannelId(channelId);

    if (!grimoire) {
        res.status(404).send('Resource Not Found');
    }
    const responseObject = {
        grimoire: grimoire.messageContent
    };

    res.send(JSON.stringify(responseObject));
});

// When a grimoire is received, we need to check the session,
// see if anyone is currently streaming that session,
// and publish updates to each of them
app.post('/grimoire/:secretKey', (req, res) => {
    const { session, playerId, isHost, players } = req.body;
    const { secretKey } = req.params;
    console.log(req.body);

    const sesh = Session.loadBySecretKey(secretKey);

    // get session based on secret key, and ensure session values match
    if (sesh.session !== session) {
        res.status(StatusCodes.CONFLICT).send(ReasonPhrases.CONFLICT);
        return;
    }

    const caster = Broadcaster.loadBySecretKey(secretKey);
    const channelId = caster.channelId;

    const grimoire = Grimoire.create(session, playerId, isHost, players, {}, {}, VERSION);
    grimoire.save();

    const signedToken = getJWT(channelId);

    const message = JSON.stringify({ type: 'grimoire', grimoire: grimoire.messageContent });

    publish(message, signedToken.token, channelId).then(() => {
        res.status(StatusCodes.CREATED).send(ReasonPhrases.CREATED);
    }).catch(error => {
        console.log('Error publishing message', error);
        res.status(StatusCodes.UNAUTHORIZED).send(ReasonPhrases.UNAUTHORIZED);
    });
});

// Get a broadcaster's secret key (for config view only)
// JWT Auth protected
app.get('/broadcaster/:channelId', (req, res) => {
    try {
        const decodedToken = verifyJWT(req);

        const { channelId } = req.params;

        if (!decodedToken || decodedToken.channelId !== channelId) {
            res.status(StatusCodes.UNAUTHORIZED).send(ReasonPhrases.UNAUTHORIZED);
        }

        const caster = Broadcaster.loadByChannelId(channelId);

        res.send(JSON.stringify(caster.messageContent));
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
    }
});

// Update a broadcaster's secret key
// JWT auth protected
app.post('/broadcaster/', (req, res) => {
    // handshake from config to establish or update a broadcasters' secret key

    try {
        const decodedToken = verifyJWT(req);

        const { channelId, secretKey } = req.body;

        if (!decodedToken || decodedToken.channelId !== channelId) {
            res.status(StatusCodes.UNAUTHORIZED).send(ReasonPhrases.UNAUTHORIZED);
        }

        const caster = Broadcaster.create(channelId, secretKey);
        caster.save();

        res.status(StatusCodes.CREATED).send();
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
    }
});

// Upsert a session record to assign a broadcaster to a specific session and player
// isActive marks whether the session should be sent to the viewers (when false, overlay will show nothing)
// Not JWT Auth protected
app.post('/session/:secretKey', (req, res) => {
    const { secretKey } = req.params;
    const { session, playerId, isActive } = req.body;
    try {
        const sesh = Session.create(secretKey, session, playerId, isActive);

        sesh.save();
        res.status(StatusCodes.CREATED).send();
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
    }
});

app.listen(port, () => {
    initialize();
    console.log(`Listening at http://localhost:${port}`);
});
