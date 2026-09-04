const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const productModel = require('../models/product-model');
const userModel = require('../models/user-model');
const orderModel = require('../models/order-model');
const reviewModel = require('../models/review-model');
const sellerModel = require('../models/seller-model');
const ownerModel = require('../models/owner-model');

const { generateToken } = require('../utils/generateToken');
const { getSellerAnalytics, getOwnerAnalytics } = require('../utils/analyticsService');
const upload = require('../config/multer-config');

// ─────────────────────────────────────────────────────────────────────────────
// Middleware for API authentication (returns JSON on 401 instead of redirect)
// ─────────────────────────────────────────────────────────────────────────────

async function apiAuthUser(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'You must be logged in' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const user = await userModel.findOne({ email: decoded.email }).select('-password');
        if (!user) {
            return res.status(401).json({ error: 'User session not found' });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired session token' });
    }
}

async function apiAuthSeller(req, res, next) {
    const token = req.cookies.sellerToken;
    if (!token) {
        return res.status(401).json({ error: 'You must be logged in as seller' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const seller = await sellerModel.findOne({ email: decoded.email }).select('-password');
        if (!seller) {
            return res.status(401).json({ error: 'Seller session not found' });
        }
        if (seller.isBlocked) {
            res.clearCookie('sellerToken');
            return res.status(403).json({ error: 'Your seller account has been blocked by admin' });
        }
        if (!seller.isApproved) {
            res.clearCookie('sellerToken');
            return res.status(403).json({ error: 'Your seller account is pending admin approval' });
        }
        req.seller = seller;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired seller session' });
    }
}

async function apiAuthAdmin(req, res, next) {
    const token = req.cookies.ownerToken;
    if (!token) {
        return res.status(401).json({ error: 'You must be logged in as admin' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const owner = await ownerModel.findOne({ email: decoded.email }).select('-password');
        if (!owner) {
            return res.status(401).json({ error: 'Admin session not found' });
        }
        req.owner = owner;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired admin session' });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CUSTOMER AUTH & STATE
// ─────────────────────────────────────────────────────────────────────────────

// Check Current Customer
router.get('/auth/me', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.json({ loggedin: false, user: null });
        }
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const user = await userModel.findOne({ email: decoded.email })
            .select('-password')
            .populate('cart')
            .populate('wishlist');
        if (!user) {
            return res.json({ loggedin: false, user: null });
        }
        res.json({ loggedin: true, user });
    } catch (err) {
        res.json({ loggedin: false, user: null });
    }
});

// Customer Register
router.post('/auth/register', async (req, res) => {
    try {
        const { fullname, email, password } = req.body;
        if (!fullname || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const existing = await userModel.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'User already exists with this email. Please login.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const createdUser = await userModel.create({
            fullname,
            email,
            password: hash,
            cart: [],
            wishlist: [],
            orders: []
        });

        const token = generateToken(createdUser);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const userResponse = createdUser.toObject();
        delete userResponse.password;
        res.status(201).json({ success: true, user: userResponse });
    } catch (err) {
        console.error('Customer Register Error:', err);
        res.status(500).json({ error: err.message || 'Registration failed' });
    }
});

// Customer Login
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Email or password is incorrect' });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Email or password is incorrect' });
        }

        const token = generateToken(user);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const userResponse = user.toObject();
        delete userResponse.password;
        res.json({ success: true, user: userResponse });
    } catch (err) {
        console.error('Customer Login Error:', err);
        res.status(500).json({ error: err.message || 'Login failed' });
    }
});

// Customer Logout
router.post('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
});

