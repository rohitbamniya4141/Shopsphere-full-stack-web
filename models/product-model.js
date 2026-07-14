const mongoose = require('mongoose');



const productSchema = mongoose.Schema({

    image: String,

    name: String,

    price: Number,

    discount:{
        type:Number,
        default:0
    },

    category: {
        type: String,
        default: 'General'
    },

    demographic: String,
    
    description: String,
    
    rating: {
        type: Number,
        default: 0
    },
    
    reviews: {
        type: Number,
        default: 0
    },
    bestFor: {
        type: [String],
        default: []
    },
    color: String,
    specifications: {
        capacity: String,
        laptopSize: String,
        waterResistant: Boolean,
        usbCharging: Boolean,
        antiTheft: Boolean,
        weight: String,
        material: String
    },

    stock: {
        type: Number,
        default: 0
    },

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sellers',
        default: null
    },

    bgcolor:String,

    panelcolor:String,

    textcolor:String

},{
    timestamps:true
});

  module.exports = mongoose.model('products', productSchema);