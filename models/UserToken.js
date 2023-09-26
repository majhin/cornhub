const mongoose = require("mongoose");

const userTokenSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

		accessToken: { type: String, required: true },
		isValid: {
			type: Boolean,
			default: true,
		},
		createdAt: {
			type: Date,
			default: Date.now,
			expires: 60 * 60 * 24, // Document will expire after 24 hours
		},
	},
	{
		timestamps: true,
	}
);

const UserToken = mongoose.model("UserToken", userTokenSchema);

module.exports = UserToken;
