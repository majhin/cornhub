require("dotenv").config(); // Configuration for environment variables

const express = require("express");
const http = require("http");
const cors = require("cors");
const db = require("./config/mongoose");
const expressLayouts = require("express-ejs-layouts");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

// Session and authentication setup
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("./config/passport-local-strategy");
const passportJWT = require("./config/passport-jwt-strategy");
const passportGoogleOAuth2 = require("./config/passport-google-oauth2-strategy");
const MongoStore = require("connect-mongo");

const app = express();
const port = process.env.PORT;

// Enable CORS for specific client origin
app.use(
	cors({
		origin: process.env.CLIENT_URL, // Replace with your client's origin
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		credentials: true,
	})
);

const server = http.Server(app);
const sockets = require("./config/sockets").sockets(server);
server.listen(5000);

// Using URL encoded header
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Setting the View Engine and views path
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layout.ejs");
app.use(expressLayouts);

// For the link tag to appear in the head of the layout
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

app.use(
	session({
		name: process.env.JWT_SECRET,
		secret: process.env.SECRET,
		saveUninitialized: false,
		resave: false,
		cookie: {
			maxAge: 1000 * 60 * 100,
		},
		store: MongoStore.create({
			mongoUrl: process.env.MONGO_URL,
			autoRemove: "disabled",
		}),
	})
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Sets the authenticated user in locals
app.use(passport.setAuthenticatedUser);

// Router access
app.use("/", require("./routes/index_routes"));

app.listen(port, () => {
	console.log(`URL :  http://localhost:${port}/`);
});
