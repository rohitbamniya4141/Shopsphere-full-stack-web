const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middlewares/isLoggedIn');
const productModel = require('../models/product-model');
const userModel = require('../models/user-model');
const orderModel = require('../models/order-model');
const reviewModel = require('../models/review-model');
const sellerModel = require('../models/seller-model');



router.get('/', (req, res) => {
  let error = req.flash('error');
  res.render('index', { error: error, loggedin: false });
});
router.get('/shop', isLoggedIn, async function(req, res) {

    let success = req.flash("success");

    // Read Query Parameters
    const search = req.query.search || "";
    const sort = req.query.sort || "popular";
    const price = req.query.price || "";
    const category = req.query.category || "";

    // Dynamic Query
    let query = {
        name: {
            $regex: search,
            $options: "i"
        }
    };

    // Category Filter
    if(category){
        query.category = category;
    }

    // Price Filter
    if(price === "0-1000"){
        query.price = {
            $gte: 0,
            $lte: 1000
        };
    }
    else if(price === "1000-3000"){
        query.price = {
            $gte: 1000,
            $lte: 3000
        };
    }
    else if(price === "3000+"){
        query.price = {
            $gte: 3000
        };
    }

    // Sorting
    let sortOption = {};

    if(sort === "price-low"){
        sortOption = { price: 1 };
    }
    else if(sort === "price-high"){
        sortOption = { price: -1 };
    }
    else if(sort === "newest"){
        sortOption = { createdAt: -1 };
    }

    // Fetch Products
    const products = await productModel
        .find(query)
        .populate('seller', 'shopName')
        .sort(sortOption);

    // Get all distinct categories for sidebar
    const categories = await productModel.distinct('category');

    // Render Page
    res.render("shop",{
        products,
        success,
        search,
        sort,
        price,
        category,
        categories,
        loggedin: true
    });

});

router.get('/cart',isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({email : req.user.email}).populate('cart');
  
  let bill = 0;
  if(user.cart.length > 0){
    user.cart.forEach(item => {
      bill += Number(item.price) - Number(item.discount || 0);
    });
    bill += 20; // platform fee (once, not per item)
  }

  res.render("cart", {
        user,
        bill,
        loggedin: true
    });
});


router.get('/add-to-cart/:id',isLoggedIn, async (req, res) => {
  let product = await productModel.findById(req.params.id);
  if(!product || product.stock <= 0){
    req.flash('error', 'Product is out of stock');
    return res.redirect('/shop');
  }
  let user = await userModel.findOne({email : req.user.email});
  user.cart.push(req.params.id);
  await user.save();
  req.flash('success', 'Product added to cart successfully');
  res.redirect('/shop');
});

router.get('/remove-from-cart/:id',isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({email : req.user.email});
  let index = user.cart.indexOf(req.params.id);
  if(index !== -1){
    user.cart.splice(index, 1);
    await user.save();
  }
  req.flash('success', 'Product removed from cart');
  res.redirect('/cart');
});

router.get('/logout', isLoggedIn, (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});


  

router.get('/orders', isLoggedIn, async function(req, res){

    let user = await userModel
        .findOne({ email: req.user.email })
        .populate({
            path: 'orders',
            populate: [
                { path: 'products' },
                { path: 'purchasedItems.product' }
            ]
        });

    res.render('orders', {
        user,
        loggedin: true
    });
});

router.get('/profile', isLoggedIn, async function(req, res){

    let user = await userModel
        .findOne({ email: req.user.email })
        .populate('cart')
        .populate('orders');

    res.render('profile', {
        user,
        loggedin: true
    });
});

router.get("/checkout", isLoggedIn, async function(req, res){

    let user = await userModel
        .findOne({ email: req.user.email })
        .populate("cart");

    if(user.cart.length === 0){
        req.flash("error","Cart is empty");
        return res.redirect("/cart");
    }

    // Stock validation at checkout
    for(let product of user.cart){
        if(product.stock <= 0){
            req.flash("error", `${product.name} is out of stock. Please remove it from cart.`);
            return res.redirect("/cart");
        }
    }

    let bill = 0;

    user.cart.forEach(product=>{
        bill += Number(product.price) - Number(product.discount || 0);
    });

    bill += 20;

    res.render("checkout",{
        user,
        bill,
        loggedin:true
    });

});

