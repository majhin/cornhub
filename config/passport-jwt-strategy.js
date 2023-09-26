// Import necessary libraries and modules
const passport = require("passport");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const User = require("../models/User"); // Assuming there's a User model defined

// Define options for JWT authentication strategy
let opts = {
	jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), // Extract JWT from the request's Bearer token
	secretOrKey: process.env.JWT_SECRET, // JWT secret key for verification
};

// Configure Passport to use JWT authentication strategy
passport.use(
	new JWTStrategy(opts, async function (jwtPayload, done) {
		try {
			// Find a user in the database based on the user's ID from the JWT payload
			let user = await User.findOne(jwtPayload._id);
			if (user) {
				// If user exists, return the user object
				return done(null, user);
			}
			// If user doesn't exist, return false to indicate no user was found
			return done(null, false);
		} catch (error) {
			// Return any error that occurs during the process
			return done(error);
		}
	})
);

// Export the configured Passport instance for use in other parts of the application
module.exports = passport;
