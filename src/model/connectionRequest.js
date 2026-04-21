const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "interested", "accepted", "rejected"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
    },
  },
  { timestamps: true },
);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre("save", async function (next) {
  if (this.fromUserId.toString() === this.toUserId.toString()) {
    throw new Error("You cannot send a connection request to yourself");
  }
  next();
});

module.exports = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema,
);
