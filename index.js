require("dotenv").config();
const express = require("express");
// require mongoose
const mongoose = require("mongoose");
// require valid-url
const validUrl = require("valid-url");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

// create a connection to local mongodb
mongoose.connect(process.env.MONGO + "/UrlShortenerDB");

// create a schema for the database
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number,
});

// create a model for the database
const Url = mongoose.model("Url", urlSchema);

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// Create a post request on this api/shorturl endpoint
app.post("/api/shorturl", async function (req, res) {
  // get the url from the request body
  const url = req.body.url;

  // check if the url is valid
  if (!validUrl.isUri(url)) {
    return res.json({ error: "invalid url" });
  }

  // check if the url is already in the database
  const existingUrl = await Url.findOne({ original_url: url });

  if (existingUrl) {
    // if the url is already in the database, return the existing url
    res.json({
      original_url: existingUrl.original_url,
      short_url: existingUrl.short_url,
    });
  } else {
    // if the url is not in the database, create a new url
    const newUrl = new Url({
      original_url: url,
      short_url: Math.floor(Math.random() * 1000),
    });

    // save the new url to the database
    await newUrl.save();

    // return the new url
    res.json({
      original_url: newUrl.original_url,
      short_url: newUrl.short_url,
    });
  }
});

// Create a get request on this api/shorturl/:short_url endpoint
app.get("/api/shorturl/:short_url", async function (req, res) {
  const short_url = req.params.short_url;
  const existingShorUrl = await Url.findOne({ short_url: short_url });
  if (existingShorUrl) {
    res.redirect(existingShorUrl.original_url);
  } else {
    res.json({ error: "invalid url" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
