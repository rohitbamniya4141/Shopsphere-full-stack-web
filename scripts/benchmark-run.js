/**
 * benchmark-run.js
 * ─────────────────────────────────────────────────────────────────────────────
 * DEVELOPMENT-ONLY performance benchmark script.
 *
 * Measures the CURRENT analytics implementation performance BEFORE and AFTER
 * optimization. Run this before any code changes for the baseline, and again
 * after to compare.
 *
 * What it measures:
 *  1. Seller analytics query (equivalent to /sellers/api/analytics)
 *  2. Owner analytics query (equivalent to /owners/api/analytics)
 *  3. MongoDB explain() output for key queries
 *  4. Documents examined, keys examined, index usage
 *
 * Usage:
 *   npm run benchmark               (runs all 10 iterations per test)
 *   npm run benchmark -- --runs 5   (custom iteration count)
 *   npm run benchmark -- --label "BEFORE indexes"
 *
 * Output: console + appends results to benchmark-results/results.jsonl
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

require('dotenv').config();
const NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV !== 'development') {
    console.error('\n[BENCH] ABORTED — benchmarking only allowed in development mode.');
    process.exit(1);
}

const mongoose = require('mongoose');
const config   = require('config');
const fs       = require('fs');
const path     = require('path');

const Order    = require('../models/order-model');
const Product  = require('../models/product-model');
const User     = require('../models/user-model');
const Seller   = require('../models/seller-model');

// ── CLI args ──────────────────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const runsArg  = args.find(a => a.startsWith('--runs'));
const labelArg = args.find(a => a.startsWith('--label'));
const RUNS     = runsArg  ? parseInt(runsArg.split('=')[1]  || args[args.indexOf(runsArg) + 1])  : 10;
const LABEL    = labelArg ? (labelArg.split('=')[1] || args[args.indexOf(labelArg) + 1]) : 'BASELINE';

// ── Stats helpers ─────────────────────────────────────────────────────────────
function percentile(sorted, p) {
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
}
function stats(times) {
    const s = [...times].sort((a, b) => a - b);
    const sum = s.reduce((acc, v) => acc + v, 0);
    return {
        runs:   times.length,
        avg:    Math.round(sum / s.length),
        median: Math.round(percentile(s, 50)),
        min:    s[0],
        max:    s[s.length - 1],
        p95:    Math.round(percentile(s, 95)),
    };
}

// ── Timer ─────────────────────────────────────────────────────────────────────
function now() { return performance.now(); }

// ────────────────────────────────────────────────────────────────────────────
// CURRENT IMPLEMENTATION — copied exactly from existing routes
// (do NOT modify these functions when optimizing — keep them for comparison)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Replicates the CURRENT seller analytics query from sellerRouter.js
 * Uses the FIRST seller that has products, or the first benchmark seller.
 */
async function currentSellerAnalytics(sellerId) {
    // Step 1: Get seller's product IDs
    const sellerProducts    = await Product.find({ seller: sellerId }).select('_id');
    const sellerProductIds  = sellerProducts.map(p => p._id);

    if (sellerProductIds.length === 0) return { totalRevenue: 0, totalOrders: 0 };

    // Step 2: Find all orders containing seller's products (with full populate)
    const orders = await Order.find({
        products: { $in: sellerProductIds }
    }).populate('products').populate('purchasedItems.product').populate('user');

    const totalOrders = orders.length;

    // Step 3: Revenue aggregate
    const revResult = await Order.aggregate([
        { $unwind: '$purchasedItems' },
        { $match: { 'purchasedItems.seller': sellerId } },
        { $group: { _id: null, totalRevenue: { $sum: { $subtract: ['$purchasedItems.price', '$purchasedItems.discount'] } } } }
    ]);
    const revenue = revResult.length > 0 ? revResult[0].totalRevenue : 0;

    // Step 4: JS loops for monthly data (as current code does)
    const monthlyData = {};
    const now2 = new Date();
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now2.getFullYear(), now2.getMonth() - i, 1);
        const key = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
        monthlyData[key] = { revenue: 0, orders: 0 };
    }

    orders.forEach(order => {
        const key = order.createdAt.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
        if (monthlyData[key]) {
            const isNewFormat = order.purchasedItems && order.purchasedItems.length > 0;
            const itemsSource = isNewFormat ? order.purchasedItems : order.products;
            let orderRevenue  = 0;
            itemsSource.forEach(item => {
                const product  = isNewFormat ? item.product : item;
                if (!product) return;
                const pid = product._id ? product._id.toString() : product.toString();
                if (sellerProductIds.some(id => id.toString() === pid)) {
                    const price    = isNewFormat ? item.price    : product.price;
                    const discount = isNewFormat ? item.discount : product.discount;
                    orderRevenue  += price - (discount || 0);
                }
            });
            monthlyData[key].revenue += orderRevenue;
            monthlyData[key].orders  += 1;
        }
    });

    // Step 5: Category data (JS loop)
    const categoryData = {};
    orders.forEach(order => {
        const isNewFormat = order.purchasedItems && order.purchasedItems.length > 0;
        const itemsSource = isNewFormat ? order.purchasedItems : order.products;
        itemsSource.forEach(item => {
            const product = isNewFormat ? item.product : item;
            if (!product) return;
            const pid = product._id ? product._id.toString() : product.toString();
            if (sellerProductIds.some(id => id.toString() === pid)) {
                const cat = product.category || 'General';
                if (!categoryData[cat]) categoryData[cat] = 0;
                const price    = isNewFormat ? item.price    : product.price;
                const discount = isNewFormat ? item.discount : product.discount;
                categoryData[cat] += price - (discount || 0);
            }
        });
    });

    return { totalRevenue: revenue, totalOrders };
}