// Customer Profile
router.get('/profile', apiAuthUser, async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email })
            .select('-password')
            .populate('cart')
            .populate({
                path: 'orders',
                options: { sort: { createdAt: -1 } },
                populate: [
                    { path: 'products' },
                    { path: 'purchasedItems.product' }
                ]
            });
        res.json({
            user,
            cartCount: user.cart ? user.cart.length : 0,
            ordersCount: user.orders ? user.orders.length : 0,
            recentOrders: user.orders ? user.orders.slice(0, 5) : []
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load profile' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. PRODUCTS & CATALOG
// ─────────────────────────────────────────────────────────────────────────────

// Catalog with Search, Category, Price Range, Sorting, and Pagination
router.get('/products', async (req, res) => {
    try {
        const search = req.query.search || '';
        const sort = req.query.sort || 'popular';
        const price = req.query.price || '';
        const category = req.query.category || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 24;
        const skip = (page - 1) * limit;

        const query = {
            name: { $regex: search, $options: 'i' }
        };

        if (category && category !== 'All') {
            query.category = category;
        }

        if (price === '0-1000') {
            query.price = { $gte: 0, $lte: 1000 };
        } else if (price === '1000-3000') {
            query.price = { $gte: 1000, $lte: 3000 };
        } else if (price === '3000+') {
            query.price = { $gte: 3000 };
        }

        let sortOption = {};
        if (sort === 'price-low') {
            sortOption = { price: 1 };
        } else if (sort === 'price-high') {
            sortOption = { price: -1 };
        } else if (sort === 'newest') {
            sortOption = { createdAt: -1 };
        } else {
            sortOption = { createdAt: -1 };
        }

        const [products, totalCount, categories] = await Promise.all([
            productModel.find(query)
                .populate('seller', 'shopName shopLogo')
                .sort(sortOption)
                .skip(skip)
                .limit(limit),
            productModel.countDocuments(query),
            productModel.distinct('category')
        ]);

        res.json({
            products,
            categories,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit)
        });
    } catch (err) {
        console.error('Products fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Single Product Details
router.get('/products/:id', async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id)
            .populate('seller', 'shopName shopLogo shopDescription');
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        let hasPurchased = false;
        let hasReviewed = false;
        let inWishlist = false;

        // Check user-specific state if logged in
        const token = req.cookies.token;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_KEY);
                const user = await userModel.findOne({ email: decoded.email }).populate('orders');
                if (user) {
                    if (user.wishlist && user.wishlist.some(id => id.toString() === product._id.toString())) {
                        inWishlist = true;
                    }
                    if (user.orders) {
                        user.orders.forEach(order => {
                            if (order.products && order.products.some(p => p.toString() === product._id.toString())) {
                                hasPurchased = true;
                            }
                            if (order.purchasedItems && order.purchasedItems.some(i => i.product && i.product.toString() === product._id.toString())) {
                                hasPurchased = true;
                            }
                        });
                    }
                    const reviewExists = await reviewModel.findOne({ product: product._id, user: user._id });
                    if (reviewExists) {
                        hasReviewed = true;
                    }
                }
            } catch (e) {
                // Token invalid, proceed as guest
            }
        }

        const reviews = await reviewModel.find({ product: product._id })
            .populate('user', 'fullname')
            .sort({ createdAt: -1 });

        let avgRating = 0;
        if (reviews.length > 0) {
            avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            avgRating = Math.round(avgRating * 10) / 10;
        }

        const relatedProducts = await productModel.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(4);

        res.json({
            product,
            reviews,
            avgRating,
            hasPurchased,
            hasReviewed,
            relatedProducts,
            inWishlist
        });
    } catch (err) {
        console.error('Product detail error:', err);
        res.status(500).json({ error: 'Failed to fetch product details' });
    }
});

