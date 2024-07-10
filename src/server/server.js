const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const port = 5000;

const userRoutes = require("./router/userRoutes");
const bookingRoutes = require("./router/bookingRoutes");
const cancelBookingRoutes = require("./router/cancelBookingRoutes");
require("dotenv").config();
const petRoutes = require('./router/petRoutes');
const authRoutes = require("./router/authRoutes");
const servicesRoutes = require("./router/allBookingDataRoutes");
const addBookingRoutes = require("./router/addBookingRoutes");
const transactionRoutes = require("./router/transactionRoutes");
const emailRoutes = require("./router/emailRoutes");
const service_cageRoutes = require("./router/service-cageRoutes");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://mypetcare-center.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Setup static file serving
app.use(express.static('public'));

// Setup CORS
app.use(cors({
  origin: ['http://localhost:3000', 'https://mypetcare-center.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

// Setup Swagger
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
app.use("/", emailRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Setup Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Listen for messages from the client
  socket.on('someEvent', (data) => {
    console.log('Received data:', data);
    // Handle the event and possibly emit an update
    // io.emit('bookingUpdated', updateData);
  });
});

server.listen(port, () => {
  console.log(`nodemailerProject is listening at http://localhost:${port}`);
});
