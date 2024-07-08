const express = require("express");
const {
  getServices,
  getVets,
  getAllBookings,
  updateCageHistory,
} = require("../controllers/allBookingDataController");
const router = express.Router();

router.get("/services", getServices);
router.get("/vets", getVets);
router.get("/bookings", getAllBookings);
router.put("/updateCageHistory/:bookingId", updateCageHistory);

module.exports = router;
