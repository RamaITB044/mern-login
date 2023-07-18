// import modules
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

//app
const app = express();
app.use(bodyParser.json());
// Connect Database
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => console.log("db connection error", err));

//middleware
app.use(morgan("dev"));
app.use(cors({ origin: true, credentials: true }));

//port
const port = process.env.PORT || 8080;

//model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  mobileNumber: String, // Add the mobileNumber field
});
const User = new mongoose.model("user", userSchema);

//routes

//login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      if (password === user.password) {
        res.send({ message: "Login successful", user: user });
      } else {
        res.send({ message: "Password did not match" });
      }
    } else {
      res.send({ message: "User not registered" });
    }
  } catch (err) {
    res.send(err);
  }
});

//register route
app.post("/register", async (req, res) => {
  const { name, email, password, mobileNumber } = req.body; // Extract mobileNumber from req.body
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      res.send({ message: "User already registered" });
    } else {
      const user = new User({
        name,
        email,
        password,
        mobileNumber, // Save the mobileNumber in the user object
      });
      await user.save();
      res.send({ message: "Successfully Registered, Please login now." });
    }
  } catch (err) {
    res.send(err);
  }
});

//listener
const server = app.listen(port, () =>
  console.log(`Server running on port ${port}`)
);
