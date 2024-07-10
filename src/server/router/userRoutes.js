

// routes/userRoutes.js
const express = require('express');
const multer = require('multer');
const { getUserById, updateUserById, uploadAvatar, getAllUsers, getRefundMoneyByUserId, updateRefundMoneyByUserId } = require('../controllers/userController');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /userData/{userId}:
 *   get:
 *     summary: Retrieve a user by ID
 *     tags: [UserData]
 *     description: Retrieve a user by ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to retrieve
 *     responses:
 *       200:
 *         description: A single user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: User not found
 */
router.get('/:userId', getUserById);

/**
 * @swagger
 * /userData:
 *   get:
 *     summary: Retrieve all users
 *     tags: [UserData]
 * 
 *     description: Retrieve all users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *       404:
 *         description: Users not found
 */
router.get('/', getAllUsers);

/**
 * @swagger
 * /userData/{userId}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [UserData]
 * 
 *     description: Update a user by ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       500:
 *         description: Error updating user data
 */
router.put('/:userId', updateUserById);

/**
 * @swagger
 * /userData/{userId}/avatar:
 *   post:
 *     summary: Upload an avatar for a user
 *     tags: [UserData]
 * 
 *     description: Upload an avatar for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to upload avatar for
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       500:
 *         description: Error uploading avatar
 */
router.post('/:userId/avatar', upload.single('avatar'), uploadAvatar);
router.get("/refund/:userId", getRefundMoneyByUserId);
router.put("/refund/:userId/:refundKey", updateRefundMoneyByUserId);

module.exports = router;

