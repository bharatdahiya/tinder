const express = require("express"); 
const bcrypt = require("bcrypt");

const User = require("../model/user");
const { validateSignupData } = require("../utils/validationUtils");

const authRouter = express.Router(); 

authRouter.post("/signup", async (req, res) => {
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

authRouter.get("/login", async (req, res) => {
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
    res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) });
    res.status(200).json({ message: "Login successful", data: user });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Internal Server Error");
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).send("Logged out successfully");
});

module.exports = authRouter;