// ===== Product Details =====
router.get('/product/:id', isLoggedIn, async function(req, res){
    try{
        let product = await productModel.findById(req.params.id).populate('seller', 'shopName shopLogo');
        if(!product){
            req.flash('error', 'Product not found');
            return res.redirect('/shop');
        }

        let user = await userModel.findOne({ email: req.user.email }).populate('orders');

        // Check if user has purchased this product
        let hasPurchased = false;
        user.orders.forEach(order => {
            order.products.forEach(pid => {
                if(pid.toString() === product._id.toString()) hasPurchased = true;
            });
        });

        // Get all reviews for this product
        let reviews = await reviewModel.find({ product: product._id })
            .populate('user', 'fullname')
            .sort({ createdAt: -1 });

        // Check if user already reviewed
        let hasReviewed = await reviewModel.findOne({
            product: product._id,
            user: user._id
        });

        // Average rating
        let avgRating = 0;
        if(reviews.length > 0){
            avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            avgRating = Math.round(avgRating * 10) / 10;
        }

        // Related products (same category, exclude current)
        let relatedProducts = await productModel.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(4);

        // Check if product is in user's wishlist
        let inWishlist = user.wishlist && user.wishlist.some(id => id.toString() === product._id.toString());

        res.render('product-details', {
            product,
            reviews,
            avgRating,
            hasPurchased,
            hasReviewed: !!hasReviewed,
            relatedProducts,
            inWishlist,
            loggedin: true
        });
    }catch(err){
        console.log(err);
        res.redirect('/shop');
    }
});

// ===== Submit Review =====
router.post('/product/:id/review', isLoggedIn, async function(req, res){
    try{
        let user = await userModel.findOne({ email: req.user.email });
        let { rating, comment } = req.body;

        // Validate purchase
        let orders = await orderModel.find({ user: user._id });
        let hasPurchased = false;
        orders.forEach(order => {
            order.products.forEach(pid => {
                if(pid.toString() === req.params.id) hasPurchased = true;
            });
        });

        if(!hasPurchased){
            req.flash('error', 'You can only review products you have purchased');
            return res.redirect('/product/' + req.params.id);
        }

        await reviewModel.create({
            user: user._id,
            product: req.params.id,
            rating: Number(rating),
            comment
        });

        res.redirect('/product/' + req.params.id);
    }catch(err){
        console.log(err);
        res.redirect('/product/' + req.params.id);
    }
});

// ===== Wishlist =====
router.get('/wishlist', isLoggedIn, async function(req, res){
    let user = await userModel.findOne({ email: req.user.email }).populate('wishlist');
    res.render('wishlist', {
        user,
        loggedin: true
    });
});

router.get('/add-to-wishlist/:id', isLoggedIn, async function(req, res){
    let user = await userModel.findOne({ email: req.user.email });
    if(!user.wishlist.includes(req.params.id)){
        user.wishlist.push(req.params.id);
        await user.save();
    }
    req.flash('success', 'Added to wishlist');
    res.redirect('back');
});

router.get('/remove-from-wishlist/:id', isLoggedIn, async function(req, res){
    let user = await userModel.findOne({ email: req.user.email });
    let index = user.wishlist.indexOf(req.params.id);
    if(index !== -1){
        user.wishlist.splice(index, 1);
        await user.save();
    }
    req.flash('success', 'Removed from wishlist');
    res.redirect('back');
});

// ===== Cancel Order =====
router.get('/orders/:id/cancel', isLoggedIn, async function(req, res){
    try{
        let order = await orderModel.findById(req.params.id).populate('products');
        if(!order){
            req.flash('error', 'Order not found');
            return res.redirect('/orders');
        }

        // Only allow cancel if Pending or Payment Confirmed
        if(order.status !== 'Pending' && order.status !== 'Payment Confirmed'){
            req.flash('error', 'Order cannot be cancelled after it has been packed');
            return res.redirect('/orders');
        }

        order.status = 'Cancelled';
        order.statusHistory.push({ status: 'Cancelled', date: new Date() });
        await order.save();

        // Restore stock
        for(let product of order.products){
            await productModel.findByIdAndUpdate(product._id, {
                $inc: { stock: 1 }
            });
        }

        req.flash('success', 'Order cancelled successfully');
        res.redirect('/orders');
    }catch(err){
        console.log(err);
        res.redirect('/orders');
    }
});

// ===== Public Seller Store Page =====
router.get('/seller/:id', isLoggedIn, async function(req, res){
    try{
        let seller = await sellerModel.findById(req.params.id).select('-password');
        if(!seller || !seller.isApproved || seller.isBlocked){
            req.flash('error', 'Seller not found');
            return res.redirect('/shop');
        }
        let products = await productModel.find({ seller: seller._id });
        res.render('seller-store', {
            seller,
            products,
            loggedin: true
        });
    }catch(err){
        console.log(err);
        res.redirect('/shop');
    }
});

// ===== Download Invoice (Customer) =====
router.get('/orders/:id/invoice', isLoggedIn, async function(req, res) {
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
            return res.redirect('/orders');
        }

        // Verify ownership
        if (order.user._id.toString() !== req.user._id.toString()) {
            req.flash('error', 'Unauthorized access to invoice');
            return res.redirect('/orders');
        }

        if (order.status !== 'Delivered' && order.status !== 'Shipped' && order.status !== 'Paid' && order.status !== 'Pending') {
            // Usually we allow if it's paid or placed. If it's cancelled, maybe not.
            if(order.status === 'Cancelled') {
                req.flash('error', 'Cannot generate invoice for cancelled orders');
                return res.redirect('/orders');
            }
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
        res.redirect('/orders');
    }
});

module.exports = router;
