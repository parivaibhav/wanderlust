// require express app
const express = require("express");
// create express app
const app = express();
// mongoose for MongoDB
const mongoose = require("mongoose");
// schema model
const path = require("path");
// method-override for PUT & DELETE requests
const methodOverride = require("method-override");
// ejs-mate for layout support
const ejsMate = require("ejs-mate");
// custom ExpressError class
const ExpressError = require("./utils/expressError.js");
// MongoDB connection URL
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// listing routes
const listingsRoutes = require("./routes/listing.js");
const reviewsRoutes = require("./routes/review.js");

// Connect to MongoDB
main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log("DB connection error:", err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

// Express config
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


// Home route
app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

// Listings routes
app.use("/listings", listingsRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);

// 404 handler
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Error handler
// Error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (res.headersSent) {
        return next(err); // don’t try to render again
    }
    if (!err.message) err.message = "Something went wrong!";
    res.status(statusCode).render("error.ejs", { err });
});

// Server start
app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});