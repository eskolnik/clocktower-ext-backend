import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import db from "./db/db.js";
import {generateJWT} from "./authentication.js";
import publish from "./publish.js";


const app = express();

const TWITCH_PUBSUB_URL = "https://api.twitch.tv/extensions/message/";

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
    
    
    const grimKey = req.params.channelId+"_grim";
    const grimoire = db.get(grimKey);

    if(!grimoire) {
        res.status(404).send("Resource Not Found");
    }

    // const players = db.get(req.params.channelId);
    res.send(JSON.stringify(grimoire));
});

app.get("/grimoire/", (req, res) => {
    let decoded;
    
    try {
        const secret = Buffer.from(process.env.SECRET, "base64");
        const tokenArray = req.headers.authorization.split(" ");
        if(tokenArray[0]!=="Bearer") {
            throw new Error("Invalid Authorization");
        }
        const token = tokenArray[1];
        decoded = jwt.verify(token,  secret);
    } catch (err) {
        console.log(err);
        res.status(404).send("Resource Not Found");
        return;
    }
    console.log(decoded);
    
    const grimKey = decoded.channel_id+"_grim";
    const grimoire = db.get(grimKey);

    if(!grimoire) {
        res.status(404).send("Resource Not Found");
    }

    // const players = db.get(req.params.channelId);
    res.send(JSON.stringify(grimoire));
});

app.post("/grimoire/:channelId", (req, res) => {
    const {players} = req.body;

    const {channelId} = req.params;

    const grimoire = {
        players,
        edition: {},
        lastUpdated: Date.now()
    };

    const grimKey = channelId + "_grim";
    db.set(grimKey, grimoire);

    const jwtKey = channelId + "_jwt";
    let signedToken = db.get(jwtKey);
    const currentDate = Date.now();
    if(!signedToken || currentDate > signedToken.expiration) {
        signedToken = generateJWT(channelId);
        db.set(jwtKey, signedToken);
    }


    // const fakeGrim = {
    //     players: [
    //         {role: "washerwoman"},
    //         {role: "librarian"},
    //         {role: "investigator"},
    //         {role: "chef"},
    //         {role: "empath"},
    //         {role: "fortuneteller"},
    //         {role: "undertaker"},
    //         {role: "monk"},
    //         {role: "ravenkeeper"},
    //         {role: "virgin"},
    //         {role: "slayer"},
    //         {role: "soldier"},
    //         {role: "mayor"},
    //         {role: "butler"},
    //         {role: "drunk"},
    //         {role: "recluse"},
    //         {role: "saint"},
    //     ].slice(0,players),
    //     edition: {}
    // };

    const message = JSON.stringify({type: "grimoire", grimoire});
    // const message = JSON.stringify({type: "test", content: "foo"});
    console.log(message);

    publish(message, signedToken.token, channelId).then(() => {
        res.status(200).send("success");
    }).catch(error => {
        // fs.writeFileSync("./log.txt", error.message);
        console.log("error publishing message", error);
        res.status(400).send("failed to publish message");
    });
  
});

app.listen(port, () => {
    initialize();
    console.log(`Listening at http://localhost:${port}`);
});



