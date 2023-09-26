// Import the mongoose library
const mongoose = require("mongoose");

// Define an asynchronous main function to establish a connection to the MongoDB database
async function main() {
	// Connect to the MongoDB database using the URL from the environment variables
	await mongoose.connect(process.env.MONGO_URL);
}

// Execute the main function and handle any potential errors
main().catch((err) => console.log(err));

// Get a reference to the mongoose connection object
const db = mongoose.connection;

// Set up an error event listener for the database connection
db.on("error", console.error.bind(console, "Error connecting to MongoDB"));

// Set up a one-time open event listener for the database connection
db.once("open", () => {
	// Log a message when successfully connected to the database
	console.log("Connected to Database :: MongoDB");
});

// Export the mongoose connection object for use in other parts of the application
module.exports = db;
