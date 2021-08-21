import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import db from "./db/db.js";
import { getJWT, verifyJWT } from "./utils/authentication.js";
import publish from "./utils/publish.js";
import Grimoire from "./models/Grimoire.js";
import Session from "./models/Session.js";
import Broadcaster from "./models/Broadcaster.js";
import {
    ReasonPhrases,
    StatusCodes
} from "http-status-codes";
dotenv.config();

const app = express();

const VERSION = 1;

app.use(cors());

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const port = process.env.PORT;

function initialize () {
    console.log("initializing db...");
    db.initializeDb(process.env.DB_PATH);
    db.migrate();
}

// FOR DEV ONLY, non-JWT-auth'd grimoire endpoint
app.get("/grimoire/:channelId", (req, res) => {
    const { channelId } = req.params;

    let grimoire;
    try {
        grimoire = Grimoire.loadMostRecentByChannelId(channelId);
    } catch (err) {
        res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
        return;
    }

    if (!grimoire) {
        res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
        return;
    }

    res.send(JSON.stringify({ grimoire: grimoire.messageContent }));
});

// Loads the grimoire for a channelId based on JWT Auth
// Currently only capable of loading the broadcaster's view
app.get("/grimoire/", (req, res) => {
    let decodedToken;

    try {
        decodedToken = verifyJWT(req);
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.UNAUTHORIZED).send(ReasonPhrases.UNAUTHORIZED);
        return;
    }

    if (!decodedToken) {
        res.status(StatusCodes.UNAUTHORIZED).send("Forbidden");
    }

    const channelId = decodedToken.channel_id;

    const grimoire = Grimoire.loadMostRecentByChannelId(channelId);
    const caster = Broadcaster.loadByChannelId(channelId);
    const sesh = Session.loadBySecretKey(caster.secretKey);

    if (!grimoire) {
        res.status(404).send("Resource Not Found");
    }
    const responseObject = {
        grimoire: grimoire.messageContent,
        isActive: sesh.isActive
    };

    res.send(JSON.stringify(responseObject));
});

// When a grimoire is received, if there is an associated broadcaster,
// we try to send an update to them
app.post("/grimoire/:secretKey", (req, res) => {
    const { session, playerId, isHost, players, bluffs, edition } = req.body;
    const { secretKey } = req.params;
    console.log("POST grimoire/" + secretKey, req.body);

    const sesh = Session.loadBySecretKey(secretKey);

    // get session based on secret key, and ensure session values match

    if (sesh.session !== session) {
        res.status(StatusCodes.CONFLICT).send(ReasonPhrases.CONFLICT);
        return;
    }

    const grimoire = Grimoire.create(session, playerId, isHost, players, bluffs, edition, VERSION);
    grimoire.save();
    res.status(StatusCodes.CREATED).send(ReasonPhrases.CREATED);

    // Try to find the broadcaster
    try {
        const caster = Broadcaster.loadBySecretKey(secretKey);

        const channelId = caster.channelId;

        const signedToken = getJWT(channelId);

        const message = JSON.stringify({ type: "grimoire", grimoire: grimoire.messageContent, isActive: sesh.isActive });

        publish(message, signedToken.token, channelId).catch(error => {
            console.log("Error publishing message", error);
        });
    } catch (error) {
        console.log("No caster found for this grimoire");
    }
});

// Get a broadcaster's secret key (for config view only)
// JWT Auth protected
app.get("/broadcaster/:channelId", (req, res) => {
    try {
        const decodedToken = verifyJWT(req);

        const { channelId } = req.params;

        if (!decodedToken || decodedToken.channel_id !== channelId) {
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
app.post("/broadcaster/", (req, res) => {
    // handshake from config to establish or update a broadcasters' secret key
    console.log(req.body);
    try {
        const decodedToken = verifyJWT(req);

        const { channelId, secretKey } = req.body;

        if (!channelId) {
            res.status(StatusCodes.UNAUTHORIZED).send("Missing channelId");
            return;
        }
        if (!secretKey) {
            res.send(StatusCodes.UNAUTHORIZED).send("Missing secret key");
            return;
        }
        if (!decodedToken || decodedToken.channel_id !== channelId) {
            res.status(StatusCodes.UNAUTHORIZED).send(ReasonPhrases.UNAUTHORIZED);
            return;
        }

        const caster = Broadcaster.create(channelId, secretKey);
        caster.save();

        res.status(StatusCodes.CREATED).send();
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
    }
});

// Upsert a session record to assign a broadcaster to a specific session and player
// isActive marks whether the session should be sent to the viewers (when false, overlay will show nothing)
// Not JWT Auth protected
app.post("/session/:secretKey", (req, res) => {
    const { secretKey } = req.params;
    const { session, playerId, isActive } = req.body;
    console.log("POST /session/" + secretKey);
    console.log(req.body);

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
