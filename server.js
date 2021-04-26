// required modules
const express = require("express");
const mongoose = require("mongoose");
const Users = require("./models/Users");
const bcrypt = require("bcrypt");
const app = express();

// mongoose config
mongoose.connect(
	"mongodb://localhost:27017/collegeProject",
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
	(err) => {
		if (err) return console.log(err);
	}
);

// app config
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.get("/", (req, res) => {
	res.render("index");
});

app.get("/register", (req, res) => {
	res.render("register", { error: false });
});

app.post("/register", async (req, res) => {
	// console.log(req.body);
	const { username, email, password, verifyPassword } = req.body;

	if (!username || !email || !password || !verifyPassword)
		return res.render("register", { error: "All fields are required" });

	if (password !== verifyPassword)
		return res.render("register", { error: "Passwords must match" });

	const salt = await bcrypt.genSalt();
	const hashPassword = await bcrypt.hash(password, salt);

	const newUser = await new Users({
		username,
		email,
		password: hashPassword,
	}).save();

	if (!newUser)
		return res.render("register", { error: "Something went wrong!" });

	res.redirect("/dashboard");
});

app.get("/login", (req, res) => {
	res.render("login", { error: false });
});

app.post("/login", async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password)
		return res.render("login", { error: "All fields are required" });

	const existingUser = await Users.findOne({ email });

	if (!existingUser)
		return res.render("login", { error: "Invalid Credentials" });

	const passwordMatch = await bcrypt.compare(password, existingUser.password);

	if (!passwordMatch)
		return res.render("login", { error: "Invalid Credentials" });

	res.redirect("/dashboard");
});

app.get("/dashboard", (req, res) => {
	res.render("dashboard");
});

// PORT and app listening setup
const PORT = 3000 || process.env.PORT;

app.listen(PORT, () => {
	console.log(`app running on http://localhost:${PORT}`);
});
