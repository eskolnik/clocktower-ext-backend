import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import db from "./db.js";
import {generateJWT} from "./authentication.js";
import publish from "./publish.js";
import fs from "fs";

dotenv.config();

const app = express();

const TWITCH_PUBSUB_URL = "https://api.twitch.tv/extensions/message/";

app.use(cors());

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


const port = process.env.PORT;

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
    }
    // console.log(decoded); // bar

    // const players = db.get(req.params.channelId);
    res.send(JSON.stringify({players: 8}));
});

app.post("/grimoire/:channelId", (req, res) => {
    const {players} = req.body;

    const {channelId} = req.params;

    db.set(channelId, players);

    const token = generateJWT(channelId);

    const fakeGrim = {
        players: [
            {name: "Buffy", role: "slayer"},
            {name: "Aisha", role: "imp"},
            {name: "Sherlock", role: "investigator"},
            {name: "Natasha", role: "spy"},
            {name: "Watson", role: "soldier"}
        ],
        edition: {}
    };

    const message = JSON.stringify({type: "grimoire", grimoire: fakeGrim});
    // const message = JSON.stringify({type: "test", content: "foo"});

    publish(message, token, channelId).then(() => {
        res.status(200).send("success");
    }).catch(error => {
        // fs.writeFileSync("./log.txt", error.message);
        console.log("error publishing message", error);
        res.status(400).send("failure to publish message");
    });
  
});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});



