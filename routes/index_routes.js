const express = require("express");
const router = express.Router();

const homeController = require("../controllers/home_controller");

router.get("/", homeController.home);

//Defines to use api router
router.use("/api", require("./api/index_api"));

// Custom middleware to handle authentication failure
router.get("/failed-auth", (req, res) => {
	res.status(401).json({ message: "Authentication failed" });
});

module.exports = router;
