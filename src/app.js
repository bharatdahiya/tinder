const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config();

const connectDB = require("./config/database");
const authRouter = require("./routes/auth");
const requestRouter = require("./routes/request");  
const profileRouter = require("./routes/profile");
const usersRouter = require("./routes/user");


const app = express();
const PORT = process.env.PORT || 7777;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/request", requestRouter);
app.use("/profile", profileRouter);
app.use("/users", usersRouter);
app.use("/", authRouter);

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));
