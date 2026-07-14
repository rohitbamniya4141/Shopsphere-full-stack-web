const express = require('express');
const router = express.Router();
const ownerModel = require('../models/owner-model');
const productModel = require('../models/product-model');
const { isValidObjectId } = require('mongoose');
const orderModel = require('../models/order-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const{generateToken} = require('../utils/generateToken');

const userModel = require('../models/user-model');
const reviewModel = require('../models/review-model');
const sellerModel = require('../models/seller-model');
const isOwnerLoggedIn = require('../middlewares/isOwnerLoggedIn');


router.get('/', (req, res) => {
    res.send('Owner route is working!');
});

if(process.env.NODE_ENV === "development"){
    router.post('/create', async function(req, res){
        let owners = await ownerModel.find({});
        if(owners.length > 0){
            return res.status(402).send("You dont have permission to create owner")
        }
        const {fullname, email, password} = req.body;

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            let createdOwner = await ownerModel.create({
                        fullname,
                        email,
                        password: hash,
                    })
         res.status(202).send(createdOwner);
    });
}

router.get('/login', (req, res) => {
    let error = req.flash('error');
    res.render('owner-login', { error, loggedin: false });
});

router.post('/login', async function(req, res){
    try{
        let {email, password} = req.body;

        if(!email || !password){
            req.flash('error', 'Email and password are required');
            return res.redirect('/owners/login');
        }

        let owner = await ownerModel.findOne({email: email});
        if(!owner){
            req.flash('error', 'Email or password is incorrect');
            return res.redirect('/owners/login');
        }

        let result = await bcrypt.compare(password, owner.password);
        if(result){
            let token = generateToken(owner);
            res.cookie("ownerToken", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
            res.redirect("/owners/dashboard");
        }
        else{
            req.flash('error', 'Email or password is incorrect');
            res.redirect('/owners/login');
        }
    }catch(err){
        console.log(err.message);
        req.flash('error', 'Something went wrong, please try again');
        res.redirect('/owners/login');
    }
});

router.get('/admin', isOwnerLoggedIn, async function(req, res){

    let success = req.flash("success");

    const products = await productModel.find();

    const totalProducts = await productModel.countDocuments();

    const totalOrders = await orderModel.countDocuments();

    const orders = await orderModel.find();

    const revenue = orders.reduce((sum, order) => {
        return sum + order.totalAmount;
    }, 0);

    res.render("createproducts",{
        success,
        products,
        totalProducts,
        totalOrders,
        revenue,
        loggedin:true
    });

});

router.get('/delete/:id', isOwnerLoggedIn, async function(req, res){

    try{

        await productModel.findByIdAndDelete(req.params.id);

        req.flash("success","Product deleted successfully");

        res.redirect("/owners/admin");

    }catch(err){

        console.log(err);

        res.send(err);

    }

});

router.get('/edit/:id', isOwnerLoggedIn, async function(req, res){

    let product = await productModel.findById(req.params.id);

    res.render('editproduct', {
        product,
        loggedin: true
    });

});

router.post('/edit/:id', isOwnerLoggedIn, async function(req, res){

    let {name, price, discount, category, stock, bgcolor, panelcolor, textcolor} = req.body;

    await productModel.findByIdAndUpdate(req.params.id, {

        name,
        price,
        discount,
        category: category || 'General',
        stock: stock || 0,
        bgcolor,
        panelcolor,
        textcolor

    });

    req.flash('success', 'Product updated successfully');

    res.redirect('/owners/admin');

});

router.get("/dashboard", isOwnerLoggedIn, async (req, res) => {

    const totalProducts = await productModel.countDocuments();
    const totalOrders = await orderModel.countDocuments();
    const totalCustomers = await userModel.countDocuments();

    const orders = await orderModel.find().select('_id');
    const revResult = await orderModel.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }]);
    const revenue = revResult.length > 0 ? revResult[0].totalRevenue : 0;

    // Top 5 Selling Products
    const allOrders = await orderModel.find().populate('products').populate('purchasedItems.product');
    const productSales = {};
    allOrders.forEach(order => {
        const isNewFormat = order.purchasedItems && order.purchasedItems.length > 0;
        const itemsSource = isNewFormat ? order.purchasedItems : order.products;
        
        itemsSource.forEach(item => {
            const product = isNewFormat ? item.product : item;
            if(!product) return;
            const pid = product._id ? product._id.toString() : product.toString();
            
            if(!productSales[pid]) {
                productSales[pid] = { 
                    product, 
                    price: isNewFormat ? item.price : product.price,
                    totalSold: 0, 
                    totalRevenue: 0 
                };
            }
            
            const itemQty = isNewFormat ? (item.qty || 1) : 1;
            productSales[pid].totalSold += itemQty;
            
            const itemPrice = isNewFormat ? item.price : product.price;
            const itemDiscount = isNewFormat ? item.discount : product.discount;
            productSales[pid].totalRevenue += (itemPrice - (itemDiscount || 0)) * itemQty;
        });
    });
    
    const topProducts = Object.values(productSales)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5);

    // Low Stock Products (stock < 5)
    const lowStockProducts = await productModel.find({ stock: { $lt: 5 } }).sort({ stock: 1 }).limit(10);

    // Latest 5 Orders
    const latestOrders = await orderModel.find()
        .populate('user')
        .populate('products')
        .populate('purchasedItems.product')
        .sort({ createdAt: -1 })
        .limit(5);

    // Latest 5 Customers
    const latestCustomers = await userModel.find()
        .select('-password')
        .sort({ _id: -1 })
        .limit(5);

    res.render("owner-dashboard",{
        loggedin:true,
        isAdmin:true,
        totalProducts,
        totalOrders,
        totalCustomers,
        revenue,
        topProducts,
        lowStockProducts,
        latestOrders,
        latestCustomers
    });

});

