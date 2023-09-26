const mongoose = require("mongoose");

const shareSchema = new mongoose.Schema(
	{
		from: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		what: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
			required: true,
		},
		to: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const Share = mongoose.model("Share", shareSchema);

module.exports = Share;
