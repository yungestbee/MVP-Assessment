const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    password: {
      type: String,
    },
    tempPassword: {
      type: String,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
