const express = require("express");
const userAuth = require("../middleware/userAuth");

const ConnectionRequest = require("../model/connectionRequest");
const User = require("../model/user");

const requestRouter = express.Router();

requestRouter.post("/send/:status/:userId", userAuth, async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.userId;
    const status = req.params.status;

    const receiverExists = await User.findById(receiverId);
    if (!receiverExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const allowedStatuses = ["interested", "ignored"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Allowed values are 'interested' or 'ignored'",
      });
    }

    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: senderId, toUserId: receiverId },
        { fromUserId: receiverId, toUserId: senderId },
      ],
    });

    if (
      existingRequest &&
      existingRequest.status === "interested" &&
      status === "interested"
    ) {
      existingRequest.status = "accepted";
      await existingRequest.save();
      return res
        .status(200)
        .json({ message: "It's a match!", data: existingRequest });
    }

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Connection request already exists" });
    }

    const connectionRequest = new ConnectionRequest({
      fromUserId: senderId,
      toUserId: receiverId,
      status,
    });
    await connectionRequest.save();

    res.status(200).json({
      message: "Connection request sent successfully",
      data: connectionRequest,
    });
  } catch (err) {
    console.error("Error sending connection request:", err);
    res.status(500).send("Internal Server Error");
  }
});

requestRouter.post(
  "/respond/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const requestId = req.params.requestId;
      const status = req.params.status;

      if(!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({
          message: "Invalid status.",
        });
      }

      const existingRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: userId._id,
        status: "interested",
      });

      if (!existingRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }

      existingRequest.status = status;
      await existingRequest.save();
      return res
        .status(200)
        .json({
          message: "Connection request" + status,
          data: existingRequest,
        });
    } catch (err) {
      console.error("Error responding to connection request:", err);
      res.status(500).send("Internal Server Error");
    }
  },
);

module.exports = requestRouter;
