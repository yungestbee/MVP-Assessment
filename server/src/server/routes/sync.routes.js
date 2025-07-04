const express = require("express");
const SyncController = require("../controllers/sync.controller");

const router = express.Router();

router.post("/sync", SyncController.uploadData);

module.exports = router;
