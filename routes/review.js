const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/expressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");


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



// Reviews routes Post route
router.post("/", validateReview, wrapAsync(async (req, res) => {
    let { id } = req.params;
    // Find the listing by ID
    let listing = await Listing.findById(id);
    // Create a new review
    let review = new Review(req.body.review);
    // Associate the review with the listing
    listing.reviews.push(review);
    // Save the review and the listing
    await review.save();
    await listing.save();
    res.redirect(`/listings/${id}`);

}))


// Reviews routes Delete route
// Delete review route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    // Find the listing and remove the review from its reviews array
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // Delete the review from the Review collection
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}))


module.exports = router;