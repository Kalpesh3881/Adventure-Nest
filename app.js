const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Nest = require("./models/AdventureNest");

//Database connection
mongoose.connect("mongodb://localhost:27017/AdventureNest");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once;
"open",
  () => {
    console.log("Database Connected");
  };

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//End points
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/nests", async (req, res) => {
  const nests = await Nest.find({});
  res.render("nests/index", { nests });
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
