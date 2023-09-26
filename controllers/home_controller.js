//Home controller, nothing flashy
module.exports.home = function (req, res) {
	return res.send(
		"<h1><a href='http://localhost:9000/api/v1/user/auth/google'>Google Sign in</a></h1>"
	);
	// return res.status(200).json({
	// 	message: "This works",
	// });
};
