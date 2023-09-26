// Import necessary libraries for sending emails
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

// Create a nodemailer transporter with Gmail as the email service provider
let transporter = nodemailer.createTransport({
	service: "gmail",
	host: "smtp.gmail.com",
	port: 587,
	secure: false, // Not using secure connection
	auth: {
		user: process.env.EMAIL_AUTHELLO, // Your Gmail email address
		pass: process.env.PASSWORD_AUTHELLO, // Your Gmail password or app-specific password
	},
});

// Function to render an email template using EJS
let renderTemplate = (data, relativePath) => {
	let mailHTML;
	// Render the email template using EJS
	ejs.renderFile(
		path.join(__dirname, "../views/mailers", relativePath), // Path to the EJS template file
		data, // Data to be injected into the template
		function (err, template) {
			if (err) {
				console.log("Error in rendering template", err);
			}
			mailHTML = template; // Store the rendered HTML in mailHTML
		}
	);
	return mailHTML; // Return the rendered HTML content
};

// Export the nodemailer transporter and the renderTemplate function for use in other parts of the application
module.exports = {
	transporter,
	renderTemplate,
};
