const express = require("express");
const AuthMiddleware = require("../middlewares/auth.middleware");
const StudentController = require("../controllers/student.controller");
const router = express.Router();

router.post("/", StudentController.createStudent);
router.get(
  "/:id",
  AuthMiddleware.authenticateUser,
  StudentController.getStudent
);
router.get(
  "/",
  AuthMiddleware.authenticateUser,
  StudentController.getAllStudents
);
router.post("/submit-score", StudentController.updateStudent);

module.exports = router;
