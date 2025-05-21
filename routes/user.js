
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

// Route to render the signup form page
router.get("/signup", userCantroller.renderSignupForm)

// Route to handle signup form submission, wrapped to handle errors
router.post("/signup", wrapAsync(userCantroller.userRegister))

// Route to render the login form page
router.get("/login", userCantroller.renderLoginForm)

// Route to handle login form submission, with middleware for redirect and authentication
router.post(
    "/login",
    saveRedirectUrl, // Save the original URL before login
    passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), // Authenticate user
    userCantroller.renderLoginPage // Render the login page after successful login
)

// Route to handle user logout
router.get("/logout", userCantroller.renderLogout)

// Export the router to be used in other parts of the application
module.exports = router;