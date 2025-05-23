
const Listing = require("../models/listing.js");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    let { id } = req.params;
    // Find the listing by ID
    let listing = await Listing.findById(id);
    // Create a new review
    let review = new Review(req.body.review);
    review.author = req.user._id;
    //  console.log(review)
    // Associate the review with the listing
    listing.reviews.push(review);
    // Save the review and the listing
    await review.save();
    await listing.save();
    req.flash("success", "Review Added Sucessfully!")
    res.redirect(`/listings/${id}`);
}

module.exports.deleteReview = async (req, res) => {
    let { id, reviewId } = req.params;
    // Find the listing and remove the review from its reviews array
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // Delete the review from the Review collection
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted Sucessfully!")
    res.redirect(`/listings/${id}`);
}