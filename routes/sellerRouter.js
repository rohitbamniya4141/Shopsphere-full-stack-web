const express = require('express');
const router = express.Router();
const sellerModel = require('../models/seller-model');
const productModel = require('../models/product-model');
const orderModel = require('../models/order-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const isSellerLoggedIn = require('../middlewares/isSellerLoggedIn');

// ===== Auth Routes =====

router.get('/login', (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    res.render('seller-login', { error, success, loggedin: false });
});

router.get('/register', (req, res) => {
    let error = req.flash('error');
    res.render('seller-register', { error, loggedin: false });
});

router.post('/register', async function(req, res){
    try{
        let {fullname, email, password, phone, shopName, shopDescription} = req.body;

        if(!fullname || !email || !password || !shopName){
            req.flash('error', 'Name, email, password and shop name are required');
            return res.redirect('/sellers/register');
        }

        let existing = await sellerModel.findOne({email: email});
        if(existing){
            req.flash('error', 'A seller account already exists with this email');
            return res.redirect('/sellers/register');
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await sellerModel.create({
            fullname,
            email,
            password: hash,
            phone: phone || null,
            shopName,
            shopDescription: shopDescription || '',
            isApproved: false,
            isBlocked: false
        });

        req.flash('success', 'Registration successful! Please wait for admin approval.');
        res.redirect('/sellers/login');
    }catch(err){
        console.log(err.message);
        req.flash('error', 'Something went wrong, please try again');
        res.redirect('/sellers/register');
    }
});

router.post('/login', async function(req, res){
    try{
        let {email, password} = req.body;

        if(!email || !password){
            req.flash('error', 'Email and password are required');
            return res.redirect('/sellers/login');
        }

        let seller = await sellerModel.findOne({email: email});
        if(!seller){
            req.flash('error', 'Email or password is incorrect');
            return res.redirect('/sellers/login');
        }

        if(seller.isBlocked){
            req.flash('error', 'Your account has been blocked. Please contact admin.');
            return res.redirect('/sellers/login');
        }

        if(!seller.isApproved){
            req.flash('error', 'Your account is pending admin approval. Please wait.');
            return res.redirect('/sellers/login');
        }

        let result = await bcrypt.compare(password, seller.password);
        if(result){
            let token = jwt.sign(
                { email: seller.email, id: seller._id, role: 'seller' },
                process.env.JWT_KEY
            );
            res.cookie("sellerToken", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
            res.redirect("/sellers/dashboard");
        }
        else{
            req.flash('error', 'Email or password is incorrect');
            res.redirect('/sellers/login');
        }
    }catch(err){
        console.log(err.message);
        req.flash('error', 'Something went wrong, please try again');
        res.redirect('/sellers/login');
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('sellerToken');
    res.redirect('/sellers/login');
});

// ===== Dashboard =====

router.get('/dashboard', isSellerLoggedIn, async function(req, res){

    const sellerId = req.seller._id;

    const totalProducts = await productModel.countDocuments({ seller: sellerId });

    // Get seller's product IDs
    const sellerProducts = await productModel.find({ seller: sellerId }).select('_id');
    const sellerProductIds = sellerProducts.map(p => p._id);

    // Find orders containing seller's products
    const orders = await orderModel.find({
        products: { $in: sellerProductIds }
    }).populate('products').populate('purchasedItems.product').populate('user');

    const totalOrders = orders.length;

    let revenue = 0;
    let pendingOrders = 0;
    let deliveredOrders = 0;

    orders.forEach(order => {
        if(order.status === 'Pending' || order.status === 'Payment Confirmed') pendingOrders++;
        if(order.status === 'Delivered') deliveredOrders++;
    });

    const revResult = await orderModel.aggregate([
        { $unwind: '$purchasedItems' },
        { $match: { 'purchasedItems.seller': sellerId } },
        { $group: { _id: null, totalRevenue: { $sum: { $subtract: ['$purchasedItems.price', '$purchasedItems.discount'] } } } }
    ]);
    revenue = revResult.length > 0 ? revResult[0].totalRevenue : 0;

    // Recent 5 orders
    const recentOrders = orders
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5);

    // Top selling products
    const productSales = {};
    orders.forEach(order => {
        const isNewFormat = order.purchasedItems && order.purchasedItems.length > 0;
        const itemsSource = isNewFormat ? order.purchasedItems : order.products;

        itemsSource.forEach(item => {
            const product = isNewFormat ? item.product : item;
            if(!product) return;
            const pid = product._id ? product._id.toString() : product.toString();
            if(sellerProductIds.some(id => id.toString() === pid)){
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
            }
        });
    });
    const topProducts = Object.values(productSales)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5);

    res.render("seller-dashboard", {
        seller: req.seller,
        totalProducts,
        totalOrders,
        revenue,
        pendingOrders,
        deliveredOrders,
        recentOrders,
        topProducts,
        loggedin: true
    });
});

// ===== Product Management =====

router.get('/products', isSellerLoggedIn, async function(req, res){
    let success = req.flash("success");
    const products = await productModel.find({ seller: req.seller._id }).sort({ createdAt: -1 });
    res.render('seller-products', {
        products,
        success,
        seller: req.seller,
        loggedin: true
    });
});

router.get('/products/create', isSellerLoggedIn, async function(req, res){
    let success = req.flash("success");
    res.render('seller-create-product', {
        success,
        seller: req.seller,
        loggedin: true
    });
});

router.post('/products/create', isSellerLoggedIn, async function(req, res){
    try{
        let {name, price, discount, category, stock, bgcolor, panelcolor, textcolor, image, description} = req.body;

        await productModel.create({
            name,
            price,
            discount: discount || 0,
            category: category || 'General',
            stock: stock || 0,
            bgcolor: bgcolor || '#F3F4F6',
            panelcolor: panelcolor || '#FFFFFF',
            textcolor: textcolor || '#111827',
            image: image || '',
            description: description || '',
            seller: req.seller._id
        });

        req.flash('success', 'Product created successfully');
        res.redirect('/sellers/products');
    }catch(err){
        console.log(err);
        req.flash('error', 'Failed to create product');
        res.redirect('/sellers/products/create');
    }
});

router.get('/products/edit/:id', isSellerLoggedIn, async function(req, res){
    try{
        let product = await productModel.findById(req.params.id);
        if(!product || product.seller.toString() !== req.seller._id.toString()){
            req.flash('error', 'Product not found or access denied');
            return res.redirect('/sellers/products');
        }
        res.render('seller-edit-product', {
            product,
            seller: req.seller,
            loggedin: true
        });
    }catch(err){
        console.log(err);
        res.redirect('/sellers/products');
    }
});

router.post('/products/edit/:id', isSellerLoggedIn, async function(req, res){
    try{
        let product = await productModel.findById(req.params.id);
        if(!product || product.seller.toString() !== req.seller._id.toString()){
            req.flash('error', 'Product not found or access denied');
            return res.redirect('/sellers/products');
        }

        let {name, price, discount, category, stock, bgcolor, panelcolor, textcolor, image, description} = req.body;

        await productModel.findByIdAndUpdate(req.params.id, {
            name,
            price,
            discount: discount || 0,
            category: category || 'General',
            stock: stock || 0,
            bgcolor,
            panelcolor,
            textcolor,
            image: image || product.image,
            description: description || product.description
        });

        req.flash('success', 'Product updated successfully');
        res.redirect('/sellers/products');
    }catch(err){
        console.log(err);
        res.redirect('/sellers/products');
    }
});

router.get('/products/delete/:id', isSellerLoggedIn, async function(req, res){
    try{
        let product = await productModel.findById(req.params.id);
        if(!product || product.seller.toString() !== req.seller._id.toString()){
            req.flash('error', 'Product not found or access denied');
            return res.redirect('/sellers/products');
        }

        await productModel.findByIdAndDelete(req.params.id);
        req.flash('success', 'Product deleted successfully');
        res.redirect('/sellers/products');
    }catch(err){
        console.log(err);
        res.redirect('/sellers/products');
    }
});

// ===== Order Management =====

router.get('/orders', isSellerLoggedIn, async function(req, res){
    let success = req.flash('success');

    const sellerProducts = await productModel.find({ seller: req.seller._id }).select('_id');
    const sellerProductIds = sellerProducts.map(p => p._id);

    const orders = await orderModel.find({
        products: { $in: sellerProductIds }
    })
    .populate('user')
    .populate('products')
    .populate('purchasedItems.product')
    .sort({ createdAt: -1 });

    res.render('seller-orders', {
        orders,
        success,
        seller: req.seller,
        sellerProductIds,
        loggedin: true
    });
});

router.post('/orders/:id/status', isSellerLoggedIn, async function(req, res){
    try{
        let { status } = req.body;
        const allowedStatuses = ['Packed', 'Shipped', 'Out For Delivery', 'Delivered'];

        if(!allowedStatuses.includes(status)){
            req.flash('error', 'Invalid status');
            return res.redirect('/sellers/orders');
        }

        let order = await orderModel.findById(req.params.id).populate('products');
        if(!order){
            req.flash('error', 'Order not found');
            return res.redirect('/sellers/orders');
        }

        // Verify this order contains at least one of seller's products
        const sellerProducts = await productModel.find({ seller: req.seller._id }).select('_id');
        const sellerProductIds = sellerProducts.map(p => p._id.toString());
        const hasSellerProduct = order.products.some(p => sellerProductIds.includes(p._id.toString()));

        if(!hasSellerProduct){
            req.flash('error', 'Access denied');
            return res.redirect('/sellers/orders');
        }

        order.status = status;
        order.statusHistory.push({ status: status, date: new Date() });
        await order.save();

        req.flash('success', 'Order status updated to ' + status);
        res.redirect('/sellers/orders');
    }catch(err){
        console.log(err);
        res.redirect('/sellers/orders');
    }
});

// ===== Analytics =====

router.get('/analytics', isSellerLoggedIn, async function(req, res){
    res.render('seller-analytics', {
        seller: req.seller,
        loggedin: true
    });
});

router.get('/api/analytics', isSellerLoggedIn, async function(req, res){
    try{
        const sellerId = req.seller._id;

        const sellerProducts = await productModel.find({ seller: sellerId }).select('_id');
        const sellerProductIds = sellerProducts.map(p => p._id);

        const orders = await orderModel.find({
            products: { $in: sellerProductIds }
        }).populate('products').populate('purchasedItems.product').populate('user');

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
                const isNewFormat = order.purchasedItems && order.purchasedItems.length > 0;
                const itemsSource = isNewFormat ? order.purchasedItems : order.products;
                let orderRevenue = 0;
                itemsSource.forEach(item => {
                    const product = isNewFormat ? item.product : item;
                    if(!product) return;
                    const pid = product._id ? product._id.toString() : product.toString();
                    if(sellerProductIds.some(id => id.toString() === pid)){
                        const price = isNewFormat ? item.price : product.price;
                        const discount = isNewFormat ? item.discount : product.discount;
                        orderRevenue += price - (discount || 0);
                    }
                });
                monthlyData[key].revenue += orderRevenue;
                monthlyData[key].orders += 1;
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
                const pid = product._id ? product._id.toString() : product.toString();
                if(sellerProductIds.some(id => id.toString() === pid)){
                    const cat = product.category || 'General';
                    if(!categoryData[cat]) categoryData[cat] = 0;
                    const price = isNewFormat ? item.price : product.price;
                    const discount = isNewFormat ? item.discount : product.discount;
                    categoryData[cat] += price - (discount || 0);
                }
            });
        });

        // Summary stats
        let totalRevenue = 0;
        orders.forEach(order => {
            const isNewFormat = order.purchasedItems && order.purchasedItems.length > 0;
            const itemsSource = isNewFormat ? order.purchasedItems : order.products;
            itemsSource.forEach(item => {
                const product = isNewFormat ? item.product : item;
                if(!product) return;
                const pid = product._id ? product._id.toString() : product.toString();
                if(sellerProductIds.some(id => id.toString() === pid)){
                    const price = isNewFormat ? item.price : product.price;
                    const discount = isNewFormat ? item.discount : product.discount;
                    totalRevenue += price - (discount || 0);
                }
            });
        });
        const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

        res.json({
            monthlyLabels: Object.keys(monthlyData),
            monthlyRevenue: Object.values(monthlyData).map(d => d.revenue),
            monthlyOrders: Object.values(monthlyData).map(d => d.orders),
            categoryLabels: Object.keys(categoryData),
            categorySales: Object.values(categoryData),
            totalRevenue,
            avgOrderValue,
            totalOrders: orders.length
        });

    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// ===== Download Invoice (Seller) =====
router.get('/orders/:id/invoice', isSellerLoggedIn, async function(req, res) {
    try {
        let order = await orderModel.findById(req.params.id)
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
            return res.redirect('/sellers/orders');
        }

        // Verify seller has at least one product in this order
        const hasProduct = order.products.some(p => p.seller && p.seller._id.toString() === req.seller._id.toString());
        if (!hasProduct) {
            req.flash('error', 'Unauthorized access to invoice');
            return res.redirect('/sellers/orders');
        }

        const { generateInvoicePDF } = require('../utils/generateInvoice');
        
        const invoiceNumber = `INV-${new Date(order.createdAt).getFullYear()}-${order._id.toString().slice(-6).toUpperCase()}`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoiceNumber}.pdf`);

        const reqHost = req.protocol + '://' + req.get('host');
        
        // Wait, for Seller, maybe we should filter the order.products so the PDF only shows their products?
        // Let's filter it dynamically just for this render.
        const sellerOrder = Object.assign({}, order._doc);
        sellerOrder.products = order.products.filter(p => p.seller && p.seller._id.toString() === req.seller._id.toString());
        // Calculate a new total amount for the seller's products only
        sellerOrder.totalAmount = sellerOrder.products.reduce((total, p) => total + (p.price - (p.discount || 0)), 0) + 20; // adding flat 20 shipping

        await generateInvoicePDF(sellerOrder, res, reqHost);
        
    } catch(err) {
        console.log(err);
        req.flash('error', 'Failed to generate invoice');
        res.redirect('/sellers/orders');
    }
});

module.exports = router;
