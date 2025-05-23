if (process.env.NODE_ENV != "production") {
    require('dotenv').config()
}


const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingCantroller = require("../cantrollers/listing.js")
const multer = require('multer')
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage })

router.route("/")
    // Index Route from listing cantrollers
    .get(wrapAsync(listingCantroller.index))
    //create route
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingCantroller.createListing));



// New Route
router.get("/new", isLoggedIn, wrapAsync(listingCantroller.renderNewForm));


router.route("/:id")
    // Show Route
    .get(wrapAsync(listingCantroller.showListing))
    // Update Route
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingCantroller.updateListing))
    // Delete Route
    .delete(isLoggedIn, isOwner, wrapAsync(listingCantroller.destroyListing));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingCantroller.renderEditForm));

module.exports = router;