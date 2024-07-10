const express = require('express');
const router = express.Router();
const { getTransactions, updateUserBooking, getTransactionHistory } = require('../controllers/transactionController');

router.get('/transactions', getTransactions);
router.post('/update-booking', updateUserBooking);
router.get('/mbtransactions', getTransactionHistory);

module.exports = router;