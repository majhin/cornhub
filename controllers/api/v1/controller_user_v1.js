const User = require("../../../models/User");
const jwt = require("jsonwebtoken");
const fpMailer = require("../../../mailers/forgotPassword");
const Tokens = require("../../../models/UserToken");
const crypto = require("crypto");

// Function to decode JWT token and return the email
function decoder(token) {
	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	const email = JSON.parse(decoded.data).email;
	return email;
}

// Controller for retrieving user profile
module.exports.profile = async function (req, res) {
	const userEmail = decoder(req.headers.authorization.split(" ")[1]);

	try {
		let user = await User.findOne({ email: userEmail });
		if (user) {
			return res.status(200).json({
				message: "User Found Successfully",
				user: { name: user.name, email: user.email },
			});
		} else {
			res.redirect("/failed-auth");
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for retrieving user posts
module.exports.timeline = async function (req, res) {
	const userEmail = decoder(req.headers.authorization.split(" ")[1]);

	try {
		let user = await User.findOne({ email: userEmail }).populate("post");
		if (user) {
			return res.status(200).json({
				message: "User Posts Found Successfully",
				userPosts: user.post,
			});
		} else {
			res.redirect("/failed-auth");
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for creating a new user
module.exports.createUser = async function (req, res) {
	let user;
	try {
		user = await User.findOne({ email: req.body.email });
		if (user) {
			return res.status(200).json({
				message: "User Already Exists !",
			});
		} else {
			try {
				let newUser = await User.create(req.body);
				if (newUser) {
					return res.status(200).json({
						message: "User Created Successfully",
					});
				}
			} catch (error) {
				console.log(error);
				return res.status(400).json({
					message: `${error}`,
				});
			}
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for creating a session with email/password authentication
module.exports.createSession = async function (req, res) {
	try {
		let user = await User.findOne({ email: req.body.email });

		if (user) {
			let pass = await user.comparePassword(req.body.password);

			if (pass) {
				let data = { name: user.name, email: user.email, id: user.id };
				jwt.sign(
					{ data: JSON.stringify(data) },
					process.env.JWT_SECRET,
					{
						expiresIn: 100000,
					},
					function (err, token) {
						return res.status(200).json({
							message: "Sign In Successful",
							token: token,
							user: data,
						});
					}
				);
				return;
			}
		}
		return res.status(422).json({
			message: "Invalid Username / Password",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for creating a session with Google OAuth
module.exports.createSessionGoogle = async function (req, res) {
	const { email } = req.user;
	try {
		let user = await User.findOne({ email });
		let data = { name: user.name, email: user.email, id: user.id };
		jwt.sign(
			{ data: JSON.stringify(data) },
			process.env.JWT_SECRET,
			{
				expiresIn: 100000,
			},
			function (err, token) {
				if (err) {
					return res.status(422).json({
						message: "Invalid Username / Password",
					});
				}

				// Assuming your frontend client is hosted at http://localhost:3000
				const clientRedirectUrl = `${process.env.CLIENT_URL}/google-handler`; // Change this to your client's URL

				// Redirect the user back to the client with the token as a query parameter
				return res.redirect(`${clientRedirectUrl}/?token=${token}`);
			}
		);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for checking if a user is logged in
module.exports.checkLogin = async function (req, res) {
	try {
		const userEmail = decoder(req.headers.authorization.split(" ")[1]);
		let user = await User.findOne({ email: userEmail });
		return res.status(200).json({
			message: "Login is Valid",
			user: { name: user.name, email: user.email, id: user.id.toString() },
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for accessing a protected resource for testing purposes
module.exports.protectedResource = function (req, res) {
	return res.status(200).json({
		message: "Authorized to access",
	});
};

// Controller for sending forgot password email
module.exports.forgotPasswordEmail = async function (req, res) {
	try {
		let user = await User.findOne({ email: req.body.email });
		if (user) {
			let token = await Tokens.create({
				user: user.id,
				accessToken: crypto.randomBytes(20).toString("hex"),
			});
			fpMailer.forgotPassword({ user, token });
			return res.status(200).json({
				message: "Please check your Inbox for link",
			});
		} else {
			return res.status(401).json({
				message: "User does not exist",
			});
		}
	} catch (error) {
		console.log("Error in reset password process", error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for rendering the reset password page only if the token is valid
module.exports.resetPassword = async function (req, res) {
	try {
		let paramsToken = req.params.token;
		let token = await Tokens.findOne({ accessToken: paramsToken });
		if (token && token.isValid) {
			return res.status(200).json({
				message: "You may reset your password",
				data: { token: token.id, userID: token.user },
			});
		}
		return res.status(401).json({
			message: "URL not valid anymore",
		});
	} catch (error) {
		console.log("Error in reset password process", error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for creating a new password
module.exports.createPassword = async function (req, res) {
	let tokenID = req.body.token;
	try {
		let user = await User.findById(req.body.userID);

		if (user) {
			user.password = req.body.password;
			await user.save();
			let accessToken = await Tokens.findByIdAndUpdate(tokenID, {
				isValid: false,
			});
			await accessToken.save();
			return res.status(200).json({
				message: "Password Changed Successfully",
			});
		} else {
			return res.status(500).json({
				message: "Error in changing the password",
			});
		}
	} catch (error) {
		console.log("Error:", error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for checking if a user with a specific email exists
module.exports.checkValidUser = async function (req, res) {
	try {
		let userEmail = req.params.userEmail;
		let user = await User.findOne({ email: userEmail });

		if (user) {
			return res.status(200).json({
				status: true,
			});
		} else {
			return res.status(200).json({
				status: false,
			});
		}
	} catch (error) {
		console.log("Error:", error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};
