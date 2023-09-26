const express = require("express");
const passport = require("passport");
const router = express.Router();

// Import the user controller for API version 1
const userControllerV1 = require("../../../controllers/api/v1/controller_user_v1");

// Create a new user
router.post("/create-user", userControllerV1.createUser);

// Create a user session (login)
router.post("/create-session", userControllerV1.createSession);

// Check if a user is logged in (authentication check)
router.post(
	"/check-login",
	passport.authenticate("jwt", {
		session: false,
		failureRedirect: "/failed-auth",
	}),
	userControllerV1.checkLogin
);

// Authentication via Google
router.get(
	"/auth/google",
	passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback URL for Google authentication
router.get(
	"/auth/google/callback",
	passport.authenticate("google", { failureRedirect: "/failed-auth" }),
	userControllerV1.createSessionGoogle
);

// Send a reset password link to the user's email
router.post("/forgot-password", userControllerV1.forgotPasswordEmail);

// Render the reset password page
router.get("/reset-password/:token", userControllerV1.resetPassword);

// Create and update the new password for the user
router.post("/create-password", userControllerV1.createPassword);

// Get user profile
router.get(
	"/profile",
	passport.authenticate("jwt", { failureRedirect: "/failed-auth" }),
	userControllerV1.profile
);

// Get user timeline
router.get(
	"/timeline",
	passport.authenticate("jwt", { failureRedirect: "/failed-auth" }),
	userControllerV1.timeline
);

// Check if a user with a specific email exists
router.get(
	"/check-valid-user/:userEmail",
	passport.authenticate("jwt", { failureRedirect: "/failed-auth" }),
	userControllerV1.checkValidUser
);

module.exports = router;
