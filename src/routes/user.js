const express = require("express");
const userAuth = require("../middleware/userAuth");
const ConnectionRequest = require("../model/connectionRequest");
const User = require("../model/user");

const usersRouter = express.Router();

const USER_SAFE_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "photourl",
  "age",
  "gender",
  "skills",
];

usersRouter.get("/feed", userAuth, async (req, res) => {
  const params = req.query;
  try {
    const userId = req.user._id;
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    }).select("fromUserId toUserId");

    const hideUsersfromFeed = new Set();
    connectionRequests.forEach((request) => {
      if (request.status === "pending" || request.status === "accepted") {
        hideUsersfromFeed.add(request.fromUserId.toString());
        hideUsersfromFeed.add(request.toUserId.toString());
      }
    });

    const skip = parseInt(params.page) || 0;
    const limit = parseInt(params.limit) || 20;

    const filteredUsers = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersfromFeed) } },
        { _id: { $nin: userId } },
      ],
    })
      .select(USER_SAFE_FIELDS.join(" "))
      .skip(skip)
      .limit(limit);
    res
      .status(200)
      .json({ message: "Data fetched successfully", data: filteredUsers });
  } catch (err) {
    console.error("Error fetching feed:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

module.exports = usersRouter;
