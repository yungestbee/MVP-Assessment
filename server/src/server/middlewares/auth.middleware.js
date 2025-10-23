// server/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const db = require("../../database/db");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const AuthMiddleware = {
  authenticateUser: (req, res, next) => {
    try {
      const token =
        req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Access denied. No token." });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "Invalid token" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Invalid or expired token" });
    }
  },
};

module.exports = AuthMiddleware;
