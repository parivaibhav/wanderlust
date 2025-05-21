const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js")


// Reviews routes Post route
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    let { id } = req.params;
    // Find the listing by ID
    let listing = await Listing.findById(id);
    // Create a new review
    let review = new Review(req.body.review);
    review.author = req.user._id;
    console.log(review)
    // Associate the review with the listing
    listing.reviews.push(review);
    // Save the review and the listing
    await review.save();
    await listing.save();
    req.flash("success", "Review Added Sucessfully!")
    res.redirect(`/listings/${id}`);

}))


// Reviews routes Delete route
// Delete review route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    // Find the listing and remove the review from its reviews array
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // Delete the review from the Review collection
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted Sucessfully!")
    res.redirect(`/listings/${id}`);
}))


module.exports = router;