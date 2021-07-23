const path = require("path");
const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
const axios = require("axios");
const classify = require("./classifier");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(morgan("tiny"));

app.post("/", async (req, res) => {
  const sample = req.body.sample;
  try {
    const prediction = await classify(sample);
    if (!prediction) throw new Error("Something went wrong, try again later");
    res.status(200).json(prediction);

    // Log digit
    try {
      await axios.post(process.env.DB_HOST, {
        sample,
        prediction,
        date: Date.now(),
      });
    } catch (error) {
      // Fail gracefully
      console.error(error.message);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

app.listen(PORT);
