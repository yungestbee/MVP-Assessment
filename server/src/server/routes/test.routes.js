const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
  console.log("yes");
  res.json({ message: "Backend is reachable!" });
});

module.exports = router;
