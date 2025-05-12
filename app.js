// require express app
const express = require("express");
// create express app
const app = express();
// mongoose for MongoDB
const mongoose = require("mongoose");
// schema model
const Listing = require("./models/listing.js");
const path = require("path");
// method-override for PUT & DELETE requests
const methodOverride = require("method-override");
// ejs-mate for layout support
const ejsMate = require("ejs-mate");
// custom async wrapper
const wrapAsync = require("./utils/wrapAsync.js");
// custom ExpressError class
const ExpressError = require("./utils/expressError.js");
// Joi for validation Schema for Server
const { listingSchema, reviewSchema } = require("./schema.js")
// Review model
const Review = require("./models/review.js")
// MongoDB connection URL
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";


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

// Middleware for validating listing data
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}


// Middleware for validating reviews
const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

// Index Route
app.get(
    "/listings",
    wrapAsync(async (req, res) => {
        const allListings = await Listing.find({});
        res.render("listings/index", { allListings });
    })
);


// New Route
app.get(
    "/listings/new",
    wrapAsync((req, res) => {
        res.render("listings/new.ejs");
    })
);


// Show Route
app.get(
    "/listings/:id",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id).populate("reviews"); // populate reviews
        if (!listing) throw new ExpressError(404, "Listing not found");
        res.render("listings/show.ejs", { listing });
    })
);
//create route
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
    try {

        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    } catch (err) {
        if (res.headersSent) {
            return next(err);
        }
        if (err.name === "ValidationError") {
            const messages = Object.values(err.errors).map(e => e.message).join(", ");
            return res.status(400).render("error.ejs", { err: new ExpressError(400, messages) });
        }
        next(err);
    }


}));
// Edit Route
app.get(
    "/listings/:id/edit",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) throw new ExpressError(404, "Listing not found");
        res.render("listings/edit.ejs", { listing });
    })
);


// Update Route
app.put(
    "/listings/:id",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        res.redirect(`/listings/${id}`);
    })
);


// Delete Route
app.delete(
    "/listings/:id",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const deletedListing = await Listing.findByIdAndDelete(id);
        if (!deletedListing) throw new ExpressError(404, "Listing not found");
        res.redirect("/listings");
    })
);

// Reviews routes Post route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    console.log("New review Saved");
    res.redirect(`/listings/${listing._id}`);
}))


// 404 handler
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});
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