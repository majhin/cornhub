const express = require("express");
const router = express.Router();

//Defines to use v1 router
router.use("/v1", require("./v1/index_api_v1"));

module.exports = router;
