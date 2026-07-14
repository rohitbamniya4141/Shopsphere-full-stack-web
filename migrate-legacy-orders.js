const mongoose = require('mongoose');
const orderModel = require('./models/order-model');
const productModel = require('./models/product-model');

async function migrateLegacyOrders() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/shopSphere');
        console.log("Connected to MongoDB");

        // Find all orders that DO NOT have purchasedItems populated
        const legacyOrders = await orderModel.find({
            $or: [
                { purchasedItems: { $exists: false } },
                { purchasedItems: { $size: 0 } }
            ]
        }).populate('products');

        console.log(`Found ${legacyOrders.length} legacy orders to migrate.`);

        for (let order of legacyOrders) {
            // Reconstruct the original price pool from the totalAmount (subtract 20 shipping)
            const targetTotal = order.totalAmount - 20;

            if (order.products.length === 0) continue;

            const newPurchasedItems = [];

            if (order.products.length === 1) {
                // If there's only 1 product, it must account for 100% of the targetTotal
                newPurchasedItems.push({
                    product: order.products[0]._id,
                    price: targetTotal,
                    discount: 0,
                    seller: order.products[0].seller,
                    qty: 1
                });
            } else {
                // If there are multiple products, we distribute targetTotal proportionally 
                // based on their *current* relative prices to make the math add up perfectly.
                const currentSum = order.products.reduce((sum, p) => sum + (p.price - (p.discount || 0)), 0);
                
                let distributedTotal = 0;
                
                for (let i = 0; i < order.products.length; i++) {
                    const p = order.products[i];
                    
                    let historicalPrice = 0;
                    if (currentSum > 0) {
                        const proportion = (p.price - (p.discount || 0)) / currentSum;
                        historicalPrice = Math.round(targetTotal * proportion);
                    } else {
                        // fallback if current sum is 0 (unlikely)
                        historicalPrice = Math.round(targetTotal / order.products.length);
                    }

                    // Handle rounding errors on the last item
                    if (i === order.products.length - 1) {
                        historicalPrice = targetTotal - distributedTotal;
                    }

                    distributedTotal += historicalPrice;

                    newPurchasedItems.push({
                        product: p._id,
                        price: historicalPrice,
                        discount: 0, // all applied to price
                        seller: p.seller,
                        qty: 1
                    });
                }
            }

            // Save the reconstructed purchasedItems
            order.purchasedItems = newPurchasedItems;
            await order.save();
            console.log(`Migrated Order ${order._id}: TargetTotal=${targetTotal}`);
        }

        console.log("Migration complete.");
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrateLegacyOrders();
