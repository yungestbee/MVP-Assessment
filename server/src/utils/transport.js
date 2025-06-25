const nodemailer = require("nodemailer");
module.exports = async (email, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: text,
      html: html
    });
    console.log("email sent succesffully");
  } catch (error) {
    console.log("email not sent");
    console.log(error.message);
  }
};