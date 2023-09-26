const nodeMailer = require("../config/nodemailer");

// Function to send a forgot password email
exports.forgotPassword = (data) => {
	// Construct the reset password URL
	let url = process.env.RESET_URL;

	// Extract user and token data from the input
	let { user, token } = data;

	// Generate the HTML content for the email using a template
	let htmlString = nodeMailer.renderTemplate(
		{ user, token, url },
		"/fpTemplate.ejs"
	);

	// Send the email using the configured transporter
	nodeMailer.transporter.sendMail(
		{
			from: "authello007@gmail.com",
			to: user.email,
			subject: "Password Reset CornHub",
			html: htmlString,
		},
		(error, info) => {
			if (error) {
				console.log("Error in sending email", error);
				return;
			}
			console.log("Mail Delivered");
			return;
		}
	);
};
