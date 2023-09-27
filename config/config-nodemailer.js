const nodemailer = require("nodemailer");
require("dotenv").config();

const sendVerifyEmail = async ({ email, verificationToken }) => {
  const config = {
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

  const server = process.env.SERVER_URL;

  const transporter = nodemailer.createTransport(config);

  const verifyEmail = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email to enjoy phonebook",
    text: `To verify your email just click link: ${server}/users/verify/${verificationToken}`,
  };

  await transporter.sendMail(verifyEmail);
};

module.exports = { sendVerifyEmail };