router.get('/products', isOwnerLoggedIn, async function(req, res){
    let success = req.flash("success");
    const products = await productModel.find().sort({ createdAt: -1 });
    res.render('admin-products', {
        products,
        success,
        loggedin: true
    });
});

router.get('/orders', isOwnerLoggedIn, async function(req, res){
    const orders = await orderModel.find()
        .populate('user')
        .populate('products')
        .populate('purchasedItems.product')
        .sort({ createdAt: -1 });
    res.render('admin-orders', {
        orders,
        loggedin: true
    });
});

// Admin: Update Order Status
router.post('/orders/:id/status', isOwnerLoggedIn, async function(req, res){
    try{
        let { status } = req.body;
        let order = await orderModel.findById(req.params.id);
        if(!order){
            req.flash('error', 'Order not found');
            return res.redirect('/owners/orders');
        }
        order.status = status;
        order.statusHistory.push({ status: status, date: new Date() });
        await order.save();
        req.flash('success', 'Order status updated to ' + status);
        res.redirect('/owners/orders');
    }catch(err){
        console.log(err);
        res.redirect('/owners/orders');
    }
});

router.get('/users', isOwnerLoggedIn, async function(req, res){
    const users = await userModel.find().select('-password');
    res.render('admin-customers', {
        users,
        loggedin: true
    });
});

// Analytics Page
router.get('/analytics', isOwnerLoggedIn, async function(req, res){
    res.render('admin-analytics', {
        loggedin: true
    });
});

