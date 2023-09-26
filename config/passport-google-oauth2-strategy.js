// Import necessary libraries and modules
const passport = require("passport");
const googleStrategy = require("passport-google-oauth").OAuth2Strategy;
const crypto = require("crypto");
const User = require("../models/User"); // Assuming there's a User model defined

// Configure Passport to use Google OAuth2 authentication strategy
passport.use(
	new googleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID, // Your Google OAuth2 client ID
			clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Your Google OAuth2 client secret
			callbackURL: process.env.GOOGLE_CALLBACK_URL, // Callback URL for handling authentication response
		},
		async function (accessToken, refreshToken, profile, done) {
			try {
				// Check if a user with the same email exists in the database
				let user = await User.findOne({ email: profile.emails[0].value });
				if (user) {
					// If user exists, return the user object
					return done(null, user);
				} else {
					// If user doesn't exist, create a new user using Google profile information
					try {
						let user = await User.create({
							name: profile.displayName, // Set the user's name
							email: profile.emails[0].value, // Set the user's email
							password: crypto.randomBytes(20).toString("hex"), // Generate a random password
						});
						return done(null, user); // Return the newly created user object
					} catch (error) {
						console.log("error in creating user in google auth", error);
					}
				}
			} catch (error) {
				console.log("error in google Strategy", error);
			}
		}
	)
);

// Export the configured Passport instance for use in other parts of the application
module.exports = passport;
