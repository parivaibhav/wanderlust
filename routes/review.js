const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js")

const reviewCantroller = require("../cantrollers/review.js")


// Reviews routes Post route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewCantroller.createReview))


// Reviews routes Delete route
// Delete review route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewCantroller.deleteReview))


module.exports = router;