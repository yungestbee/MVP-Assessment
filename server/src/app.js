// server/src/app.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const fs = require("fs");
require("dotenv").config();

// Initialize DB
require("./database/db");

// Import routes
const authRoutes = require("./server/routes/auth.routes");
const studentRoutes = require("./server/routes/student.routes");
const testRoutes = require("./server/routes/test.routes");
const syncRoutes = require("./server/routes/sync.routes");

function createServerApp() {
  const app = express();

  app.use((req, res, next) => {
    const origin = req.headers.origin || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      return res.sendStatus(200); // Handle preflight
    }

    next();
  });

  app.use(express.json());
  app.use(cookieParser());

  // Routes
  app.get("/api/v1/health", (req, res) => res.sendStatus(200));
  app.use("/api/v1/students", studentRoutes);
  app.use("/api/v1", authRoutes);
  app.use("/api", testRoutes);
  app.use("/api/v1/sync", syncRoutes);

  // Serve frontend
  const devClientPath = path.join(__dirname, "../client/dist");
  const prodClientPath = path.join(__dirname, "../../client/dist");
  const clientDistPath = fs.existsSync(devClientPath)
    ? devClientPath
    : prodClientPath;

  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get("/*", (req, res) => {
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  return app;
}

module.exports = createServerApp;
