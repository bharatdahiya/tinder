const express = require("express");
const userAuth = require("../middleware/userAuth");
const { validateProfileData } = require("../utils/validationUtils");

const profileRouter = express.Router();

profileRouter.patch("/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileData(req)) {
      throw new Error("Invalid fields in update data");
    }
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }
    Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
    });
    await user.save();
    res.status(200);
    res.json({ message: "Profile updated successfully", data: user });
  } catch (err) {
    console.error("Error during user update:", err);
    res.status(400).send("Something went wrong" + err.message);
  }
});

profileRouter.get("/view", userAuth, async (req, res) => {
  try {
    res.status(200).send("Welcome to your profile, " + req.user.firstName);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = profileRouter;
