const express = require("express");
const razorpayInstance = require("../config/razorpay");
const userAuth = require("../middleware/userAuth");
const Payment = require("../model/payment");
const User = require("../model/user");
const { membershipPlans } = require("../utils/contants");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

const paymentRouter = express.Router();

paymentRouter.post("/create-order", userAuth, async (req, res) => {
  const { membershipType } = req.body;

  try {
    const options = {
      amount: membershipPlans[membershipType].price * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        membershipType: membershipType,
      },
    };

    const order = await razorpayInstance.orders.create(options);

    const payment = new Payment({
      userId: req.user._id,
      amount: order.amount / 100,
      ...order,
    });

    const savedPayment = await payment.save();

    res.status(200).json({
      message: "Order created successfully",
      data: {
        ...savedPayment,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

paymentRouter.post("/verify-payment", userAuth, async (req, res) => {
  try {
    const webhookSignature = req.get("X-Razorpay-Signature");
    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_KEY_SECRET,
    );
    if (!isWebhookValid) {
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const paymentDetails = req.body.payload.payment.entity;

    const paymentRecord = await Payment.findOne({
      orderId: paymentDetails.order_id,
    });
    paymentRecord.status = paymentDetails.status;
    await paymentRecord.save();

    const user = await User.findOne({ _id: paymentRecord.userId });
    user.isPremium = true
    await user.save();

    res.status(200).json({ message: "Payment verified successfully" });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

module.exports = paymentRouter;
