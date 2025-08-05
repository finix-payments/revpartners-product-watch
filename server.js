import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

app.post("/", (req, res) => {
  console.log("Webhook received:", req.body);
  res.sendStatus(200);
});

app.listen(3100, () => console.log("Listening on port 3100"));
