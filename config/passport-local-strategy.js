// Import necessary libraries and modules
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Users = require("../models/User"); // Assuming there's a User model defined

// Configure Passport to use the Local Strategy for username and password authentication
passport.use(
	new LocalStrategy(
		{
			usernameField: "email", // Specify that the username is the "email" field in the request
			passReqToCallback: true, // Pass the request object to the callback function
		},
		async function (req, username, password, done) {
			try {
				// Find a user in the database based on the provided email (username)
				let user = await Users.findOne({ email: username });

				if (user) {
					// If a user with the provided email exists, compare the password
					let pass = await user.comparePassword(password);
					if (pass) {
						// If the password matches, authenticate the user
						return done(null, user);
					}
				}
				// If no user or invalid credentials, return an error message
				req.flash("message", `Invalid Username/Password`);
				return done(null, false);
			} catch (error) {
				// Return any error that occurs during the authentication process
				return done(error);
			}
		}
	)
);

// Serialize the user to decide which key is to be kept in the cookies
passport.serializeUser(function (user, done) {
	done(null, user.id);
});

// Deserialize the user from the key stored in the cookies
passport.deserializeUser(async function (id, done) {
	let user;

	try {
		// Find the user by their ID
		user = await Users.findById(id);

		if (user) {
			// If the user is found, return the user object
			return done(null, user);
		}
	} catch (error) {
		console.log(error);
	}
});

// Middleware to check authentication for the current user
passport.checkAuthentication = function (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	return res.redirect("/failed-auth"); // Redirect to a failure authentication page if not authenticated
};

// Middleware to disable sign-in for a user if already logged in
passport.disableSignIn = function (req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect("/failed-auth"); // Redirect to a failure authentication page if already authenticated
	}

	next();
};

// Middleware to set the current authenticated user to the locals for use in views
passport.setAuthenticatedUser = function (req, res, next) {
	if (req.isAuthenticated()) {
		res.locals.user = req.user; // Set the current user in res.locals for use in views
	}
	next();
};

// Export the configured Passport instance for use in other parts of the application
module.exports = passport;
