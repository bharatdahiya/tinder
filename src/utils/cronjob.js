const cron = require("node-cron");
const ConnectionRequest = require("../model/connectionRequest");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const sendNotificationEmail = require("./sendEmail");

cron.schedule("0 8 * * *", async () => {
  console.log("Running daily cleanup task at 8 AM");
  // Add your cleanup logic here, e.g., deleting old records from the database

  try {
    const cutoffDate = subDays(new Date(), 1);
    const cuttoffStartTimeStamp = startOfDay(cutoffDate);
    const cutoffEndTimeStamp = endOfDay(cutoffDate);

    const pendingRequests = await ConnectionRequest.find({
      status: "interested",
      createdAt: { $gte: cuttoffStartTimeStamp, $lte: cutoffEndTimeStamp },
    }).populate("fromUserId toUserId");

    //To avoid sending multiple emails to the same user, we can use a Set to store unique email addresses
    const listOfEmailsToNotify = [
      new Set(...pendingRequests.map((req) => req.fromUserId.email)),
    ];

    for (const email of listOfEmailsToNotify) {
      try {
        const res = await sendNotificationEmail.run(
          "New Friend Request pending for" + email,
          "You have a new friend request pending. Please log in to your account to view and respond to the request.",
          email,
        );
        console.log(`Notification sent to ${email}:`, res);
      } catch (err) {
        console.error(`Error sending notification to ${email}:`, err);
      }
    }
  } catch (err) {
    console.error("Error during cleanup task:", err);
  }
});

module.exports = cron;
