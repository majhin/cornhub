// Import necessary libraries and modules
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const jwt = require("jsonwebtoken");

// Create a map to store socket connections for users
const socketMap = new Map();

// Define a function for handling socket connections
module.exports.sockets = function (socketServer) {
	// Create a socket.io instance with CORS settings
	let io = require("socket.io")(socketServer, {
		cors: { origin: "http://localhost:5173" }, // Define the allowed origin for CORS
	});

	// Set up a listener for new socket connections
	io.sockets.on("connection", function (socket) {
		// Handle authentication when a "authenticate" event is received
		socket.on("authenticate", (token) => {
			try {
				// Verify and decode the JWT token with the secret
				const decoded = jwt.verify(token, process.env.JWT_SECRET);
				const userID = JSON.parse(decoded.data).id;

				// Store the socket connection for the authenticated user
				socketMap.set(userID.toString(), socket.id);
				socket.emit("authenticated", { success: true });

				// Set up various socket event handlers

				// Handle "ping" event with "pong" response
				socket.on("ping", (string) => {
					socket.emit("pong", "pong");
				});

				// Handle "newComment" event and send a notification
				socket.on("newComment", async ({ postID, userID }) => {
					try {
						let post = await Post.findById(postID);
						if (post) {
							if (post.user.toString() === userID.toString()) {
								return;
							}
							if (socketMap.has(post.user.toString())) {
								io.to(socketMap.get(post.user.toString())).emit(
									"newCommentNotification",
									{
										message: "Someone just 💩 on your post",
									}
								);
							}
						}
					} catch (error) {
						console.log(error);
					}
				});

				// Handle "newLike" event and send notifications
				socket.on("newLike", async ({ postID, userID }) => {
					try {
						let post = await Post.findById(postID);
						if (post) {
							socket.broadcast.emit("newLikeNotification", {
								postID,
								postLikes: post.poppers.length,
								globalLikes: true,
							});
							if (post.user.toString() === userID.toString()) {
								return;
							}
							if (socketMap.has(post.user.toString())) {
								io.to(socketMap.get(post.user.toString())).emit(
									"newLikeNotification",
									{
										message: "Someone Just Popped your 🍒",
										globalLikes: false,
									}
								);
							}
						}
					} catch (error) {
						console.log(error);
					}
				});

				// Handle "newPost" event and broadcast a notification
				socket.on("newPost", () => {
					socket.broadcast.emit("newPostNotification", {
						message: "Someone just 🤮 in this field",
					});
				});

				// Handle "newShare" event and send notifications
				socket.on("newShare", async ({ toEmail, postID, currentUserEmail }) => {
					try {
						let currentUser = await User.findOne({ email: currentUserEmail });
						let user = await User.findOne({ email: toEmail });
						let post = await Post.findById(postID);
						if (user && post) {
							if (socketMap.has(user._id.toString())) {
								io.to(socketMap.get(user._id.toString())).emit(
									"newShareNotification",
									{
										message: "Someone Just Sent You 💨",
									}
								);
							}
							if (post.user._id.toString() !== currentUser._id.toString()) {
								if (socketMap.has(post.user._id.toString())) {
									io.to(socketMap.get(post.user._id.toString())).emit(
										"newShareNotification",
										{
											message: "Someone Just Stole your 💰",
										}
									);
								}
							}
						}
					} catch (error) {
						console.log("Error in socket for new Share", error);
					}
				});
			} catch (err) {
				console.error("Authentication error:", err);
				socket.emit("authenticated", {
					success: false,
					error: "Authentication failed",
				});
				socket.disconnect();
			}
		});
	});
};
