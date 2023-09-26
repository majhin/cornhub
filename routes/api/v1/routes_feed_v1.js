const express = require("express");
const passport = require("passport");
const router = express.Router();

// Import the feed controller for API version 1
const feedControllerV1 = require("../../../controllers/api/v1/controller_feed_v1");

// Define routes for various feed-related operations
router.get("/get-all", feedControllerV1.getAllPosts); // Get all posts
router.get("/get-post/:postID", feedControllerV1.getPost); // Get a specific post by ID
router.post("/create-post", feedControllerV1.createPost); // Create a new post
router.post("/delete-post", feedControllerV1.deletePost); // Delete a post
router.post("/update-post", feedControllerV1.updatePost); // Update a post

router.post("/get-all-comments", feedControllerV1.getAllComments); // Get all comments for a post
router.post("/create-comment", feedControllerV1.createComment); // Create a new comment
router.post("/delete-comment", feedControllerV1.deleteComment); // Delete a comment
router.post("/update-comment", feedControllerV1.updateComment); // Update a comment

router.post("/like-post", feedControllerV1.likePost); // Like or unlike a post
router.post("/share-post", feedControllerV1.sharePost); // Share a post
router.get("/load-inbox", feedControllerV1.loadInbox); // Load user's inbox
router.post(
	"/remove-from-notification",
	feedControllerV1.removeFromNotification
); // Remove an item from user's notifications

module.exports = router;
