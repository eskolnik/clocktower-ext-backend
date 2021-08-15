import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import db from "./db.js";
import {generateJWT} from "./authentication.js";

dotenv.config();

const app = express();

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

    db.set(req.params.channelId, players);

    const token = generateJWT(req.params.channelId);
    

    res.status(200).send("success");
});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});



