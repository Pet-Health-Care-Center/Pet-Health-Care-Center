const express = require('express');
const { getServices, getVets, getAllBookings, updateCageHistory } = require('../controllers/allBookingDataController');
const router = express.Router();

/**
 * @swagger
 * /allBookingData/services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: A list of services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: string
 *                       image:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
router.get('/services', getServices);

/**
 * @swagger
 * /allBookingData/vets:
 *   get:
 *     summary: Get all veterinarians
 *     tags: [Vets]
 *     responses:
 *       200:
 *         description: A list of veterinarians
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   fullname:
 *                     type: string
 *                   speciality:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
router.get('/vets', getVets);

/**
 * @swagger
 * /allBookingData/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: A list of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   serviceId:
 *                     type: string
 *                   petId:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *       500:
 *         description: Internal server error
 */
router.get('/bookings', getAllBookings);

router.put("/updateCageHistory/:bookingId", updateCageHistory);

module.exports = router;
