const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },

    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
    }],

    totalAmount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        default: 'Pending'
    }
},{
    timestamps: true
});

module.exports = mongoose.model('orders', orderSchema);