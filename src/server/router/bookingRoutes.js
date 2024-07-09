// routes/bookingsRoutes.js
const express = require('express');
const { getBookingsByUserId, getBookingDetails, getServices, fetchAllBookingsUser } = require('../controllers/bookingController');
const router = express.Router();

router.get('/:userId', getBookingsByUserId);
router.get("/fetchAll/:userId", fetchAllBookingsUser);

router.get("/:userId/:bookingId", getBookingDetails);

module.exports = router;
