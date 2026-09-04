/**
 * analyticsService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Optimized analytics aggregation pipelines for ShopSphere.
 *
 * WHAT CHANGED vs. original routes (and WHY):
 *
 * SELLER ANALYTICS (original: sellerRouter.js /api/analytics):
 *   BEFORE: 
 *     1. Find seller products → JS map to IDs
 *     2. orderModel.find({products:{$in:ids}}).populate(products+purchasedItems+user)
 *        → loads ALL matched orders + ALL product docs into Node.js memory
 *     3. JavaScript forEach loops × 3 to compute:
 *        - monthly revenue/orders
 *        - category revenue
 *        - total revenue (DUPLICATE of the separate aggregate)
 *   PROBLEM: With 5,000 orders, this loads ~150–200 fully-populated order
 *            documents (each with nested product + seller objects) into RAM
 *            and iterates them 3 separate times.
 *
 *   AFTER (this file):
 *     Single aggregation pipeline per metric. MongoDB does all grouping,
 *     filtering, and math server-side. Node.js only receives the final
 *     small result set.
 *     - Monthly revenue: $group by {$year,$month} → no JS loop
 *     - Category revenue: $lookup product → $group by category → no JS loop
 *     - Status distribution: $group by status
 *     - Top products: $group by product._id → $sort → $limit 5
 *     - No populate() on large result sets
 *
 * OWNER ANALYTICS (original: ownerRouter.js /api/analytics):
 *   BEFORE:
 *     orderModel.find().populate(products+purchasedItems.product+user)
 *     → loads ENTIRE orders collection into Node.js memory with full nested
 *       docs. At 10,000 orders this is catastrophic (multiple GB potential).
 *   AFTER:
 *     All calculations via aggregation. Only summary numbers come to Node.js.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const Order   = require('../models/order-model');
const Product = require('../models/product-model');
const User    = require('../models/user-model');
const Seller  = require('../models/seller-model');

// ─────────────────────────────────────────────────────────────────────────────
// SELLER ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getSellerAnalytics(sellerId)
 *
 * Returns all analytics for a seller's dashboard in parallel aggregations.
 * No populate(). No JS loops over order arrays.
 */
