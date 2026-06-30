const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");
const isLoggedIn = require("../middlewares/isLoggedIn");

router.post("/create-order", isLoggedIn, paymentController.createOrder);
router.post("/verify-payment", isLoggedIn, paymentController.verifyPayment);

module.exports = router;