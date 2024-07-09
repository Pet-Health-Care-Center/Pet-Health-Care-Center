
const express = require('express');
const { getDatabase, ref, get, update, set } = require('firebase/database');
const router = express.Router();
const  {cancelBooking} = require("../controllers/cancelBookingController")

router.post('/', cancelBooking);
module.exports = router;
   