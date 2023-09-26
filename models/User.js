const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		post: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Post",
			},
		],
		notification: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Share",
			},
		],
	},
	{
		timestamps: true,
	}
);

//called whenever save() is called on a user
userSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		try {
			this.password = await bcrypt.hash(this.password, 8);
			return next();
		} catch (err) {
			return next(err);
		}
	}
	return next();
});

//Compare encrypted passwords
userSchema.methods.comparePassword = async function (password) {
	if (!password) throw new Error("Password is mission, cannot compare !");

	try {
		const result = await bcrypt.compare(password, this.password);
		return result;
	} catch (error) {
		console.log("Error while comparing password", error.message);
	}
};

const User = mongoose.model("User", userSchema);

module.exports = User;
