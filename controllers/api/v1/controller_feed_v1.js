// Import necessary libraries and models
const jwt = require("jsonwebtoken");
const User = require("../../../models/User");
const Post = require("../../../models/Post");
const Comment = require("../../../models/Comment");
const Share = require("../../../models/Share");

// Function to decode a JWT token and extract the user's email
function decoder(token) {
	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	const email = JSON.parse(decoded.data).email;
	return email;
}

// Controller for handling liking/unliking a post
module.exports.likePost = async function (req, res) {
	const { postID } = req.body;
	const userEmail = decoder(req.headers.authorization.split(" ")[1]);

	try {
		const user = await User.findOne({ email: userEmail });
		const post = await Post.findById(postID);

		if (!post || !user) {
			return res.status(404).json({
				message: "Post not found",
			});
		}

		const userIndex = post.poppers.indexOf(user.id);
		if (userIndex !== -1) {
			post.poppers.splice(userIndex, 1);
			const message = "Like";
			await post.save();
			return res.status(200).json({ message, likeCount: post.poppers.length });
		} else {
			post.poppers.push(user.id);
			const message = "Unlike";
			await post.save();
			return res.status(200).json({ message, likeCount: post.poppers.length });
		}
	} catch (error) {
		console.log("Error liking post:", error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for creating a new post
module.exports.createPost = async function (req, res) {
	try {
		const { description, title } = req.body;
		const userEmail = decoder(req.headers.authorization.split(" ")[1]);

		let user = await User.findOne({ email: userEmail });
		let post = await Post.create({ title, description, user: user.id });
		user.post.push(post.id);
		await user.save();
		if (post) {
			return res.status(200).json({
				message: "Post created Successfully",
				data: { post },
			});
		}
	} catch (error) {
		console.log("Error in creating Post:", error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for getting all posts
module.exports.getAllPosts = async function (req, res) {
	try {
		let posts = await Post.find({});
		if (posts) {
			return res.status(200).json({
				message: "Received all posts",
				posts,
			});
		}
	} catch (error) {
		console.log("Error in getting all posts:", error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for getting a single post by ID
module.exports.getPost = async function (req, res) {
	let postID = req.params.postID;
	try {
		let post = await Post.findById(postID);
		if (post) {
			return res.status(200).json({
				message: "Received single post",
				post,
			});
		}
	} catch (error) {
		console.log("Error in getting post:", error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for deleting a post
module.exports.deletePost = async function (req, res) {
	try {
		const { postID } = req.body;
		const userEmail = decoder(req.headers.authorization.split(" ")[1]);

		let user = await User.findOne({ email: userEmail });
		let post = await Post.findById(postID);

		if (post.user.toString() === user.id.toString()) {
			await Post.findByIdAndDelete(post.id);
			await Comment.deleteMany({ post: postID });
			const postIndex = user.post.indexOf(postID);
			if (postIndex !== -1) {
				user.post.splice(postIndex, 1);
			}
			await user.save();
			let allPosts = await Post.find({});
			return res.status(200).json({
				message: "Post deleted Successfully",
				posts: allPosts,
			});
		} else {
			return res.status(401).json({
				message: "Unable to delete post",
			});
		}
	} catch (error) {
		console.log("Error in deleting Post:", error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for updating a post
module.exports.updatePost = async function (req, res) {
	try {
		const { postID, title, description } = req.body;
		const userEmail = decoder(req.headers.authorization.split(" ")[1]);

		// Ensure that the user is authenticated
		if (!userEmail) {
			return res.status(401).json({
				message: "Unauthorized. Please provide a valid authentication token.",
			});
		}

		// Find the user by email
		const user = await User.findOne({ email: userEmail });

		// Ensure that the user exists
		if (!user) {
			return res.status(404).json({
				message: "User not found.",
			});
		}

		// Find the post by ID
		const post = await Post.findById(postID);

		// Ensure that the post exists
		if (!post) {
			return res.status(404).json({
				message: "Post not found.",
			});
		}

		// Ensure that the user is the owner of the post
		if (post.user.toString() !== user.id.toString()) {
			return res.status(401).json({
				message: "Unauthorized. You can only update your own posts.",
			});
		}

		// Update the post
		await Post.findByIdAndUpdate(post.id, { title, description });

		return res.status(200).json({
			message: "Post updated successfully.",
		});
	} catch (error) {
		console.log("Error updating post:", error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for getting all comments on a post
module.exports.getAllComments = async function (req, res) {
	const { postID } = req.body;
	try {
		let post = await Post.findById(postID).populate("comments");
		if (post) {
			return res.status(200).json({
				message: "Received all comments on a Post",
				post: {
					title: post.title,
					description: post.description,
					comments: post.comments,
				},
			});
		}
	} catch (error) {
		console.log("Error in getting all comments:", error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for creating a new comment on a post
module.exports.createComment = async function (req, res) {
	try {
		const { postID, comment } = req.body;
		const userEmail = decoder(req.headers.authorization.split(" ")[1]);
		let post = await Post.findById(postID);
		let user = await User.findOne({ email: userEmail });
		if (post && user) {
			let newComment = await Comment.create({
				comment,
				post: post.id,
				user: user.id,
			});
			if (newComment) {
				post.comments.push(newComment._id);
				await post.save();
				return res.status(200).json({
					message: "Created new Comment",
					data: newComment,
				});
			}
		}
		return res.status(404).json({
			message: "Post Doesn't Exist",
		});
	} catch (error) {
		console.log("Error creating comment:", error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for updating a comment
module.exports.updateComment = async function (req, res) {
	try {
		const { commentID, updatedComment } = req.body;
		const userEmail = decoder(req.headers.authorization.split(" ")[1]);

		let user = await User.findOne({ email: userEmail });
		let comment = await Comment.findById(commentID);
		if (comment.user.toString() === user.id.toString()) {
			await Comment.findByIdAndUpdate(comment.id, { comment: updatedComment });

			return res.status(200).json({
				message: "Comment updated Successfully",
			});
		} else {
			return res.status(401).json({
				message: "Unable to update comment",
			});
		}
	} catch (error) {
		console.log("Error in updating Comment:", error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for deleting a comment
module.exports.deleteComment = async function (req, res) {
	try {
		const { commentID } = req.body;
		const userEmail = decoder(req.headers.authorization.split(" ")[1]);

		let user = await User.findOne({ email: userEmail });
		let comment = await Comment.findById(commentID);
		let post = await Post.findById(comment.post);
		if (comment.user.toString() === user.id.toString()) {
			await Comment.findByIdAndDelete(comment.id);
			const commentIndex = post.comments.indexOf(commentID);
			if (commentIndex !== -1) {
				post.comments.splice(commentIndex, 1);
			}
			await post.save();
			return res.status(200).json({
				message: "Comment deleted Successfully",
			});
		} else {
			return res.status(401).json({
				message: "Unable to delete Comment",
			});
		}
	} catch (error) {
		console.log("Error in deleting Comment:", error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for sharing a post with another user
module.exports.sharePost = async function (req, res) {
	const { toEmail, postID } = req.body;
	const userEmail = decoder(req.headers.authorization.split(" ")[1]);

	try {
		const fromUser = await User.findOne({ email: userEmail });
		const whatPost = await Post.findById(postID);
		const toUser = await User.findOne({ email: toEmail });

		if (toUser && whatPost && fromUser) {
			if (fromUser.id.toString() === toUser.id.toString()) {
				return res.status(200).json({
					message: "You are not that lonely, Maybe you are!",
				});
			}
			const session = await User.startSession();
			session.startTransaction();

			try {
				const share = await Share.create({
					from: fromUser.id,
					what: whatPost.id,
					to: toUser.id,
				});

				toUser.notification.push(share.id);
				await toUser.save();

				await session.commitTransaction();
				session.endSession();

				return res.status(200).json({
					message: "Shared Successfully",
				});
			} catch (error) {
				await session.abortTransaction();
				session.endSession();

				console.log(error);
				return res.status(500).json({
					message: "Internal Server Error",
				});
			}
		}

		return res.status(403).json({
			message: "Unable to share post",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for loading the user's inbox
module.exports.loadInbox = async function (req, res) {
	const userEmail = decoder(req.headers.authorization.split(" ")[1]);

	try {
		let user = await User.findOne({ email: userEmail }).populate({
			path: "notification",
			populate: [
				{ path: "what", model: "Post" }, // Populate the 'what' field with 'Post' documents
				{ path: "from", model: "User", select: "name email" }, // Populate the 'from' field with 'User' documents
			],
		});

		if (user) {
			return res.status(200).json({
				message: "Loaded the inbox",
				inbox: user.notification,
			});
		}

		return res.status(403).json({
			message: "Unable to load the inbox",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};

// Controller for removing a notification from the user's inbox
module.exports.removeFromNotification = async function (req, res) {
	const userEmail = decoder(req.headers.authorization.split(" ")[1]);
	try {
		const { shareID } = req.body;
		const user = await User.findOne({ email: userEmail });
		let share = await Share.findById(shareID);
		await Share.findByIdAndDelete(share._id);

		const notificationIndex = user.notification.indexOf(share._id.toString());

		if (notificationIndex !== -1) {
			user.notification.splice(notificationIndex, 1);
			await user.save();
			return res.status(200).json({
				message: "Deleted from Inbox",
			});
		}
		return res.status(403).json({
			message: "It has never been in the inbox",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
};
