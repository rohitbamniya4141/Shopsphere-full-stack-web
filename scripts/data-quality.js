/**
 * data-quality.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Development-only data quality analysis script.
 *
 * Reports:
 *  - Document counts
 *  - Revenue summary
 *  - Orders by status
 *  - Orders by month
 *  - Revenue by month
 *  - Revenue by category
 *  - Revenue by seller
 *  - Missing/invalid values (null prices, zero stock, missing seller refs)
 *  - Invalid product references in orders
 *  - Invalid quantity/price values
 *  - Duplicate detection
 *
 * Usage: npm run data-quality
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const config   = require('config');

const Order   = require('../models/order-model');
const Product = require('../models/product-model');
const User    = require('../models/user-model');
const Seller  = require('../models/seller-model');
const Review  = require('../models/review-model');

function hr(title) {
    const line = '─'.repeat(50);
    console.log(`\n${line}`);
    if (title) console.log(` ${title}`);
    if (title) console.log(line);
}

function fmt(n) { return Number(n || 0).toLocaleString('en-IN'); }
function fmtRs(n) { return '₹' + fmt(n); }

async function analyze() {
    console.log('\n════════════════════════════════════════════════════');
    console.log(' ShopSphere Data Quality Report');
    console.log(` Generated: ${new Date().toISOString()}`);
    console.log('════════════════════════════════════════════════════');

    const uri = config.get('MONGODB_URI');
    await mongoose.connect(uri);

    // ── 1. Document Counts ────────────────────────────────────────────────────
    hr('1. Document Counts');
    const [totalOrders, totalBenchOrders, totalRealOrders,
           totalProducts, totalUsers, totalBenchUsers, totalRealUsers,
           totalSellers, totalReviews] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ _isBenchmark: true }),
        Order.countDocuments({ _isBenchmark: { $ne: true } }),
        Product.countDocuments(),
        User.countDocuments(),
        User.countDocuments({ _isBenchmark: true }),
        User.countDocuments({ _isBenchmark: { $ne: true } }),
        Seller.countDocuments(),
        Review.countDocuments(),
    ]);
    console.log(`  Orders   (total)      : ${fmt(totalOrders)}`);
    console.log(`    └ Benchmark         : ${fmt(totalBenchOrders)}`);
    console.log(`    └ Real/demo         : ${fmt(totalRealOrders)}`);
    console.log(`  Products (total)      : ${fmt(totalProducts)}`);
    console.log(`  Users    (total)      : ${fmt(totalUsers)}`);
    console.log(`    └ Benchmark         : ${fmt(totalBenchUsers)}`);
    console.log(`    └ Real/demo         : ${fmt(totalRealUsers)}`);
    console.log(`  Sellers               : ${fmt(totalSellers)}`);
    console.log(`  Reviews               : ${fmt(totalReviews)}`);

    // ── 2. Revenue Summary ────────────────────────────────────────────────────
    hr('2. Revenue Summary (All Orders)');
    const revSummary = await Order.aggregate([
        { $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' },
            minOrder: { $min: '$totalAmount' },
            maxOrder: { $max: '$totalAmount' },
            count: { $sum: 1 }
        }}
    ]);
    if (revSummary.length > 0) {
        const r = revSummary[0];
        console.log(`  Total Revenue         : ${fmtRs(Math.round(r.totalRevenue))}`);
        console.log(`  Avg Order Value       : ${fmtRs(Math.round(r.avgOrderValue))}`);
        console.log(`  Min Order Value       : ${fmtRs(r.minOrder)}`);
        console.log(`  Max Order Value       : ${fmtRs(r.maxOrder)}`);
        console.log(`  Orders counted        : ${fmt(r.count)}`);
    } else {
        console.log('  No orders found.');
    }

    // ── 3. Revenue Summary — Real Orders Only ────────────────────────────────
    hr('3. Revenue Summary (Real/Demo Orders Only)');
    const realRevSummary = await Order.aggregate([
        { $match: { _isBenchmark: { $ne: true } } },
        { $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' },
            count: { $sum: 1 }
        }}
    ]);
    if (realRevSummary.length > 0) {
        const r = realRevSummary[0];
        console.log(`  Total Revenue (real)  : ${fmtRs(Math.round(r.totalRevenue))}`);
        console.log(`  Avg Order Value (real): ${fmtRs(Math.round(r.avgOrderValue))}`);
        console.log(`  Real orders           : ${fmt(r.count)}`);
    } else {
        console.log('  No real orders found.');
    }

    // ── 4. Orders by Status ───────────────────────────────────────────────────
    hr('4. Orders by Status');
    const statusDist = await Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
        { $sort: { count: -1 } }
    ]);
    statusDist.forEach(s =>
        console.log(`  ${String(s._id || 'null').padEnd(22)}: ${fmt(s.count).padStart(6)} orders  ${fmtRs(Math.round(s.revenue))}`)
    );

    // ── 5. Orders by Month (last 14 months) ───────────────────────────────────
    hr('5. Orders by Month');
    const monthlyOrders = await Order.aggregate([
        { $group: {
            _id: {
                year:  { $year: '$createdAt' },
                month: { $month: '$createdAt' }
            },
            count:   { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    monthlyOrders.forEach(m => {
        const label = `${m._id.year}-${String(m._id.month).padStart(2, '0')}`;
        console.log(`  ${label}  : ${fmt(m.count).padStart(6)} orders  ${fmtRs(Math.round(m.revenue))}`);
    });

    // ── 6. Revenue by Category ────────────────────────────────────────────────
    hr('6. Revenue by Category (via purchasedItems)');
    const catRevenue = await Order.aggregate([
        { $unwind: '$purchasedItems' },
        { $lookup: {
            from: 'products',
            localField: 'purchasedItems.product',
            foreignField: '_id',
            as: 'productInfo'
        }},
        { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
        { $group: {
            _id: { $ifNull: ['$productInfo.category', 'Unknown'] },
            revenue: { $sum: { $subtract: ['$purchasedItems.price', '$purchasedItems.discount'] } },
            itemsSold: { $sum: '$purchasedItems.qty' }
        }},
        { $sort: { revenue: -1 } }
    ]);
    catRevenue.forEach(c =>
        console.log(`  ${String(c._id).padEnd(20)}: ${fmtRs(Math.round(c.revenue))}  (${fmt(c.itemsSold)} items)`)
    );

    // ── 7. Revenue by Seller ──────────────────────────────────────────────────
    hr('7. Revenue by Seller (via purchasedItems)');
    const sellerRevenue = await Order.aggregate([
        { $unwind: '$purchasedItems' },
        { $group: {
            _id: '$purchasedItems.seller',
            revenue: { $sum: { $subtract: ['$purchasedItems.price', '$purchasedItems.discount'] } },
            itemsSold: { $sum: '$purchasedItems.qty' },
            orders: { $addToSet: '$_id' }
        }},
        { $lookup: { from: 'sellers', localField: '_id', foreignField: '_id', as: 'sellerInfo' } },
        { $unwind: { path: '$sellerInfo', preserveNullAndEmptyArrays: true } },
        { $project: {
            shopName: { $ifNull: ['$sellerInfo.shopName', 'Unknown Seller'] },
            isBenchmark: { $ifNull: ['$sellerInfo._isBenchmark', false] },
            revenue: 1, itemsSold: 1,
            orderCount: { $size: '$orders' }
        }},
        { $sort: { revenue: -1 } }
    ]);
    sellerRevenue.forEach(s =>
        console.log(`  ${String(s.shopName).padEnd(22)}: ${fmtRs(Math.round(s.revenue))}  ${fmt(s.orderCount)} orders  ${s.isBenchmark ? '[BENCHMARK]' : '[REAL]'}`)
    );

    // ── 8. Data Quality — Missing/Invalid Values ───────────────────────────────
    hr('8. Data Quality — Missing / Invalid Values');

    const [
        nullPriceProducts,
        zeroStockProducts,
        noSellerProducts,
        nullTotalOrders,
        negativeAmountOrders,
        nullUserOrders,
    ] = await Promise.all([
        Product.countDocuments({ $or: [{ price: null }, { price: { $exists: false } }] }),
        Product.countDocuments({ stock: { $lte: 0 } }),
        Product.countDocuments({ $or: [{ seller: null }, { seller: { $exists: false } }] }),
        Order.countDocuments({ $or: [{ totalAmount: null }, { totalAmount: { $exists: false } }] }),
        Order.countDocuments({ totalAmount: { $lt: 0 } }),
        Order.countDocuments({ $or: [{ user: null }, { user: { $exists: false } }] }),
    ]);

    console.log('  Products:');
    console.log(`    Null/missing price  : ${nullPriceProducts > 0 ? '⚠️  ' + nullPriceProducts : '✓  0'}`);
    console.log(`    Stock ≤ 0           : ${zeroStockProducts > 0 ? '⚠️  ' + zeroStockProducts : '✓  0'}`);
    console.log(`    No seller assigned  : ${noSellerProducts > 0 ? '⚠️  ' + noSellerProducts + '  (products without seller)' : '✓  0'}`);
    console.log('  Orders:');
    console.log(`    Null totalAmount    : ${nullTotalOrders > 0 ? '⚠️  ' + nullTotalOrders : '✓  0'}`);
    console.log(`    Negative amount     : ${negativeAmountOrders > 0 ? '⚠️  ' + negativeAmountOrders : '✓  0'}`);
    console.log(`    Null user reference : ${nullUserOrders > 0 ? '⚠️  ' + nullUserOrders : '✓  0'}`);

    // ── 9. Invalid Product References in Orders ────────────────────────────────
    hr('9. Invalid Product References in Orders (sample check)');
    const allProductIds = (await Product.find({}).select('_id').lean()).map(p => p._id.toString());
    const productIdSet  = new Set(allProductIds);

    // Check purchasedItems for broken product refs (sample first 500 orders)
    const sampleOrders = await Order.find({}).limit(500).lean();
    let brokenRefs = 0;
    sampleOrders.forEach(order => {
        (order.purchasedItems || []).forEach(item => {
            if (item.product && !productIdSet.has(item.product.toString())) brokenRefs++;
        });
    });
    console.log(`  Checked ${sampleOrders.length} orders (sample)`);
    console.log(`  Broken purchasedItems.product refs : ${brokenRefs > 0 ? '⚠️  ' + brokenRefs : '✓  0'}`);

    // ── 10. purchasedItems qty/price validation ────────────────────────────────
    hr('10. purchasedItems Price / Qty Validation');
    const itemIssues = await Order.aggregate([
        { $unwind: '$purchasedItems' },
        { $group: {
            _id: null,
            negativePrice: { $sum: { $cond: [{ $lt: ['$purchasedItems.price', 0] }, 1, 0] } },
            zeroPrice:     { $sum: { $cond: [{ $eq: ['$purchasedItems.price', 0] }, 1, 0] } },
            nullPrice:     { $sum: { $cond: [{ $or: [{ $not: ['$purchasedItems.price'] }, { $eq: ['$purchasedItems.price', null] }] }, 1, 0] } },
            negativeQty:   { $sum: { $cond: [{ $lt: ['$purchasedItems.qty', 1] }, 1, 0] } },
            totalItems:    { $sum: 1 }
        }}
    ]);
    if (itemIssues.length > 0) {
        const ii = itemIssues[0];
        console.log(`  Total purchasedItems scanned : ${fmt(ii.totalItems)}`);
        console.log(`  Negative price items         : ${ii.negativePrice > 0 ? '⚠️  ' + ii.negativePrice : '✓  0'}`);
        console.log(`  Zero price items             : ${ii.zeroPrice > 0 ? '⚠️  ' + ii.zeroPrice : '✓  0'}`);
        console.log(`  Null price items             : ${ii.nullPrice > 0 ? '⚠️  ' + ii.nullPrice : '✓  0'}`);
        console.log(`  Qty < 1 items                : ${ii.negativeQty > 0 ? '⚠️  ' + ii.negativeQty : '✓  0'}`);
    } else {
        console.log('  No purchasedItems found (orders may use legacy products[] format only).');
    }

    // ── 11. Duplicate Orders ──────────────────────────────────────────────────
    hr('11. Duplicate Detection');
    const duplicatePayments = await Order.aggregate([
        { $match: { paymentId: { $ne: '' } } },
        { $group: { _id: '$paymentId', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $count: 'duplicatePaymentIds' }
    ]);
    const dupCount = duplicatePayments.length > 0 ? duplicatePayments[0].duplicatePaymentIds : 0;
    console.log(`  Duplicate paymentId values : ${dupCount > 0 ? '⚠️  ' + dupCount : '✓  0'}`);

    // ── 12. Existing Index Coverage ───────────────────────────────────────────
    hr('12. Existing Indexes');
    const orderIndexes   = await Order.collection.indexes();
    const productIndexes = await Product.collection.indexes();
    console.log('  orders:');
    orderIndexes.forEach(idx => console.log(`    ${JSON.stringify(idx.key).padEnd(30)} name=${idx.name}`));
    console.log('  products:');
    productIndexes.forEach(idx => console.log(`    ${JSON.stringify(idx.key).padEnd(30)} name=${idx.name}`));

    console.log('\n════════════════════════════════════════════════════');
    console.log(' Data Quality Report Complete');
    console.log('════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
}

analyze().catch(err => {
    console.error('\n[DQ] Fatal error:', err.message);
    process.exit(1);
});
