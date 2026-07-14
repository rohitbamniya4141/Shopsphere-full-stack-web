const mongoose = require('mongoose');

const sellerSchema = mongoose.Schema({
    fullname: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    phone: Number,
    shopName: String,
    shopLogo: {
        type: String,
        default: ''
    },
    shopDescription: String,
    isApproved: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

module.exports = mongoose.model('sellers', sellerSchema);
