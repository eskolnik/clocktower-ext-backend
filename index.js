import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());

const port = process.env.PORT;

app.get("/", (req, res) => {
    res.send("hello");
});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});