
// Import the Express framework
const express = require("express");

// Create a new router object to define route handlers
const router = express.Router();

// Import the User model for interacting with user data in the database
const User = require("../models/user.js");

// Import a utility to wrap async route handlers and catch errors
const wrapAsync = require("../utils/wrapAsync.js");

// Import Passport.js for authentication
const passport = require("passport");

// Import custom middleware to save the URL a user was trying to access
const { saveRedirectUrl } = require("../middleware.js");

// Import the user controller, which contains functions for handling user-related routes
const userCantroller = require("../cantrollers/user.js")

router.route("/signup")
    // Route to render the signup form page
    .get(userCantroller.renderSignupForm)
    // Route to handle signup form submission, wrapped to handle errors
    .post(wrapAsync(userCantroller.userRegister));


router
    .route("/login")
    // Route to render the login form page
    .get(userCantroller.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
        userCantroller.renderLoginPage
    );

// Route to handle user logout
router.get("/logout", userCantroller.renderLogout)

// Export the router to be used in other parts of the application
module.exports = router;