/**
 * Replicates the CURRENT owner analytics query from ownerRouter.js
 */
async function currentOwnerAnalytics() {
    // Full load — as current code does
    const orders = await Order.find()
        .populate('products')
        .populate('purchasedItems.product')
        .populate('user');

    // Monthly Revenue & Orders (JS loop — as current code does)
    const monthlyData = {};
    const now2 = new Date();
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now2.getFullYear(), now2.getMonth() - i, 1);
        const key = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
        monthlyData[key] = { revenue: 0, orders: 0 };
    }
    orders.forEach(order => {
        const key = order.createdAt.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
        if (monthlyData[key]) {
            monthlyData[key].revenue += order.totalAmount;
            monthlyData[key].orders  += 1;
        }
    });

    // Category data (JS loop)
    const categoryData = {};
    orders.forEach(order => {
        const isNewFormat = order.purchasedItems && order.purchasedItems.length > 0;
        const itemsSource = isNewFormat ? order.purchasedItems : order.products;
        itemsSource.forEach(item => {
            const product = isNewFormat ? item.product : item;
            if (!product) return;
            const cat = product.category || 'General';
            if (!categoryData[cat]) categoryData[cat] = 0;
            const price    = isNewFormat ? item.price    : product.price;
            const discount = isNewFormat ? item.discount : product.discount;
            categoryData[cat] += price - (discount || 0);
        });
    });

    // Top customers (JS loop)
    const customerData = {};
    orders.forEach(order => {
        if (order.user) {
            const key = order.user._id.toString();
            if (!customerData[key]) customerData[key] = { totalSpent: 0, totalOrders: 0 };
            customerData[key].totalSpent  += order.totalAmount;
            customerData[key].totalOrders += 1;
        }
    });

    const totalRevenue  = orders.reduce((s, o) => s + o.totalAmount, 0);
    const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

    return { totalRevenue, avgOrderValue, totalOrders: orders.length };
}

// ── explain() analysis ────────────────────────────────────────────────────────
async function explainSellerQuery(sellerId) {
    const sellerProducts   = await Product.find({ seller: sellerId }).select('_id');
    const sellerProductIds = sellerProducts.map(p => p._id);

    // Explain the main orders query
    const explain = await Order.find({
        products: { $in: sellerProductIds }
    }).explain('executionStats');

    const stats2 = explain.executionStats || {};
    return {
        nReturned:         stats2.nReturned         || 0,
        totalDocsExamined: stats2.totalDocsExamined || 0,
        totalKeysExamined: stats2.totalKeysExamined || 0,
        executionTimeMillis: stats2.executionTimeMillis || 0,
        indexUsed: explain.queryPlanner?.winningPlan?.inputStage?.indexName || 'COLLSCAN',
        stage:     explain.queryPlanner?.winningPlan?.stage || 'unknown',
    };
}

async function explainOwnerQuery() {
    // Explain full orders fetch
    const explain = await Order.find({}).explain('executionStats');
    const stats2  = explain.executionStats || {};
    return {
        nReturned:           stats2.nReturned           || 0,
        totalDocsExamined:   stats2.totalDocsExamined   || 0,
        totalKeysExamined:   stats2.totalKeysExamined   || 0,
        executionTimeMillis: stats2.executionTimeMillis || 0,
        stage:               explain.queryPlanner?.winningPlan?.stage || 'unknown',
    };
}

