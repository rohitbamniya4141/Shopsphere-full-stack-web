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

    purchasedItems: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products'
        },
        price: Number,
        discount: Number,
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sellers'
        },
        qty: {
            type: Number,
            default: 1
        }
    }],

    totalAmount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        default: 'Pending'
    },

    statusHistory: [{
        status: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],

    paymentId: {
        type: String,
        default: ''
    },

    // Development-only benchmark tag — never true in real/production data
    _isBenchmark: {
        type: Boolean,
        default: false,
        select: false   // excluded from normal queries unless explicitly asked
    }
},{ timestamps: true });

module.exports = mongoose.model('orders', orderSchema);