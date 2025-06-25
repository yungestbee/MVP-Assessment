const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middlewares/auth.middleware");
const QuestionController = require("../controllers/uploadQuestion")
const upload = require('../../utils/multer')

router.post(
  '/upload-questions',
  AuthMiddleware.authenticateUser,
  upload.single('file'),
  QuestionController.uploadFile
);