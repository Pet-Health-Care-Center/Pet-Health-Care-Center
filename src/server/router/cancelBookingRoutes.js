const express = require("express");
const router = express.Router();
const { cancelBooking } = require("../controllers/cancelBookingController");

router.post("/", cancelBooking);
module.exports = router;
