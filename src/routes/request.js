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
      return res
        .status(400)
        .json({
          message:
            "Invalid status. Allowed values are 'interested' or 'ignored'",
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

module.exports = requestRouter;
