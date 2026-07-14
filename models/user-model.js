const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
    cart: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products'
            }],
        default: []
      },
    wishlist: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products'
        }],
        default: []
    },
    orders: {
      type: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'orders'
      }],
      default: []
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    phone: Number,
    picture: String
  });

  module.exports = mongoose.model('users', userSchema);