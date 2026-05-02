const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, minLength: 4, maxLength: 50 },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error("Email is not valid");
      },
    },
    password: { type: String, required: true },
    age: { type: Number, required: true, min: 18 },
    gender: {
      type: String,
      required: true,
      validate(value) {
        if (!["male", "female", "other"].includes(value))
          throw new Error("Gender is not valid");
      },
    },
    photourl: {
      type: String,
      default:
        '<a href="https://www.flaticon.com/free-icons/user" title="user icons">User icons created by Freepik - Flaticon</a>',
    },
    isPremium: { type: Boolean, default: false },
    membershipType: {
      type: String,
      enum: ["basic", "premium", "gold"],
      default: "basic",
    },
  },
  { timestamps: true },
);

userSchema.methods.getJWT = async function () {
  return await jwt.sign({ _id: this._id }, "Kill@DevTinder", {
    expiresIn: "7d",
  });
};

userSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
module.exports = mongoose.model("User", userSchema);