// ── Results output ────────────────────────────────────────────────────────────
function printStats(label, s) {
    console.log(`  ${label}:`);
    console.log(`    Runs   : ${s.runs}`);
    console.log(`    Avg    : ${s.avg} ms`);
    console.log(`    Median : ${s.median} ms`);
    console.log(`    Min    : ${s.min} ms`);
    console.log(`    Max    : ${s.max} ms`);
    console.log(`    P95    : ${s.p95} ms`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function benchmark() {
    console.log('\n════════════════════════════════════════════════════');
    console.log(` ShopSphere Benchmark — ${LABEL}`);
    console.log('════════════════════════════════════════════════════');
    console.log(` Runs per test : ${RUNS}`);
    console.log(` Timestamp     : ${new Date().toISOString()}`);
    console.log('════════════════════════════════════════════════════\n');

    const uri = config.get('MONGODB_URI');
    console.log('[BENCH] Connecting...');
    await mongoose.connect(uri);
    console.log('[BENCH] Connected.\n');

    // ── Dataset summary ──────────────────────────────────────────────────────
    const [totalOrders, benchOrders, realOrders, totalProducts, totalSellers] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ _isBenchmark: true }),
        Order.countDocuments({ _isBenchmark: { $ne: true } }),
        Product.countDocuments(),
        Seller.countDocuments(),
    ]);

    console.log('── Dataset at Benchmark Time ───────────────────────');
    console.log(`  Total orders       : ${totalOrders}`);
    console.log(`    └ Benchmark      : ${benchOrders}`);
    console.log(`    └ Real/demo      : ${realOrders}`);
    console.log(`  Products           : ${totalProducts}`);
    console.log(`  Sellers            : ${totalSellers}`);

    // ── Find a seller with products for seller benchmark ─────────────────────
    const sellerWithProducts = await Product.findOne({ seller: { $ne: null } }).select('seller').lean();
    // Fall back to first benchmark seller if no real seller has products
    let benchmarkSellerId;
    if (sellerWithProducts) {
        benchmarkSellerId = sellerWithProducts.seller;
        console.log(`\n[BENCH] Using seller ${benchmarkSellerId} (has real products)`);
    } else {
        const benchSeller = await Seller.findOne({ _isBenchmark: true }).lean();
        if (!benchSeller) {
            console.log('\n[BENCH] No seller with products found. Run seed:benchmark first.');
            await mongoose.disconnect();
            return;
        }
        benchmarkSellerId = benchSeller._id;
        console.log(`\n[BENCH] Using benchmark seller ${benchmarkSellerId}`);
    }

    // ── explain() analysis ONCE (before timing loops) ────────────────────────
    console.log('\n── MongoDB explain() Analysis ──────────────────────');
    try {
        const sellerExplain = await explainSellerQuery(benchmarkSellerId);
        console.log('  Seller order query:');
        console.log(`    Stage            : ${sellerExplain.stage}`);
        console.log(`    Index used       : ${sellerExplain.indexUsed}`);
        console.log(`    Docs examined    : ${sellerExplain.totalDocsExamined}`);
        console.log(`    Keys examined    : ${sellerExplain.totalKeysExamined}`);
        console.log(`    Docs returned    : ${sellerExplain.nReturned}`);
        console.log(`    MongoDB exec time: ${sellerExplain.executionTimeMillis} ms`);

        const ownerExplain = await explainOwnerQuery();
        console.log('\n  Owner orders full-scan:');
        console.log(`    Stage            : ${ownerExplain.stage}`);
        console.log(`    Docs examined    : ${ownerExplain.totalDocsExamined}`);
        console.log(`    Keys examined    : ${ownerExplain.totalKeysExamined}`);
        console.log(`    Docs returned    : ${ownerExplain.nReturned}`);
        console.log(`    MongoDB exec time: ${ownerExplain.executionTimeMillis} ms`);
    } catch(e) {
        console.log('  (explain() failed:', e.message, ')');
    }

    // ── Seller analytics timing (CURRENT implementation) ─────────────────────
    console.log(`\n── Seller Analytics — CURRENT (${RUNS} runs) ─────────`);
    const sellerTimes = [];
    for (let i = 0; i < RUNS; i++) {
        const t0 = now();
        await currentSellerAnalytics(benchmarkSellerId);
        sellerTimes.push(Math.round(now() - t0));
        process.stdout.write(`\r   Run ${i + 1}/${RUNS}...`);
    }
    console.log('');
    const sellerStats = stats(sellerTimes);
    printStats('Seller Analytics (current)', sellerStats);

    // ── Owner analytics timing (CURRENT implementation) ───────────────────────
    console.log(`\n── Owner Analytics — CURRENT (${RUNS} runs) ──────────`);
    const ownerTimes = [];
    for (let i = 0; i < RUNS; i++) {
        const t0 = now();
        await currentOwnerAnalytics();
        ownerTimes.push(Math.round(now() - t0));
        process.stdout.write(`\r   Run ${i + 1}/${RUNS}...`);
    }
    console.log('');
    const ownerStats = stats(ownerTimes);
    printStats('Owner Analytics (current)', ownerStats);

    // ── Optimized analytics service timing ────────────────────────────────────
    let sellerOptStats = null;
    let ownerOptStats  = null;
    try {
        const { getSellerAnalytics, getOwnerAnalytics } = require('../utils/analyticsService');

        console.log(`\n── Seller Analytics — OPTIMIZED (${RUNS} runs) ───────`);
        const sellerOptTimes = [];
        for (let i = 0; i < RUNS; i++) {
            const t0 = now();
            await getSellerAnalytics(benchmarkSellerId);
            sellerOptTimes.push(Math.round(now() - t0));
            process.stdout.write(`\r   Run ${i + 1}/${RUNS}...`);
        }
        console.log('');
        sellerOptStats = stats(sellerOptTimes);
        printStats('Seller Analytics (optimized)', sellerOptStats);

        console.log(`\n── Owner Analytics — OPTIMIZED (${RUNS} runs) ────────`);
        const ownerOptTimes = [];
        for (let i = 0; i < RUNS; i++) {
            const t0 = now();
            await getOwnerAnalytics();
            ownerOptTimes.push(Math.round(now() - t0));
            process.stdout.write(`\r   Run ${i + 1}/${RUNS}...`);
        }
        console.log('');
        ownerOptStats = stats(ownerOptTimes);
        printStats('Owner Analytics (optimized)', ownerOptStats);

        // Print quick comparison
        if (sellerOptStats && ownerOptStats) {
            const sellerImprove = sellerStats.avg > 0 ? Math.round((1 - sellerOptStats.avg / sellerStats.avg) * 100) : 0;
            const ownerImprove  = ownerStats.avg  > 0 ? Math.round((1 - ownerOptStats.avg  / ownerStats.avg)  * 100) : 0;
            console.log('\n── Quick Comparison ─────────────────────────────────');
            console.log(`  Seller avg: ${sellerStats.avg}ms → ${sellerOptStats.avg}ms  (${sellerImprove > 0 ? '-' + sellerImprove + '% faster' : '+' + Math.abs(sellerImprove) + '% slower'})`);
            console.log(`  Owner avg : ${ownerStats.avg}ms  → ${ownerOptStats.avg}ms   (${ownerImprove  > 0 ? '-' + ownerImprove  + '% faster' : '+' + Math.abs(ownerImprove)  + '% slower'})`);
        }
    } catch (e) {
        console.log('\n[BENCH] Optimized service not available yet:', e.message);
    }

    // ── Save results to JSONL ─────────────────────────────────────────────────
    const resultsDir = path.join(__dirname, '../benchmark-results');
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

    const resultRecord = {
        timestamp:     new Date().toISOString(),
        label:         LABEL,
        runs:          RUNS,
        dataset: {
            totalOrders,
            benchOrders,
            realOrders,
            totalProducts,
            totalSellers,
        },
        sellerAnalyticsCurrent:   sellerStats,
        ownerAnalyticsCurrent:    ownerStats,
        sellerAnalyticsOptimized: sellerOptStats,
        ownerAnalyticsOptimized:  ownerOptStats,
    };

    const resultsFile = path.join(resultsDir, 'results.jsonl');
    fs.appendFileSync(resultsFile, JSON.stringify(resultRecord) + '\n');
    console.log(`\n[BENCH] Results appended to benchmark-results/results.jsonl`);

    console.log('\n════════════════════════════════════════════════════');
    console.log(` Benchmark Complete — ${LABEL}`);
    console.log('════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
}

benchmark().catch(err => {
    console.error('\n[BENCH] Fatal error:', err.message);
    process.exit(1);
});
