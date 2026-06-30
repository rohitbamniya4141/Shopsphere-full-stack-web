const razorpayInstance = require("../config/razorpay.config");
const crypto = require("crypto");
const orderModel = require("../models/order-model");
const userModel = require("../models/user-model");

exports.createOrder = async (req, res) => {

    try {

        const user = await userModel
            .findById(req.user._id)
            .populate("cart");

        if (!user || user.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        let totalAmount = 0;

        user.cart.forEach(product => {
            totalAmount += Number(product.price) - Number(product.discount || 0);
        });

        // Platform Fee
        totalAmount += 20;

        const options = {
            amount: totalAmount * 100, // Razorpay accepts amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpayInstance.orders.create(options);

        res.status(200).json({
            success: true,
            key: process.env.RAZORPAY_KEY_ID,
            order,
            amount: totalAmount
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to create Razorpay Order"
        });

    }

};
exports.verifyPayment = async (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(
                razorpay_order_id + "|" + razorpay_payment_id
            )
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {

            return res.status(400).json({
                success: false,
                message: "Payment Verification Failed"
            });

        }

        // ===== Payment Verified =====

        // 1. User fetch karo
        const user = await userModel
            .findById(req.user._id)
            .populate("cart");

        // 2. Bill calculate karo
        const totalAmount = user.cart.reduce((sum, product) => {
            return sum + (product.price - product.discount);
        }, 20);

        // 3. Order save karo
        const order = await orderModel.create({

            user: user._id,

            products: user.cart.map(product => product._id),

            totalAmount,

            status: "Paid"

        });
// user order array m save
         user.orders.push(order._id);
        // 4. Cart empty karo
        user.cart = [];

        await user.save();

        // 5. Response bhejo
        return res.json({

            success: true,

            message: "Payment Verified Successfully",

            redirect: "/orders"

        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }


};