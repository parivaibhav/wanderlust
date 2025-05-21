const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");






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
    "/new", isLoggedIn,
    wrapAsync((req, res) => {
        res.render("listings/new.ejs");
    })
);


// Show Route
router.get(
    "/:id",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner"); // populate reviews
        if (!listing) {
            req.flash("error", "Listing Not Exists!");
            res.redirect("/listings");
        }
        console.log(listing)
        res.render("listings/show.ejs", { listing });
    })
);

//create route
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {
    try {
        const newListing = new Listing(req.body.listing);
        // ✅ Set the current logged-in user as the owner
        newListing.owner = req.user._id;

        await newListing.save();
        req.flash("success", "new listing created!")
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
    "/:id/edit", isLoggedIn,
    isOwner,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing Not Exists!");
            res.redirect("/listings");
        }
        res.render("listings/edit.ejs", { listing });
    })
);

// Update Route
router.put(
    "/:id", isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        let listing = await Listing.findById(id);
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        req.flash("success", "Listing Updated SuccessFully!")
        res.redirect(`/listings/${id}`);
    })
);

// Delete Route
router.delete(
    "/:id", isLoggedIn,
    isOwner,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        let listing = await Listing.findById(id);

        const deletedListing = await Listing.findByIdAndDelete(id);
        if (!deletedListing) throw new ExpressError(404, "Listing not found");
        req.flash("error", "Listing Deleted Sucessfully!")
        res.redirect("/listings");
    })
);

module.exports = router;