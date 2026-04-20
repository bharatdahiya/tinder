const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://admin_user:U1GWseJACuqKwXTC@nodejs.gxgakr7.mongodb.net/tinderfordev",
  );
};

module.exports = connectDB;
