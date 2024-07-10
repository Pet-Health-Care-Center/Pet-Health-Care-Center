const express = require("express");
const router = express.Router();
const { sendEmailHandler, sendCancellationEmailHandler } = require("../controllers/emailController");

router.post("/send-email", sendEmailHandler);
router.post("/send-cancellation-email", sendCancellationEmailHandler);

module.exports = router;
