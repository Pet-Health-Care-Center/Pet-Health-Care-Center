const express = require('express');
const router = express.Router();
const { getTransactions, updateUserBooking } = require('../controllers/transactionController');

router.get('/transactions', getTransactions);
router.post('/update-booking', updateUserBooking);

module.exports = router;