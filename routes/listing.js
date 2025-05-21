const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingCantroller = require("../cantrollers/listing.js")

// Index Route from listing cantrollers
router.get("/", wrapAsync(listingCantroller.index));

// New Route
router.get("/new", isLoggedIn, wrapAsync(listingCantroller.renderNewForm));

// Show Route
router.get("/:id", wrapAsync(listingCantroller.showListing));

//create route
router.post("/", isLoggedIn, validateListing, wrapAsync(listingCantroller.createListing));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingCantroller.renderEditForm));

// Update Route
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingCantroller.updateListing));

// Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingCantroller.destroyListing));

module.exports = router;