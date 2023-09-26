const express = require("express");
const passport = require("passport");
const router = express.Router();

//Defines to use v1 router
router.use("/user", require("./routes_user_v1"));
router.use(
	"/feed",
	passport.authenticate("jwt", {
		session: false,
		failureRedirect: "/failed-auth",
	}),
	require("./routes_feed_v1")
);

module.exports = router;
