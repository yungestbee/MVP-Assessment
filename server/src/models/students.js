const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    grade: { type: String, required: true },
    score: { type: Object },
    school: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
