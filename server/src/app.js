const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // For handling cross-origin requests
require("dotenv").config(); // To manage environment variables
const connectDB = require("./database/db");
const authRoutes = require("./server/routes/auth.routes");
const studentRoutes = require("./server/routes/student.routes");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();
// Routes
// app.use("/api/v1/results", resultRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
