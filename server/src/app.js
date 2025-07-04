const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // For handling cross-origin requests
require("dotenv").config(); // To manage environment variables
const connectDB = require("./database/db");
const authRoutes = require("./server/routes/auth.routes");
const studentRoutes = require("./server/routes/student.routes");
const cookieParser = require("cookie-parser");
const testRoutes = require("./server/routes/test.routes");
const syncRoutes = require("./server/routes/sync.routes");

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(
  cors({
    origin: "http://192.168.43.132:3000",
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
app.use("/api", testRoutes);
app.use("/api/v1/sync", syncRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
