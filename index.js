import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import db from "./db/db.js";
import cache from "./db/cache.js";
import {generateJWT, verifyJWT} from "./utils/authentication.js";
import publish from "./utils/publish.js";
import Grimoire from "./models/Grimoire.js";


const app = express();

const VERSION = 1;


app.use(cors());

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


const port = process.env.PORT;

function initialize() {
    console.log("initializing db...");
    db.initializeDb(process.env.DB_PATH);
    db.migrate();
}

app.get("/grimoire/:channelId", (req, res) => {
    const {channelId} = req.params;

    let grimoire;
    try {
        grimoire= Grimoire.loadMostRecentByChannelId(channelId);
    } catch (err) {
        res.status(404).send("Resource Not Found");
    }

    if(!grimoire) {
        res.status(404).send("Resource Not Found");
    }

    res.send(JSON.stringify(grimoire));
});

app.get("/grimoire/:secret", (req, res) => {
    let decoded;
    
    try {
        decoded = verifyJWT(req);
    } catch (err) {
        console.log(err);
        res.status(403).send("Forbidden");
        return;
    }

    if(!decoded) {
        res.status(404).send("Forbidden");
    }
    


    if(!grimoire) {
        res.status(404).send("Resource Not Found");
    }

    // const players = db.get(req.params.channelId);
    res.send(JSON.stringify(grimoire));
});

app.post("/grimoire/:channelId", (req, res) => {
    const {players, session} = req.body;

    const {channelId} = req.params;

    const grimoire = Grimoire.build(channelId, JSON.stringify(players), JSON.stringify({}), session, VERSION);

    grimoire.save();

    const jwtKey = channelId + "_jwt";
    let signedToken = cache.get(jwtKey);
    const currentDate = Date.now();
    if(!signedToken || currentDate > signedToken.expiration) {
        signedToken = generateJWT(channelId);
        cache.set(jwtKey, signedToken);
    }

    const message = JSON.stringify({type: "grimoire", grimoire: grimoire.createMessageContent()});

    publish(message, signedToken.token, channelId).then(() => {
        res.status(200).send("success");
    }).catch(error => {
        console.log("Error publishing message", error);
        res.status(403).send("Forbidden");
    });
  
});

app.post("/broadcaster/:channelId/:secret", (req, res) => {
    // handshake from config to establish or update a broadcasters' secret key

    
});

app.listen(port, () => {
    initialize();
    console.log(`Listening at http://localhost:${port}`);
});



