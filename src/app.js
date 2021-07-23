const path = require("path");
const express = require("express");
const morgan = require("morgan");
const classify = require("./classifier");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(morgan("tiny"));

app.post("/", async (req, res) => {
  const sample = req.body.sample;
  try {
    const pred = await classify(sample);
    if (!pred) throw new Error("Something went wrong, try again later");
    res.status(200).json(pred);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.listen(PORT);
