const mongoose = require('mongoose');
const orderModel = require('./models/order-model');
const productModel = require('./models/product-model');
const sellerModel = require('./models/seller-model');
const userModel = require('./models/user-model');

async function testHistoricalPricing() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/shopSphere');
        
        // 1. Create a mock product and seller
        const testSeller = await sellerModel.create({
            fullname: "Test Seller",
            email: "test_seller_" + Date.now() + "@example.com",
            password: "password123",
            gstin: "22AAAAA0000A1Z5",
            businessName: "Test Business",
            shopName: "Test Shop"
        });

        const testProduct = await productModel.create({
            name: "Test Bag",
            price: 1000,
            discount: 0,
            category: "Backpack",
            stock: 10,
            seller: testSeller._id
        });

        const testUser = await userModel.create({
            fullname: "Test User",
            email: "test_user_" + Date.now() + "@example.com",
            password: "password123"
        });

        // 2. Create an order (simulate purchase at 1000)
        const testOrder = await orderModel.create({
            user: testUser._id,
            products: [testProduct._id],
            purchasedItems: [{
                product: testProduct._id,
                price: 1000,
                discount: 0,
                seller: testSeller._id,
                qty: 1
            }],
            totalAmount: 1020, // 1000 + 20 shipping
            status: "Payment Confirmed",
            paymentId: "pay_test_123"
        });
        
        testUser.orders.push(testOrder._id);
        await testUser.save();

        console.log("Order created successfully at ₹1000.");

        // 3. Change product price to 5000
        testProduct.price = 5000;
        await testProduct.save();
        console.log("Product price changed to ₹5000 in DB.");

        // 4. Verification Check
        // We will fetch the order and verify that using our new logic, it yields 1000
        const orderFetched = await orderModel.findById(testOrder._id).populate('products').populate('purchasedItems.product');
        
        const isNewFormat = orderFetched.purchasedItems && orderFetched.purchasedItems.length > 0;
        const itemsSource = isNewFormat ? orderFetched.purchasedItems : orderFetched.products;
        
        let calculatedPrice = 0;
        itemsSource.forEach(item => {
            const product = isNewFormat ? item.product : item;
            if (product) {
                calculatedPrice = isNewFormat ? item.price : product.price;
            }
        });

        if (calculatedPrice === 1000) {
            console.log("TEST PASSED: Order history / Invoice will show ₹1000.");
        } else {
            console.error(`TEST FAILED: Order history shows ₹${calculatedPrice} instead of ₹1000.`);
            process.exit(1);
        }

        // Analytics check
        let totalRevenue = 0;
        itemsSource.forEach(item => {
            const product = isNewFormat ? item.product : item;
            if(product) {
                const price = isNewFormat ? item.price : product.price;
                totalRevenue += price;
            }
        });
        
        if (totalRevenue === 1000) {
            console.log("TEST PASSED: Analytics will show ₹1000.");
        } else {
            console.error(`TEST FAILED: Analytics shows ₹${totalRevenue} instead of ₹1000.`);
            process.exit(1);
        }

        console.log("All tests passed! Deleting test data...");
        await orderModel.findByIdAndDelete(testOrder._id);
        await productModel.findByIdAndDelete(testProduct._id);
        await sellerModel.findByIdAndDelete(testSeller._id);
        await userModel.findByIdAndDelete(testUser._id);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testHistoricalPricing();
