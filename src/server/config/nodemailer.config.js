// nodemailer.config.js

const nodemailer = require('nodemailer');

// Thay đổi các thông tin sau đây để phù hợp với tài khoản email của bạn
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "aqaq03122003@gmail.com",
      pass: "lnaxqylhuaztmnwn",
    },
});

module.exports = transporter;
