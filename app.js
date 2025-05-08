
//require express app
const express = require("express");
// create express app
const app = express();
// mongoose for used mongoDB database
const mongoose = require("mongoose");
// require ing listings of schema models
const Listing = require("./models/listing.js");
const path = require("path");
// method-override is used to put and delete request
const methodOverride = require("method-override");
// ejs-mate used for layouts
const ejsMate = require('ejs-mate');
//wrapAsync import
const wrapAsync = require('./utils/wrapAsync.js')
// ExpressError import
const ExpressError = require('./utils/expressError.js')

// mongoDB connection URL
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// mongoDB connection code
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")))

//Home route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

//Index Route
app.get("/listings", wrapAsync(async (req, res, next) => {
  const allListings = await Listing.find({});
  console.log(allListings); // Debug log
  res.render("listings/index", { allListings });
}));

//New Route
app.get("/listings/new", wrapAsync((req, res) => {
  res.render("listings/new.ejs");
}));

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
}));

//Create Route
app.post("/listings", wrapAsync(async (req, res) => {
  //without filled data try to submiting data in using url call api
  if (!req.body.Listing) {
    throw new ExpressError(400, "Send valid data for listing");
  }
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {

  //without filled data try to submiting data in using url call api
  if (!req.body.Listing) {
    throw new ExpressError(400, "Send valid data for listing");
  }
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
})


//Error handling middlewares 
app.use((err, re, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.render("error.ejs", { err });
  // res.status(statusCode).send(message);
})

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