// Submit Product Review
router.post('/products/:id/review', apiAuthUser, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || !comment) {
            return res.status(400).json({ error: 'Rating and comment are required' });
        }

        const user = req.user;
        const orders = await orderModel.find({ user: user._id });
        let hasPurchased = false;
        orders.forEach(order => {
            if (order.products && order.products.some(pid => pid.toString() === req.params.id)) {
                hasPurchased = true;
            }
            if (order.purchasedItems && order.purchasedItems.some(i => i.product && i.product.toString() === req.params.id)) {
                hasPurchased = true;
            }
        });

        if (!hasPurchased) {
            return res.status(403).json({ error: 'You can only review products you have purchased' });
        }

        const existing = await reviewModel.findOne({ user: user._id, product: req.params.id });
        if (existing) {
            return res.status(400).json({ error: 'You have already reviewed this product' });
        }

        const review = await reviewModel.create({
            user: user._id,
            product: req.params.id,
            rating: Number(rating),
            comment
        });

        res.status(201).json({ success: true, review });
    } catch (err) {
        console.error('Review creation error:', err);
        res.status(500).json({ error: err.message || 'Failed to submit review' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. CART & WISHLIST
// ─────────────────────────────────────────────────────────────────────────────

// Get Cart
router.get('/cart', apiAuthUser, async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).populate('cart');
        let bill = 0;
        if (user.cart && user.cart.length > 0) {
            user.cart.forEach(item => {
                bill += Number(item.price) - Number(item.discount || 0);
            });
            bill += 20; // flat platform fee
        }
        res.json({ cart: user.cart || [], bill });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// Add to Cart
router.post('/cart/add/:id', apiAuthUser, async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product || product.stock <= 0) {
            return res.status(400).json({ error: 'Product is out of stock' });
        }
        const user = await userModel.findById(req.user._id);
        user.cart.push(req.params.id);
        await user.save();
        res.json({ success: true, message: 'Added to cart', cartCount: user.cart.length });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

// Remove from Cart
router.post('/cart/remove/:id', apiAuthUser, async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        const index = user.cart.indexOf(req.params.id);
        if (index !== -1) {
            user.cart.splice(index, 1);
            await user.save();
        }
        const updatedUser = await userModel.findById(req.user._id).populate('cart');
        let bill = 0;
        if (updatedUser.cart && updatedUser.cart.length > 0) {
            updatedUser.cart.forEach(item => {
                bill += Number(item.price) - Number(item.discount || 0);
            });
            bill += 20;
        }
        res.json({ success: true, cart: updatedUser.cart, bill, cartCount: updatedUser.cart.length });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove from cart' });
    }
});

// Get Wishlist
router.get('/wishlist', apiAuthUser, async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).populate('wishlist');
        res.json({ wishlist: user.wishlist || [] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
});

// Toggle Wishlist
router.post('/wishlist/toggle/:id', apiAuthUser, async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        const pid = req.params.id;
        const index = user.wishlist.indexOf(pid);
        let inWishlist = false;
        if (index !== -1) {
            user.wishlist.splice(index, 1);
            inWishlist = false;
        } else {
            user.wishlist.push(pid);
            inWishlist = true;
        }
        await user.save();
        res.json({ success: true, inWishlist, wishlistCount: user.wishlist.length });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update wishlist' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. ORDERS & CHECKOUT DATA
// ─────────────────────────────────────────────────────────────────────────────

// Get Checkout Summary Data
router.get('/checkout', apiAuthUser, async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).populate('cart');
        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }
        for (const item of user.cart) {
            if (item.stock <= 0) {
                return res.status(400).json({ error: `${item.name} is out of stock. Please remove it from cart.` });
            }
        }
        let bill = 0;
        user.cart.forEach(product => {
            bill += Number(product.price) - Number(product.discount || 0);
        });
        bill += 20;
        res.json({ user, cart: user.cart, bill });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load checkout' });
    }
});

