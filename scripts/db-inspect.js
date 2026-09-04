/**
 * db-inspect.js
 * READ-ONLY database inspection script.
 * Reads real counts and categories from the production database.
 * Does NOT modify, insert, or delete any data.
 *
 * Usage: node scripts/db-inspect.js
 * Requires: NODE_ENV=development and the config/development.json MONGODB_URI
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const config   = require('config');

// ── Load models (schema only, no mutation) ──────────────────────────────────
const Order   = require('../models/order-model');
const Product = require('../models/product-model');
const User    = require('../models/user-model');
const Seller  = require('../models/seller-model');
const Review  = require('../models/review-model');

async function inspect() {
    const uri = config.get('MONGODB_URI');
    console.log('\n=== ShopSphere DB Inspection (READ-ONLY) ===\n');
    console.log('Connecting to MongoDB Atlas...');

    await mongoose.connect(uri);
    console.log('Connected.\n');

    // ── Document counts ────────────────────────────────────────────────────
    const [
        totalProducts,
        totalOrders,
        totalUsers,
        totalSellers,
        totalReviews,
        benchmarkOrders,    // orders seeded by our tool (flagged)
        benchmarkUsers,
    ] = await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        User.countDocuments(),
        Seller.countDocuments(),
        Review.countDocuments(),
        Order.countDocuments({ _isBenchmark: true }),
        User.countDocuments({ _isBenchmark: true }),
    ]);

    console.log('── Document Counts ────────────────────────────────');
    console.log(`  Products       : ${totalProducts}`);
    console.log(`  Orders (total) : ${totalOrders}`);
    console.log(`    └ Benchmark  : ${benchmarkOrders}  (synthetic, safe to delete)`);
    console.log(`    └ Real/Demo  : ${totalOrders - benchmarkOrders}`);
    console.log(`  Users (total)  : ${totalUsers}`);
    console.log(`    └ Benchmark  : ${benchmarkUsers}`);
    console.log(`    └ Real/Demo  : ${totalUsers - benchmarkUsers}`);
    console.log(`  Sellers        : ${totalSellers}`);
    console.log(`  Reviews        : ${totalReviews}`);

    // ── Product categories ─────────────────────────────────────────────────
    const categories = await Product.distinct('category');
    console.log('\n── Product Categories ─────────────────────────────');
    categories.forEach(c => console.log(`  • ${c}`));

    // ── Product price / discount range ────────────────────────────────────
    const priceStats = await Product.aggregate([
        { $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            avgPrice: { $avg: '$price' },
            minDiscount: { $min: '$discount' },
            maxDiscount: { $max: '$discount' },
            avgDiscount: { $avg: '$discount' },
            outOfStock: { $sum: { $cond: [{ $lte: ['$stock', 0] }, 1, 0] } },
            inStock: { $sum: { $cond: [{ $gt: ['$stock', 0] }, 1, 0] } },
        }}
    ]);
    if (priceStats.length > 0) {
        const s = priceStats[0];
        console.log('\n── Product Stats ───────────────────────────────────');
        console.log(`  Price range    : ₹${s.minPrice} – ₹${s.maxPrice}  (avg ₹${Math.round(s.avgPrice)})`);
        console.log(`  Discount range : ₹${s.minDiscount} – ₹${s.maxDiscount}  (avg ₹${Math.round(s.avgDiscount)})`);
        console.log(`  In stock       : ${s.inStock}   Out of stock: ${s.outOfStock}`);
    }

    // ── Category breakdown ─────────────────────────────────────────────────
    const catBreakdown = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    console.log('\n── Products per Category ───────────────────────────');
    catBreakdown.forEach(c => console.log(`  ${String(c._id).padEnd(20)} : ${c.count} products`));

    // ── Sellers with products ──────────────────────────────────────────────
    const sellerBreakdown = await Product.aggregate([
        { $group: { _id: '$seller', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    const sellersWithProducts = sellerBreakdown.filter(s => s._id !== null).length;
    console.log('\n── Seller Breakdown ────────────────────────────────');
    console.log(`  Total sellers               : ${totalSellers}`);
    console.log(`  Sellers who have products   : ${sellersWithProducts}`);
    console.log(`  Products with no seller     : ${sellerBreakdown.filter(s => s._id === null).map(s => s.count)[0] || 0}`);

    // ── Order status distribution (real + benchmark mixed) ─────────────────
    const statusDist = await Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    console.log('\n── Order Status Distribution (all orders) ──────────');
    statusDist.forEach(s => console.log(`  ${String(s._id || 'null').padEnd(22)} : ${s.count}`));

    // ── Date range of orders ───────────────────────────────────────────────
    const dateRange = await Order.aggregate([
        { $group: {
            _id: null,
            earliest: { $min: '$createdAt' },
            latest:   { $max: '$createdAt' }
        }}
    ]);
    if (dateRange.length > 0) {
        const d = dateRange[0];
        console.log('\n── Order Date Range ────────────────────────────────');
        console.log(`  Earliest : ${d.earliest ? d.earliest.toISOString().slice(0,10) : 'N/A'}`);
        console.log(`  Latest   : ${d.latest   ? d.latest.toISOString().slice(0,10)   : 'N/A'}`);
    }

    // ── Existing indexes on orders and products ────────────────────────────
    try {
        const orderIndexes   = await Order.collection.indexes();
        const productIndexes = await Product.collection.indexes();
        console.log('\n── Existing Indexes on orders ──────────────────────');
        orderIndexes.forEach(idx => console.log(`  ${JSON.stringify(idx.key)}  name=${idx.name}`));
        console.log('\n── Existing Indexes on products ────────────────────');
        productIndexes.forEach(idx => console.log(`  ${JSON.stringify(idx.key)}  name=${idx.name}`));
    } catch(e) {
        console.log('  (could not read indexes — check permissions)');
    }

    console.log('\n=== Inspection Complete — No data was modified ===\n');
    await mongoose.disconnect();
}

inspect().catch(err => {
    console.error('Inspection failed:', err.message);
    process.exit(1);
});
