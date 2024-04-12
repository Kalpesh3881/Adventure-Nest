const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Nest = require("./models/AdventureNest");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const Joi = require("joi");
const ExpressError = require("./utils/ExpressError");
const exp = require("constants");

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

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

//End points
app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/nests",
  catchAsync(async (req, res) => {
    const nests = await Nest.find({});
    res.render("nests/index", { nests });
  })
);

app.get("/nests/new", (req, res) => {
  res.render("nests/new");
});

app.post(
  "/nests",
  catchAsync(async (req, res, next) => {
    // if (!req.body.nest) throw new ExpressError("Invalid Nest Data", 400);
    const nestSchema = Joi.object({
      nest: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
      }).required(),
    });
    const { error } = nestSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(", ");
      throw new ExpressError(msg, 400);
    }
    const nest = new Nest(req.body.nest);
    await nest.save();
    res.redirect(`/nests/${nest._id}`);
  })
);

app.get(
  "/nests/:id",
  catchAsync(async (req, res) => {
    const nest = await Nest.findById(req.params.id);
    res.render("nests/show", { nest });
  })
);

app.get(
  "/nests/:id/edit",
  catchAsync(async (req, res) => {
    const nest = await Nest.findById(req.params.id);
    res.render("nests/edit", { nest });
  })
);

app.put(
  "/nests/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const nest = await Nest.findByIdAndUpdate(id, { ...req.body.nest });
    res.redirect(`/nests/${nest._id}`);
  })
);

app.delete(
  "/nests/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Nest.findByIdAndDelete(id);
    res.redirect("/nests");
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Somthing went Wrong..!";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
