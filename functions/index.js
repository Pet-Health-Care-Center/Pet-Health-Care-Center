/* eslint-disable max-len */
const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "aqaq03122003@gmail.com",
    pass: "B@o03122003",
  },
});

exports.sendRefundEmail = functions.https.onCall((data, context) => {
  const mailOptions = {
    from: "aqaq03122003@gmail.com",
    to: data.email,
    subject: "Refund Processed",
    text: `Dear ${data.username},\n\nYour refund of ${data.amount} has been processed.\n\nThank you.`,
  };

  return transporter
      .sendMail(mailOptions)
      .then(() => {
        return {success: true};
      })
      .catch((error) => {
        return {success: false, error: error.toString()};
      });
});
