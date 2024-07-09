const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const app = express();
const port = 5000;
const userRoutes = require("./router/userRoutes");
const bookingRoutes = require("./router/bookingRoutes");
const cancelBookingRoutes = require("./router/cancelBookingRoutes");
require("dotenv").config();
const petRoutes = require('./router/petRoutes');
const authRoutes = require("./router/authRoutes")
const servicesRoutes = require("./router/allBookingDataRoutes")
const addBookingRoutes = require("./router/addBookingRoutes")
const transactionRoutes = require("./router/transactionRoutes")
const service_cageRoutes = require("./router/service-cageRoutes")

app.use(cors({
  origin: ['http://localhost:3000', 'https://mypetcare-center.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

const setupSwagger = require('./swagger');
setupSwagger(app);

// Middleware to parse JSON requests
app.use(express.json());

// Use routes
app.use("/userData", userRoutes);
app.use('/bookings', bookingRoutes);
app.use('/cancel-booking', cancelBookingRoutes);
app.use('/pets', petRoutes);
app.use("/auth", authRoutes);
app.use("/allBookingData", servicesRoutes);
app.use("/addBookingData", addBookingRoutes);
app.use("/transaction", transactionRoutes);
app.use("/services_cages", service_cageRoutes);



function sendEmail({ user_email, user_name, amount, refund_date, request_date }) {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "aqaq03122003@gmail.com",
        pass: "lnaxqylhuaztmnwn",
      },
    });

    const mail_configs = {
      from: "aqaq03122003@gmail.com",
      to: user_email,
      subject: "Thông báo hoàn tiền",
      html: `
   <html>
      <head>
        <style>
          /* Inline CSS styles */
          
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .email-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .email-header {
            text-align: center;
            padding: 20px;
            border-bottom: 1px solid #ddd;
          }
          .email-header .contact-info {
            font-size: 14px;
            color: #333;
            cursor: pointer;
          }
          .email-header .contact-info a {
            color: #007bff;
            text-decoration: none;
          }
          .email-header .contact-info a:hover {
            text-decoration: underline;
          }
          .email-header .logo {
            margin-top: 20px;
          }
          .email-header .logo a {
            font-size: 24px;
            text-decoration: none;
            color: #007bff;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .email-header .logo a:hover {
            text-decoration: underline;
          }
          .email-title {
            text-align: center;
            padding: 20px;
            font-size: 24px;
            color: #007bff;
          }
          .email-content {
            padding: 20px;
            color: #333333;
          }
          .email-content p {
            margin-bottom: 15px;
            line-height: 1.6;
          }
          .email-content p:last-child {
            margin-bottom: 0;
          }
          .email-footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #999999;
            border-top: 1px solid #ddd;
          }
          .email-footer .social-icons a {
            margin: 0 30px;
            text-decoration: none;
            color: #007bff;
            font-size: 18px;
          }
          .fb {
            width: 45px!important;
            height: 45px!important;
            margin-bottom: 6px;
            margin-right: 12px;
          }
          .email-footer .social-icons img {
            width: 60px;
            height: 60px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <div class="logo">
              <a href="#home"> Pet Care Center</a>
            </div>
            <div class="contact-info">
              <p><a href="tel:1900xxx">1900 xxx xxx xxx</a> | <a href="https://mypetcare-center.vercel.app">mypetcare-center.vercel.app</a></p>
            </div>
          </div>
          <div class="email-title">
            <h2>Refund Announcement</h2>
          </div>
          <div class="email-content">
            <p>Hello, ${user_name}</p>
            <p>We are happy to notify you that your request for a refund has been processed successfully.</p>
            <p><strong>Refund Amount:</strong> ${amount}</p>
            <p><strong>Request Day:</strong> ${request_date}</p>
            <p><strong>Refund Day:</strong> ${ refund_date}</p>
            <p>Thank you for using our services.</p>
            <p>Best wishes,<br>Pet Health Care team</p>
          </div>
          <div class="email-footer">
            <p>&copy; 2024 Pet Health Care. All rights reserved.</p>
            <p>Any question please contact</p>
            <div class="social-icons">
              <a href="https://www.facebook.com/baodeptry03"><img class="fb"  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-DPoaXPIw9n83GUBxdDD4OlY1yTF1DGcbbQ&s" alt="Facebook"></a>
              <a href="https://m.me/baodeptry03"><img src="https://static.vecteezy.com/system/resources/previews/012/660/850/non_2x/messenger-logo-on-transparent-isolated-background-free-vector.jpg" alt="Instagram"></a>
              <a href="https://t.me/dbao0312"><img src="https://static.vecteezy.com/system/resources/previews/012/660/859/original/telegram-logo-on-transparent-isolated-background-free-vector.jpg" alt="Twitter"></a>
            </div>
          </div>
        </div>
      </body>
    </html>`
    }
    


    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: `An error has occurred: ${error.message}` });
      }
      return resolve({ message: "Email sent successfully" });
    });
  });
}

app.post("/send-email", (req, res) => {
  const { user_email, user_name, amount, refund_date } = req.body;
  console.log("Received data:", req.body);

  if (!user_email) {
    return res.status(400).send("Error: Missing user_email");
  }

  sendEmail(req.body)
    .then((response) => res.send(response.message))
    .catch((error) => res.status(500).send(error.message));
});


app.listen(port, () => {
  console.log(`nodemailerProject is listening at http://localhost:${port}`);
});