async function getSellerAnalytics(sellerId) {

    // Run all aggregations in parallel
    const [
        summaryResult,
        monthlyResult,
        categoryResult,
        statusResult,
        topProductsResult,
    ] = await Promise.all([

        // 1. Summary: total revenue, total orders, avg order value, units sold
        Order.aggregate([
            { $match: { 'purchasedItems.seller': sellerId } },
            { $unwind: '$purchasedItems' },
            { $match: { 'purchasedItems.seller': sellerId } },
            { $group: {
                _id: null,
                totalRevenue: { $sum: { $subtract: ['$purchasedItems.price', '$purchasedItems.discount'] } },
                totalUnitsSold: { $sum: '$purchasedItems.qty' },
            }},
        ]),

        // ORDER COUNT — separate query on outer document (not per item)
        // (combined with revenue in the pipeline above would double-count)

        // 2. Monthly revenue + orders (last 14 months) — DB groups by year/month
        Order.aggregate([
            { $match: { 'purchasedItems.seller': sellerId } },
            { $unwind: '$purchasedItems' },
            { $match: { 'purchasedItems.seller': sellerId } },
            { $group: {
                _id: {
                    year:  { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                revenue:    { $sum: { $subtract: ['$purchasedItems.price', '$purchasedItems.discount'] } },
                orderCount: { $sum: 1 },
            }},
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),

        // 3. Revenue by category — join product to get its category
        Order.aggregate([
            { $match: { 'purchasedItems.seller': sellerId } },
            { $unwind: '$purchasedItems' },
            { $match: { 'purchasedItems.seller': sellerId } },
            { $lookup: {
                from: 'products',
                localField: 'purchasedItems.product',
                foreignField: '_id',
                as: 'productInfo',
                pipeline: [{ $project: { category: 1 } }]   // only pull category field
            }},
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
            { $group: {
                _id: { $ifNull: ['$productInfo.category', 'General'] },
                revenue: { $sum: { $subtract: ['$purchasedItems.price', '$purchasedItems.discount'] } },
            }},
            { $sort: { revenue: -1 } },
        ]),

        // 4. Order status distribution
        Order.aggregate([
            { $match: { 'purchasedItems.seller': sellerId } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),

        // 5. Top 5 products by revenue
        Order.aggregate([
            { $match: { 'purchasedItems.seller': sellerId } },
            { $unwind: '$purchasedItems' },
            { $match: { 'purchasedItems.seller': sellerId } },
            { $group: {
                _id: '$purchasedItems.product',
                totalRevenue: { $sum: { $subtract: ['$purchasedItems.price', '$purchasedItems.discount'] } },
                totalSold:    { $sum: '$purchasedItems.qty' },
            }},
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
            { $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product',
                pipeline: [{ $project: { name: 1, category: 1, price: 1 } }]
            }},
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        ]),
    ]);

    // Separate order count (distinct orders, not per item)
    const orderCountResult = await Order.aggregate([
        { $match: { 'purchasedItems.seller': sellerId } },
        { $count: 'total' },
    ]);

    const totalOrders     = orderCountResult.length > 0 ? orderCountResult[0].total : 0;
    const totalRevenue    = summaryResult.length > 0 ? summaryResult[0].totalRevenue : 0;
    const totalUnitsSold  = summaryResult.length > 0 ? summaryResult[0].totalUnitsSold : 0;
    const avgOrderValue   = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Status breakdown helpers
    const statusMap = {};
    statusResult.forEach(s => { statusMap[s._id] = s.count; });
    const pendingOrders   = (statusMap['Pending'] || 0) + (statusMap['Payment Confirmed'] || 0);
    const deliveredOrders = statusMap['Delivered'] || 0;

    // Build last-12-months monthly arrays (fill zeros for missing months)
    const now = new Date();
    const monthlyLabels  = [];
    const monthlyRevenue = [];
    const monthlyOrders  = [];

    // Build a lookup from aggregation results
    const monthlyMap = {};
    monthlyResult.forEach(m => {
        const key = `${m._id.year}-${String(m._id.month).padStart(2, '0')}`;
        monthlyMap[key] = m;
    });

    for (let i = 11; i >= 0; i--) {
        const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
        const entry = monthlyMap[key];
        monthlyLabels.push(label);
        monthlyRevenue.push(entry ? Math.round(entry.revenue) : 0);
        monthlyOrders.push(entry ? entry.orderCount : 0);
    }

    return {
        // Summary KPIs
        totalRevenue,
        totalOrders,
        totalUnitsSold,
        avgOrderValue,
        pendingOrders,
        deliveredOrders,
        // Charts
        monthlyLabels,
        monthlyRevenue,
        monthlyOrders,
        categoryLabels: categoryResult.map(c => c._id),
        categorySales:  categoryResult.map(c => Math.round(c.revenue)),
        // Status distribution
        statusLabels:   statusResult.map(s => s._id || 'Unknown'),
        statusCounts:   statusResult.map(s => s.count),
        // Top products
        topProducts: topProductsResult.map(p => ({
            productId:    p._id,
            name:         p.product ? p.product.name : 'Unknown Product',
            category:     p.product ? p.product.category : 'General',
            totalRevenue: Math.round(p.totalRevenue),
            totalSold:    p.totalSold,
        })),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// OWNER / PLATFORM ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getOwnerAnalytics()
 *
 * Returns platform-wide analytics. All computed in MongoDB — Node.js only
 * receives small summary arrays.
 */
async function getOwnerAnalytics() {

    const now = new Date();

    // Run all aggregations + counts in parallel
    const [
        totalProducts,
        totalOrders,
        totalCustomers,
        totalSellers,
        revenueSummary,
        monthlyResult,
        dailyResult,
        categoryResult,
        statusResult,
        topProductsResult,
        topSellersResult,
        topCustomersResult,
    ] = await Promise.all([

        Product.countDocuments(),
        Order.countDocuments(),
        User.countDocuments({ _isBenchmark: { $ne: true } }),   // real users only
        Seller.countDocuments({ _isBenchmark: { $ne: true } }),  // real sellers only

        // Revenue summary
        Order.aggregate([
            { $group: {
                _id: null,
                totalRevenue:  { $sum: '$totalAmount' },
                avgOrderValue: { $avg: '$totalAmount' },
                minOrder:      { $min: '$totalAmount' },
                maxOrder:      { $max: '$totalAmount' },
            }},
        ]),

        // Monthly revenue + orders (last 14 months)
        Order.aggregate([
            { $group: {
                _id: {
                    year:  { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                revenue:    { $sum: '$totalAmount' },
                orderCount: { $sum: 1 },
            }},
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),

        // Daily sales last 30 days
        Order.aggregate([
            { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
            { $group: {
                _id: {
                    year:  { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day:   { $dayOfMonth: '$createdAt' },
                },
                revenue:    { $sum: '$totalAmount' },
                orderCount: { $sum: 1 },
            }},
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        ]),

        // Revenue by category
        Order.aggregate([
            { $unwind: '$purchasedItems' },
            { $lookup: {
                from: 'products',
                localField: 'purchasedItems.product',
                foreignField: '_id',
                as: 'productInfo',
                pipeline: [{ $project: { category: 1 } }]
            }},
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
            { $group: {
                _id: { $ifNull: ['$productInfo.category', 'General'] },
                revenue:   { $sum: { $subtract: ['$purchasedItems.price', '$purchasedItems.discount'] } },
                itemsSold: { $sum: '$purchasedItems.qty' },
            }},
            { $sort: { revenue: -1 } },
        ]),

        // Order status distribution
        Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),

        // Top 5 products by revenue (platform-wide)
        Order.aggregate([
            { $unwind: '$purchasedItems' },
            { $group: {
                _id: '$purchasedItems.product',
                totalRevenue: { $sum: { $subtract: ['$purchasedItems.price', '$purchasedItems.discount'] } },
                totalSold:    { $sum: '$purchasedItems.qty' },
            }},
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
            { $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product',
                pipeline: [{ $project: { name: 1, category: 1 } }]
            }},
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        ]),

        // Top 5 sellers by revenue
        Order.aggregate([
            { $unwind: '$purchasedItems' },
            { $match: { 'purchasedItems.seller': { $ne: null } } },
            { $group: {
                _id: '$purchasedItems.seller',
                totalRevenue: { $sum: { $subtract: ['$purchasedItems.price', '$purchasedItems.discount'] } },
                totalOrders:  { $addToSet: '$_id' },
                itemsSold:    { $sum: '$purchasedItems.qty' },
            }},
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
            { $lookup: {
                from: 'sellers',
                localField: '_id',
                foreignField: '_id',
                as: 'seller',
                pipeline: [{ $project: { shopName: 1, _isBenchmark: 1 } }]
            }},
            { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
            { $project: {
                shopName:    { $ifNull: ['$seller.shopName', 'Unknown'] },
                isBenchmark: { $ifNull: ['$seller._isBenchmark', false] },
                totalRevenue: 1,
                itemsSold:    1,
                orderCount:  { $size: '$totalOrders' },
            }},
        ]),

        // Top 5 customers by total spend (real users only)
        Order.aggregate([
            { $group: {
                _id: '$user',
                totalSpent:  { $sum: '$totalAmount' },
                totalOrders: { $sum: 1 },
            }},
            { $sort: { totalSpent: -1 } },
            { $limit: 10 },  // fetch 10, filter down to 5 real after lookup
            { $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user',
                pipeline: [{ $project: { fullname: 1, email: 1, _isBenchmark: 1 } }]
            }},
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $match: { 'user._isBenchmark': { $ne: true } } },  // exclude benchmark users
            { $limit: 5 },
        ]),
    ]);

    // ── Monthly arrays (last 12 months, zero-filled) ─────────────────────────
    const monthlyMap = {};
    monthlyResult.forEach(m => {
        const key = `${m._id.year}-${String(m._id.month).padStart(2, '0')}`;
        monthlyMap[key] = m;
    });

    const monthlyLabels  = [];
    const monthlyRevenue = [];
    const monthlyOrders  = [];
    for (let i = 11; i >= 0; i--) {
        const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyLabels.push(d.toLocaleString('en-IN', { month: 'short', year: '2-digit' }));
        monthlyRevenue.push(monthlyMap[key] ? Math.round(monthlyMap[key].revenue) : 0);
        monthlyOrders.push(monthlyMap[key] ? monthlyMap[key].orderCount : 0);
    }

    // ── Daily arrays (last 30 days, zero-filled) ──────────────────────────────
    const dailyMap = {};
    dailyResult.forEach(d => {
        const key = `${d._id.year}-${String(d._id.month).padStart(2,'0')}-${String(d._id.day).padStart(2,'0')}`;
        dailyMap[key] = d;
    });
    const dailyLabels = [];
    const dailySales  = [];
    for (let i = 29; i >= 0; i--) {
        const d   = new Date();
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        dailyLabels.push(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
        dailySales.push(dailyMap[key] ? Math.round(dailyMap[key].revenue) : 0);
    }

    const rev = revenueSummary.length > 0 ? revenueSummary[0] : {};

    return {
        // KPIs
        totalProducts,
        totalOrders,
        totalCustomers,
        totalSellers,
        totalRevenue:  Math.round(rev.totalRevenue  || 0),
        avgOrderValue: Math.round(rev.avgOrderValue || 0),
        // Monthly
        monthlyLabels,
        monthlyRevenue,
        monthlyOrders,
        // Daily
        dailyLabels,
        dailySales,
        // Category
        categoryLabels: categoryResult.map(c => c._id),
        categorySales:  categoryResult.map(c => Math.round(c.revenue)),
        // Status distribution
        statusLabels: statusResult.map(s => s._id || 'Unknown'),
        statusCounts: statusResult.map(s => s.count),
        // Top lists
        topProducts: topProductsResult.map(p => ({
            name:         p.product ? p.product.name : 'Unknown',
            category:     p.product ? p.product.category : 'General',
            totalRevenue: Math.round(p.totalRevenue),
            totalSold:    p.totalSold,
        })),
        topSellers: topSellersResult.map(s => ({
            shopName:     s.shopName,
            isBenchmark:  s.isBenchmark,
            totalRevenue: Math.round(s.totalRevenue),
            orderCount:   s.orderCount,
            itemsSold:    s.itemsSold,
        })),
        topCustomers: topCustomersResult.map(c => ({
            name:        c.user ? c.user.fullname : 'Unknown',
            email:       c.user ? c.user.email : '',
            totalSpent:  Math.round(c.totalSpent),
            totalOrders: c.totalOrders,
        })),
    };
}

module.exports = { getSellerAnalytics, getOwnerAnalytics };
