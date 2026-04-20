const express = require("express");
const validator = require("validator");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/database");
const User = require("./model/user");
const { validateSignupData } = require("./utils/validationUtils");
const userAuth = require("./middleware/userAuth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, age, gender } = req.body;
    const errors = validateSignupData({ firstName, lastName, email, password });
    if (Object.keys(errors).length > 0) {
      return res.status(400).send(errors);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      age,
      gender,
    });
    await newUser.save();
    res.send("User registered");
  } catch (err) {
    console.error("Error during signup:", err.errmsg);
    return res.status(500).send("Internal Server Error" + err.errmsg);
  }
});

app.get("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Email and password are required");
    return;
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).send("Invalid email");
      return;
    }
    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      res.status(400).send("Invalid email or password");
      return;
    }
    const token = await user.getJWT();
    res.cookie("token", token);
    res.status(200).send("Login successful");
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/user", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findOne({ email: userId });
    if (!user) {
      res.status(200).send("User not found");
      return;
    }
    res.status(200).send(user);
  } catch (err) {
    res.send(400).send("Sonething went wrong");
  }
});

app.patch("/user/:userId", async (req, res) => {
  const updatedData = req.body;
  const { userId } = req.params;
  if (!userId || !validator.isEmail(userId.trim())) {
    res.status(400).send("userId is required and should be a valid email");
    return;
  }
  try {
    const ALLOWED_FIELDS = [
      "firstName",
      "lastName",
      "password",
      "age",
      "photourl",
    ];
    const isAllowed = Object.keys(updatedData).every((field) =>
      ALLOWED_FIELDS.includes(field),
    );
    if (!isAllowed) {
      res.status(400).send("Invalid fields in update");
      return;
    }
    const user = await User.findOneAndUpdate({ email: userId }, updatedData, {
      runValidators: true,
      returnDocument: "after",
    });
    if (!user) {
      res.status(200).send("User not found");
      return;
    }
    res.status(200).send("Successfully updated user");
  } catch (err) {
    console.error("Error during user update:", err);
    res.status(400).send("Something went wrong");
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    res.status(200).send("Welcome to your profile, " + req.user.firstName);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  try {
    res.status(200).send("Connection request sent by " + req.user.firstName);
  } catch (err) {
    console.error("Error sending connection request:", err);
    res.status(500).send("Internal Server Error");
  } 
});

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

app.get("/profile", (req, res) => {
  const { id } = req.query;
});
