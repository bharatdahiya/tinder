const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://@nodejs.gxgakr7.mongodb.net/tinderfordev",
  );
};

module.exports = connectDB;