// Get Customer Orders
router.get('/orders', apiAuthUser, async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).populate({
            path: 'orders',
            options: { sort: { createdAt: -1 } },
            populate: [
                { path: 'products' },
                { path: 'purchasedItems.product' }
            ]
        });
        res.json({ orders: user.orders || [] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Cancel Order
router.post('/orders/:id/cancel', apiAuthUser, async (req, res) => {
    try {
        const order = await orderModel.findById(req.params.id).populate('products');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized to cancel this order' });
        }
        if (order.status !== 'Pending' && order.status !== 'Payment Confirmed') {
            return res.status(400).json({ error: 'Order cannot be cancelled after it has been packed or shipped' });
        }

        order.status = 'Cancelled';
        order.statusHistory.push({ status: 'Cancelled', date: new Date() });
        await order.save();

        // Restore stock
        for (const product of order.products) {
            await productModel.findByIdAndUpdate(product._id, { $inc: { stock: 1 } });
        }

        res.json({ success: true, message: 'Order cancelled successfully', order });
    } catch (err) {
        console.error('Cancel order error:', err);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
});

// Public Seller Storefront
router.get('/sellers/:id/store', async (req, res) => {
    try {
        const seller = await sellerModel.findById(req.params.id).select('-password');
        if (!seller || !seller.isApproved || seller.isBlocked) {
            return res.status(404).json({ error: 'Seller not found or inactive' });
        }
        const products = await productModel.find({ seller: seller._id });
        res.json({ seller, products });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load seller storefront' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. SELLER PANEL APIS
// ─────────────────────────────────────────────────────────────────────────────

// Check Current Seller
router.get('/seller/me', async (req, res) => {
    try {
        const token = req.cookies.sellerToken;
        if (!token) {
            return res.json({ loggedin: false, seller: null });
        }
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const seller = await sellerModel.findOne({ email: decoded.email }).select('-password');
        if (!seller || seller.isBlocked || !seller.isApproved) {
            return res.json({ loggedin: false, seller: null });
        }
        res.json({ loggedin: true, seller });
    } catch (err) {
        res.json({ loggedin: false, seller: null });
    }
});

// Seller Register
router.post('/seller/register', async (req, res) => {
    try {
        const { fullname, email, password, phone, shopName, shopDescription } = req.body;
        if (!fullname || !email || !password || !shopName) {
            return res.status(400).json({ error: 'Name, email, password and shop name are required' });
        }
        const existing = await sellerModel.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'A seller account already exists with this email' });
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
        res.status(201).json({
            success: true,
            message: 'Registration successful! Your account is pending admin approval.'
        });
    } catch (err) {
        console.error('Seller Register Error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Seller Login
router.post('/seller/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const seller = await sellerModel.findOne({ email });
        if (!seller) {
            return res.status(401).json({ error: 'Email or password is incorrect' });
        }
        if (seller.isBlocked) {
            return res.status(403).json({ error: 'Your account has been blocked. Please contact admin.' });
        }
        if (!seller.isApproved) {
            return res.status(403).json({ error: 'Your account is pending admin approval.' });
        }
        const match = await bcrypt.compare(password, seller.password);
        if (!match) {
            return res.status(401).json({ error: 'Email or password is incorrect' });
        }

        const token = jwt.sign(
            { email: seller.email, id: seller._id, role: 'seller' },
            process.env.JWT_KEY
        );
        res.cookie('sellerToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const sellerResp = seller.toObject();
        delete sellerResp.password;
        res.json({ success: true, seller: sellerResp });
    } catch (err) {
        console.error('Seller Login Error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Seller Logout
router.post('/seller/logout', (req, res) => {
    res.clearCookie('sellerToken');
    res.json({ success: true, message: 'Logged out successfully' });
});

// Seller Dashboard
router.get('/seller/dashboard', apiAuthSeller, async (req, res) => {
    try {
        const sellerId = req.seller._id;
        const totalProducts = await productModel.countDocuments({ seller: sellerId });
        const sellerProducts = await productModel.find({ seller: sellerId }).select('_id');
        const sellerProductIds = sellerProducts.map(p => p._id);

        const orders = await orderModel.find({ products: { $in: sellerProductIds } })
            .populate('products')
            .populate('purchasedItems.product')
            .populate('user', 'fullname email');

        let pendingOrders = 0;
        let deliveredOrders = 0;
        orders.forEach(order => {
            if (order.status === 'Pending' || order.status === 'Payment Confirmed') pendingOrders++;
            if (order.status === 'Delivered') deliveredOrders++;
        });

        const revResult = await orderModel.aggregate([
            { $unwind: '$purchasedItems' },
            { $match: { 'purchasedItems.seller': sellerId } },
            { $group: { _id: null, totalRevenue: { $sum: { $subtract: ['$purchasedItems.price', '$purchasedItems.discount'] } } } }
        ]);
        const revenue = revResult.length > 0 ? revResult[0].totalRevenue : 0;

        const recentOrders = orders.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

        res.json({
            seller: req.seller,
            totalProducts,
            totalOrders: orders.length,
            revenue,
            pendingOrders,
            deliveredOrders,
            recentOrders
        });
    } catch (err) {
        console.error('Seller Dashboard Error:', err);
        res.status(500).json({ error: 'Failed to load seller dashboard' });
    }
});

// Seller Products List
router.get('/seller/products', apiAuthSeller, async (req, res) => {
    try {
        const products = await productModel.find({ seller: req.seller._id }).sort({ createdAt: -1 });
        res.json({ products });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch seller products' });
    }
});

// Seller Product Create
router.post('/seller/products/create', apiAuthSeller, upload.single('imageFile'), async (req, res) => {
    try {
        let { name, price, discount, category, stock, bgcolor, panelcolor, textcolor, image, description } = req.body;
        let imageString = image || '';
        if (req.file) {
            imageString = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }
        const product = await productModel.create({
            name,
            price: Number(price),
            discount: Number(discount || 0),
            category: category || 'General',
            stock: Number(stock || 0),
            bgcolor: bgcolor || '#F3F4F6',
            panelcolor: panelcolor || '#FFFFFF',
            textcolor: textcolor || '#111827',
            image: imageString,
            description: description || '',
            seller: req.seller._id
        });
        res.status(201).json({ success: true, product });
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Seller Product Edit
router.put('/seller/products/:id', apiAuthSeller, upload.single('imageFile'), async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product || !product.seller || product.seller.toString() !== req.seller._id.toString()) {
            return res.status(403).json({ error: 'Product not found or access denied' });
        }
        let { name, price, discount, category, stock, bgcolor, panelcolor, textcolor, image, description } = req.body;
        let imageString = image || product.image;
        if (req.file) {
            imageString = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }
        const updated = await productModel.findByIdAndUpdate(req.params.id, {
            name,
            price: Number(price),
            discount: Number(discount || 0),
            category: category || 'General',
            stock: Number(stock || 0),
            bgcolor,
            panelcolor,
            textcolor,
            image: imageString,
            description: description || product.description
        }, { new: true });
        res.json({ success: true, product: updated });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Seller Product Delete
router.delete('/seller/products/:id', apiAuthSeller, async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product || !product.seller || product.seller.toString() !== req.seller._id.toString()) {
            return res.status(403).json({ error: 'Product not found or access denied' });
        }
        await productModel.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Seller Orders List
router.get('/seller/orders', apiAuthSeller, async (req, res) => {
    try {
        const sellerProducts = await productModel.find({ seller: req.seller._id }).select('_id');
        const sellerProductIds = sellerProducts.map(p => p._id);
        const orders = await orderModel.find({ products: { $in: sellerProductIds } })
            .populate('user', 'fullname email phone')
            .populate('products')
            .populate('purchasedItems.product')
            .sort({ createdAt: -1 });
        res.json({ orders, sellerProductIds });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch seller orders' });
    }
});

// Seller Order Status Update
router.post('/seller/orders/:id/status', apiAuthSeller, async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatuses = ['Packed', 'Shipped', 'Out For Delivery', 'Delivered'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status transition' });
        }
        const order = await orderModel.findById(req.params.id).populate('products');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        const sellerProducts = await productModel.find({ seller: req.seller._id }).select('_id');
        const sellerProductIds = sellerProducts.map(p => p._id.toString());
        const hasProduct = order.products.some(p => sellerProductIds.includes(p._id.toString()));
        if (!hasProduct) {
            return res.status(403).json({ error: 'Access denied to this order' });
        }

        order.status = status;
        order.statusHistory.push({ status, date: new Date() });
        await order.save();
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Seller Analytics API
router.get('/seller/analytics', apiAuthSeller, async (req, res) => {
    try {
        const data = await getSellerAnalytics(req.seller._id);
        res.json(data);
    } catch (err) {
        console.error('Seller analytics API error:', err);
        res.status(500).json({ error: 'Failed to fetch seller analytics' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. ADMIN / OWNER PANEL APIS
// ─────────────────────────────────────────────────────────────────────────────

// Check Current Admin
router.get('/admin/me', async (req, res) => {
    try {
        const token = req.cookies.ownerToken;
        if (!token) {
            return res.json({ loggedin: false, admin: null });
        }
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const owner = await ownerModel.findOne({ email: decoded.email }).select('-password');
        if (!owner) {
            return res.json({ loggedin: false, admin: null });
        }
        res.json({ loggedin: true, admin: owner });
    } catch (err) {
        res.json({ loggedin: false, admin: null });
    }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const owner = await ownerModel.findOne({ email });
        if (!owner) {
            return res.status(401).json({ error: 'Email or password is incorrect' });
        }
        const match = await bcrypt.compare(password, owner.password);
        if (!match) {
            return res.status(401).json({ error: 'Email or password is incorrect' });
        }

        const token = generateToken(owner);
        res.cookie('ownerToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const ownerResp = owner.toObject();
        delete ownerResp.password;
        res.json({ success: true, admin: ownerResp });
    } catch (err) {
        console.error('Admin Login Error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Admin Logout
router.post('/admin/logout', (req, res) => {
    res.clearCookie('ownerToken');
    res.json({ success: true, message: 'Admin logged out' });
});

// Admin Dashboard
router.get('/admin/dashboard', apiAuthAdmin, async (req, res) => {
    try {
        const [totalProducts, totalOrders, totalCustomers, totalSellers] = await Promise.all([
            productModel.countDocuments(),
            orderModel.countDocuments(),
            userModel.countDocuments({ _isBenchmark: { $ne: true } }),
            sellerModel.countDocuments({ _isBenchmark: { $ne: true } })
        ]);

        const revResult = await orderModel.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }]);
        const revenue = revResult.length > 0 ? revResult[0].totalRevenue : 0;

        const lowStockProducts = await productModel.find({ stock: { $lt: 5 } }).sort({ stock: 1 }).limit(10);
        const latestOrders = await orderModel.find()
            .populate('user', 'fullname email')
            .populate('products')
            .populate('purchasedItems.product')
            .sort({ createdAt: -1 })
            .limit(5);

        const latestCustomers = await userModel.find({ _isBenchmark: { $ne: true } })
            .select('-password')
            .sort({ _id: -1 })
            .limit(5);

        res.json({
            totalProducts,
            totalOrders,
            totalCustomers,
            totalSellers,
            revenue,
            lowStockProducts,
            latestOrders,
            latestCustomers
        });
    } catch (err) {
        console.error('Admin dashboard error:', err);
        res.status(500).json({ error: 'Failed to load admin dashboard' });
    }
});

// Admin Products
router.get('/admin/products', apiAuthAdmin, async (req, res) => {
    try {
        const products = await productModel.find().populate('seller', 'shopName').sort({ createdAt: -1 });
        res.json({ products });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch admin products' });
    }
});

// Admin Product Create
router.post('/admin/products/create', apiAuthAdmin, upload.single('imageFile'), async (req, res) => {
    try {
        let { name, price, discount, category, stock, bgcolor, panelcolor, textcolor, image, description } = req.body;
        let imageString = image || '';
        if (req.file) {
            imageString = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }
        const product = await productModel.create({
            name,
            price: Number(price),
            discount: Number(discount || 0),
            category: category || 'General',
            stock: Number(stock || 0),
            bgcolor: bgcolor || '#F3F4F6',
            panelcolor: panelcolor || '#FFFFFF',
            textcolor: textcolor || '#111827',
            image: imageString,
            description: description || ''
        });
        res.status(201).json({ success: true, product });
    } catch (err) {
        console.error('Admin create product error:', err);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Admin Product Edit
router.put('/admin/products/:id', apiAuthAdmin, upload.single('imageFile'), async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        let { name, price, discount, category, stock, bgcolor, panelcolor, textcolor, image, description } = req.body;
        let imageString = image || product.image;
        if (req.file) {
            imageString = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }
        const updated = await productModel.findByIdAndUpdate(req.params.id, {
            name,
            price: Number(price),
            discount: Number(discount || 0),
            category: category || 'General',
            stock: Number(stock || 0),
            bgcolor,
            panelcolor,
            textcolor,
            image: imageString,
            description: description || product.description
        }, { new: true });
        res.json({ success: true, product: updated });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Admin Product Delete
router.delete('/admin/products/:id', apiAuthAdmin, async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Admin Orders
router.get('/admin/orders', apiAuthAdmin, async (req, res) => {
    try {
        const orders = await orderModel.find()
            .populate('user', 'fullname email phone')
            .populate('products')
            .populate('purchasedItems.product')
            .sort({ createdAt: -1 });
        res.json({ orders });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch admin orders' });
    }
});

// Admin Order Status Update
router.post('/admin/orders/:id/status', apiAuthAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await orderModel.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        order.status = status;
        order.statusHistory.push({ status, date: new Date() });
        await order.save();
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Admin Customers List
router.get('/admin/customers', apiAuthAdmin, async (req, res) => {
    try {
        const users = await userModel.find({ _isBenchmark: { $ne: true } })
            .select('-password')
            .populate('orders')
            .sort({ _id: -1 });
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// Admin Sellers List
router.get('/admin/sellers', apiAuthAdmin, async (req, res) => {
    try {
        const sellers = await sellerModel.find({ _isBenchmark: { $ne: true } })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json({ sellers });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch sellers' });
    }
});

// Admin Seller Approve
router.post('/admin/sellers/:id/approve', apiAuthAdmin, async (req, res) => {
    try {
        const seller = await sellerModel.findByIdAndUpdate(req.params.id, { isApproved: true, isBlocked: false }, { new: true });
        res.json({ success: true, seller });
    } catch (err) {
        res.status(500).json({ error: 'Failed to approve seller' });
    }
});

// Admin Seller Toggle Block
router.post('/admin/sellers/:id/block', apiAuthAdmin, async (req, res) => {
    try {
        const seller = await sellerModel.findById(req.params.id);
        if (!seller) return res.status(404).json({ error: 'Seller not found' });
        seller.isBlocked = !seller.isBlocked;
        await seller.save();
        res.json({ success: true, isBlocked: seller.isBlocked, seller });
    } catch (err) {
        res.status(500).json({ error: 'Failed to toggle block status' });
    }
});

// Admin Seller Delete
router.delete('/admin/sellers/:id', apiAuthAdmin, async (req, res) => {
    try {
        await productModel.deleteMany({ seller: req.params.id });
        await sellerModel.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Seller and products deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete seller' });
    }
});

// Admin Analytics API
router.get('/admin/analytics', apiAuthAdmin, async (req, res) => {
    try {
        const data = await getOwnerAnalytics();
        res.json(data);
    } catch (err) {
        console.error('Admin analytics error:', err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
