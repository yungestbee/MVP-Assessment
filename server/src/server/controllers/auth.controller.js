const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { loginSchema, signUp } = require("../../validators/joiValidation");
const generator = require("generate-password");
const crypto = require("crypto");
const sendMail = require("../../utils/transport");
require("dotenv").config();

class AuthController {
  static async register(req, res, next) {
    const value = signUp(req.body);
    console.log(value);
    const { email, firstName, lastName } = value.value;
    try {
      const password = generator.generate({
        length: 10,
        numbers: true,
        symbols: false,
        uppercase: true,
      });
      console.log(password);
      const salt = await bcrypt.genSalt(10);
      let hashedPassword = await bcrypt.hash(password, salt);
      let username = `${firstName}.${lastName?.[0] || ""}`.toLowerCase();

      let user = new User({
        firstName,
        lastName,
        email,
        tempPassword: hashedPassword,
        password: hashedPassword,
        username: username,
      });
      console.log(user);

      await user.save();
      req.user = username;
      req.pass = password;
      // return res.status(201).json({
      //   status: 200,
      //   message: 'User created successfully',
      //   data: user,
      // });
      next();
    } catch (error) {
      console.log(error);
      const errors = errorHandler.dbSchemaErrors(error);
      return res.status(403).json({ Message: errors });
    }
  }

  static async login(req, res) {
    const result = loginSchema(req.body);
    if (result.error) {
      console.log(result.error.details[0].message);
      return res.status(400).json(result.error.details[0].message);
    } else {
      console.log("Validation successful");
    }
    try {
      const { username, password } = result.value;
      let user = await User.findOne({ username });

      if (!user) {
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      if (user.tempPassword === user.password) {
        const isTempMatch = await bcrypt.compare(password, user.tempPassword);
        if (isTempMatch) {
          console.log("first");
          const payload = {
            user: {
              id: user.id,
              name: user.username,
            },
          };
          const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: 3600000,
          });

          let resp = {
            code: 419,
            status: "success",
            message: "Logged in! Now change your password!!!",
            token,
          };
          res.cookie("userToken", token, { maxAge: 1000 * 60 * 60 });
          console.log(resp);
          return res.status(resp.code).json(resp.message);
        } else {
          return res.status(400).json({ msg: "Invalid Credentials" });
        }
      } else {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ msg: "Invalid Credentials" });
        }
        // initiate the resp object
        let resp;
        const payload = {
          user: {
            id: user.id,
            name: user.username,
          },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: 3600000,
        });
        res.cookie("userToken", token, { maxAge: 1000 * 60 * 60 });

        const { password: userPassword, ...userDataWithoutPassword } =
          user.toObject();

        resp = {
          code: 200,
          status: "success",
          message: "Login Successful",
          data: { user: userDataWithoutPassword, token },
        };
        req.user = user.username;
        return res.status(resp.code).json(resp.message);
      }
    } catch (err) {
      // console.error(err.message);
      return res.status(500).send("Error logging in!");
    }
  }

  // static async changePassword(req, res) {
  //   const userId = req.user.id;
  //   console.log(userId);
  //   console.log(req.body);

  //   const { newPassword, confirmNewPassword } = req.body;
  //   if (newPassword == confirmNewPassword) {
  //     try {
  //       let userExist = await User.findById(userId);
  //       if (!userExist) {
  //         return res.status(404).json({ message: "User not found" });
  //       }

  //       const salt = await bcrypt.genSalt();
  //       const hashedPassword = await bcrypt.hash(newPassword, salt);
  //       // Update the password for the correct model
  //       await User.findByIdAndUpdate(
  //         userId,
  //         { password: hashedPassword },
  //         { new: true }
  //       );

  //       return res
  //         .status(201)
  //         .json({ message: "Password changed successfully" });
  //       // else
  //       //   return res
  //       //     .status(403)
  //       //     .json({ message: 'new password similar to previous password' });
  //     } catch (error) {
  //       console.log(error);
  //       return res.status(500).json({ message: "Error changing password" });
  //     }
  //   } else {
  //     return res.status(400).json({ message: "Password mismatch" });
  //   }
  // }

  static async logout(req, res) {
    try {
      res.clearCookie("userToken");
      res.status(200).json({ message: "Logout Successful" });
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("Error logging out!");
    }
  }

  static async forgotPassword(req, res) {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const payload = { id: user._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });

      const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

      const subject = "Password Reset Request";
      const text = `Reset your password here: ${resetLink}`;
      const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetLink}" style="color: #1a73e8;">Reset Password</a>
      <p>If you didn't request this, you can ignore this email.</p>
    </div>
  `;
      await sendMail(user.email, subject, text, html);

      return res.status(200).json({
        message: "Password reset link has been sent to your email",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to process request" });
    }
  }

  static async resetPassword(req, res) {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) return res.status(404).json({ message: "User not found" });

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(newPassword, salt);

      user.password = hashed;
      await user.save();

      return res
        .status(200)
        .json({ message: "Password has been reset successfully" });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: "Invalid or expired token" });
    }
  }
}

module.exports = AuthController;
