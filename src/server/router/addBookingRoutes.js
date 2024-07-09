const express = require('express');
const { addBooking, updateAccountBalance, updateVetSchedule } = require("../controllers/addBookingController");
const router = express.Router();

/**
 * @swagger
 * /addBookingData/booking:
 *   post:
 *     summary: Add a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               serviceId:
 *                 type: string
 *               petId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Booking added successfully
 *       500:
 *         description: Internal server error
 */
router.post('/booking', addBooking);

/**
 * @swagger
 * /addBookingData/account-balance:
 *   post:
 *     summary: Update account balance
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Account balance updated successfully
 *       500:
 *         description: Internal server error
 */
router.post('/account-balance', updateAccountBalance);

/**
 * @swagger
 * /addBookingData/vet-schedule:
 *   post:
 *     summary: Update vet schedule
 *     tags: [Vets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vetId:
 *                 type: string
 *               schedule:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date-time
 *     responses:
 *       200:
 *         description: Vet schedule updated successfully
 *       500:
 *         description: Internal server error
 */
router.post('/vet-schedule', updateVetSchedule);

module.exports = router;
