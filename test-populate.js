const mongoose = require('mongoose');
const orderModel = require('./models/order-model');
const productModel = require('./models/product-model');

async function test() {
    await mongoose.connect('mongodb://127.0.0.1:27017/shopSphere');
    const order = await orderModel.findOne({ 'purchasedItems.0': { $exists: true } }).populate('purchasedItems.product');
    
    if (order) {
        console.log(JSON.stringify(order.purchasedItems, null, 2));
    }
    process.exit(0);
}
test();