// Analytics API — returns JSON data for Chart.js
router.get('/api/analytics', isOwnerLoggedIn, async function(req, res){
    try{
        const orders = await orderModel.find().populate('products').populate('purchasedItems.product').populate('user');

        // Monthly Revenue & Orders (last 12 months)
        const monthlyData = {};
        const now = new Date();
        for(let i = 11; i >= 0; i--){
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
            monthlyData[key] = { revenue: 0, orders: 0 };
        }
        orders.forEach(order => {
            const key = order.createdAt.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
            if(monthlyData[key]){
                monthlyData[key].revenue += order.totalAmount;
                monthlyData[key].orders += 1;
            }
        });

        // Daily Sales (last 30 days)
        const dailyData = {};
        for(let i = 29; i >= 0; i--){
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            dailyData[key] = 0;
        }
        orders.forEach(order => {
            const key = order.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            if(dailyData[key] !== undefined){
                dailyData[key] += order.totalAmount;
            }
        });

        // Category-wise Sales
        const categoryData = {};
        orders.forEach(order => {
            const isNewFormat = order.purchasedItems && order.purchasedItems.length > 0;
            const itemsSource = isNewFormat ? order.purchasedItems : order.products;
            
            itemsSource.forEach(item => {
                const product = isNewFormat ? item.product : item;
                if(!product) return;
                const cat = product.category || 'General';
                if(!categoryData[cat]) categoryData[cat] = 0;
                const price = isNewFormat ? item.price : product.price;
                const discount = isNewFormat ? item.discount : product.discount;
                categoryData[cat] += price - (discount || 0);
            });
        });

        // Top 5 Customers
        const customerData = {};
        orders.forEach(order => {
            if(order.user){
                const key = order.user._id.toString();
                if(!customerData[key]){
                    customerData[key] = {
                        name: order.user.fullname,
                        email: order.user.email,
                        totalSpent: 0,
                        totalOrders: 0
                    };
                }
                customerData[key].totalSpent += order.totalAmount;
                customerData[key].totalOrders += 1;
            }
        });
        const topCustomers = Object.values(customerData)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5);

        // Summary stats
        const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
        const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

        res.json({
            monthlyLabels: Object.keys(monthlyData),
            monthlyRevenue: Object.values(monthlyData).map(d => d.revenue),
            monthlyOrders: Object.values(monthlyData).map(d => d.orders),
            dailyLabels: Object.keys(dailyData),
            dailySales: Object.values(dailyData),
            categoryLabels: Object.keys(categoryData),
            categorySales: Object.values(categoryData),
            topCustomers,
            totalRevenue,
            avgOrderValue,
            totalOrders: orders.length
        });

    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// ===== Seller Management =====

router.get('/sellers', isOwnerLoggedIn, async function(req, res){
    let success = req.flash('success');
    const sellers = await sellerModel.find().sort({ createdAt: -1 });
    res.render('admin-sellers', {
        sellers,
        success,
        loggedin: true
    });
});

router.post('/sellers/:id/approve', isOwnerLoggedIn, async function(req, res){
    try{
        await sellerModel.findByIdAndUpdate(req.params.id, { isApproved: true, isBlocked: false });
        req.flash('success', 'Seller approved successfully');
        res.redirect('/owners/sellers');
    }catch(err){
        console.log(err);
        res.redirect('/owners/sellers');
    }
});

router.post('/sellers/:id/block', isOwnerLoggedIn, async function(req, res){
    try{
        let seller = await sellerModel.findById(req.params.id);
        seller.isBlocked = !seller.isBlocked;
        await seller.save();
        req.flash('success', seller.isBlocked ? 'Seller blocked' : 'Seller unblocked');
        res.redirect('/owners/sellers');
    }catch(err){
        console.log(err);
        res.redirect('/owners/sellers');
    }
});

router.get('/sellers/:id/delete', isOwnerLoggedIn, async function(req, res){
    try{
        // Delete seller's products
        await productModel.deleteMany({ seller: req.params.id });
        // Delete the seller
        await sellerModel.findByIdAndDelete(req.params.id);
        req.flash('success', 'Seller and their products deleted');
        res.redirect('/owners/sellers');
    }catch(err){
        console.log(err);
        res.redirect('/owners/sellers');
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('ownerToken');
    res.redirect('/owners/login');
});

// ===== Download Invoice (Admin) =====
router.get('/orders/:id/invoice', isOwnerLoggedIn, async function(req, res) {
    try {
        const order = await orderModel.findById(req.params.id)
            .populate('user')
            .populate({
                path: 'products',
                populate: {
                    path: 'seller',
                    model: 'sellers'
                }
            })
            .populate('purchasedItems.product')
            .populate('purchasedItems.seller');

        if (!order) {
            req.flash('error', 'Order not found');
            return res.redirect('/owners/orders');
        }

        const { generateInvoicePDF } = require('../utils/generateInvoice');
        
        const invoiceNumber = `INV-${new Date(order.createdAt).getFullYear()}-${order._id.toString().slice(-6).toUpperCase()}`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoiceNumber}.pdf`);

        const reqHost = req.protocol + '://' + req.get('host');
        await generateInvoicePDF(order, res, reqHost);
        
    } catch(err) {
        console.log(err);
        req.flash('error', 'Failed to generate invoice');
        res.redirect('/owners/orders');
    }
});

module.exports = router;