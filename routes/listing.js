const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js")
const ExpressError = require("../utils/expressError.js");
const Listing = require("../models/listing.js");



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

// Index Route
router.get(
    "/",
    wrapAsync(async (req, res) => {
        const allListings = await Listing.find({});
        res.render("listings/index", { allListings });
    })
);


// New Route
router.get(
    "/new",
    wrapAsync((req, res) => {
        res.render("listings/new.ejs");
    })
);


// Show Route
router.get(
    "/:id",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id).populate("reviews"); // populate reviews
        if (!listing) throw new ExpressError(404, "Listing not found");
        res.render("listings/show.ejs", { listing });
    })
);

//create route
router.post("/", validateListing, wrapAsync(async (req, res, next) => {
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
router.get(
    "/:id/edit",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) throw new ExpressError(404, "Listing not found");
        res.render("listings/edit.ejs", { listing });
    })
);

// Update Route
router.put(
    "/:id",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        res.redirect(`/listings/${id}`);
    })
);

// Delete Route
router.delete(
    "/:id",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const deletedListing = await Listing.findByIdAndDelete(id);
        if (!deletedListing) throw new ExpressError(404, "Listing not found");
        res.redirect("/listings");
    })
);

module.exports = router;