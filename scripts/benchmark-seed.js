/**
 * benchmark-seed.js
 * ─────────────────────────────────────────────────────────────────────────────
 * DEVELOPMENT-ONLY synthetic benchmark data seeder.
 *
 * SAFETY GUARANTEES:
 *  1. Refuses to run unless NODE_ENV === 'development'
 *  2. Uses the SAME MongoDB database as the app (Atlas) but tags every
 *     synthetic record with { _isBenchmark: true } so they can be found
 *     and removed precisely without touching real data.
 *  3. Never modifies, replaces, or deletes real/demo products, users,
 *     sellers, or orders.
 *  4. Reads existing real products and builds orders around them so the
 *     product universe stays real.
 *  5. Creates synthetic users and seller accounts (tagged) for orders that
 *     need customers and sellers.
 *  6. Accepts --size flag: 1000 | 5000 | 10000
 *
 * Usage:
 *   npm run seed:benchmark -- --size 1000
 *   npm run seed:benchmark -- --size 5000
 *   npm run seed:benchmark -- --size 10000
 *
 * Cleanup (removes ONLY benchmark records):
 *   npm run clear:benchmark
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

// ── Guard: development only ──────────────────────────────────────────────────
require('dotenv').config();
const NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV !== 'development') {
    console.error('\n[SEED] ABORTED — benchmark seeding is only allowed in development mode.');
    console.error('[SEED] Current NODE_ENV:', NODE_ENV);
    process.exit(1);
}

const mongoose = require('mongoose');
const config   = require('config');

// ── Models ────────────────────────────────────────────────────────────────────
const Order   = require('../models/order-model');
const Product = require('../models/product-model');
const User    = require('../models/user-model');
const Seller  = require('../models/seller-model');

// ── CLI argument parsing ──────────────────────────────────────────────────────
const args = process.argv.slice(2);
const sizeArg = args.find(a => a.startsWith('--size'));
const TARGET_ORDERS = sizeArg ? parseInt(sizeArg.split('=')[1] || args[args.indexOf(sizeArg) + 1]) : 1000;

if (![1000, 5000, 10000].includes(TARGET_ORDERS)) {
    console.error('\n[SEED] Invalid --size. Use 1000, 5000, or 10000.');
    process.exit(1);
}

// ── Seeding constants ─────────────────────────────────────────────────────────
const BENCHMARK_TAG        = true;          // all synthetic docs get _isBenchmark: true
const SYNTHETIC_USER_COUNT = 150;           // unique synthetic customers
const SYNTHETIC_SELLER_COUNT = 5;          // synthetic sellers
const ITEMS_PER_ORDER_MIN  = 1;
const ITEMS_PER_ORDER_MAX  = 4;

// ── Actual categories from real database (found via db-inspect.js) ────────────
const REAL_CATEGORIES = ['Backpacks', 'Laptop Bags', 'Office Bags', 'Travel Bags'];

// ── Order statuses (realistic distribution) ────────────────────────────────────
// Weights: Delivered 40%, Shipped 20%, Payment Confirmed 20%, Pending 10%,
//          Cancelled 7%, Out For Delivery 3%
const STATUS_POOL = [
    ...Array(40).fill('Delivered'),
    ...Array(20).fill('Shipped'),
    ...Array(20).fill('Payment Confirmed'),
    ...Array(10).fill('Pending'),
    ...Array(7).fill('Cancelled'),
    ...Array(3).fill('Out For Delivery'),
];

// ── Date helpers ───────────────────────────────────────────────────────────────
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function buildStatusHistory(status, orderDate) {
    const history = [{ status: 'Pending', date: orderDate }];
    const flow = ['Pending', 'Payment Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered'];
    const idx   = flow.indexOf(status);
    if (idx > 0) {
        for (let i = 1; i <= idx; i++) {
            history.push({
                status: flow[i],
                date: new Date(orderDate.getTime() + i * 86400000 * (1 + Math.random()))
            });
        }
    }
    if (status === 'Cancelled') {
        history.push({ status: 'Cancelled', date: new Date(orderDate.getTime() + 86400000) });
    }
    return history;
}

// ── Random picker ──────────────────────────────────────────────────────────────
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function pickN(arr, n) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, arr.length));
}
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Main seeder ────────────────────────────────────────────────────────────────
async function seed() {
    console.log('\n════════════════════════════════════════════════════');
    console.log(' ShopSphere Benchmark Seeder (DEVELOPMENT ONLY)');
    console.log('════════════════════════════════════════════════════');
    console.log(` Target orders : ${TARGET_ORDERS}`);
    console.log(` NODE_ENV      : ${NODE_ENV}`);
    console.log('════════════════════════════════════════════════════\n');

    const uri = config.get('MONGODB_URI');
    console.log('[SEED] Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('[SEED] Connected.\n');

    // ── Step 1: Count existing benchmark data ──────────────────────────────
    const existingBenchmarkOrders = await Order.countDocuments({ _isBenchmark: BENCHMARK_TAG });
    const existingBenchmarkUsers  = await User.countDocuments({ _isBenchmark: BENCHMARK_TAG });
    const existingBenchmarkSellers = await Seller.countDocuments({ _isBenchmark: BENCHMARK_TAG });

    if (existingBenchmarkOrders > 0) {
        console.log(`[SEED] Found ${existingBenchmarkOrders} existing benchmark orders.`);
        console.log('[SEED] Run "npm run clear:benchmark" first to remove them.\n');
        console.log('[SEED] Or proceeding with a fresh batch on top (each batch is independently clearable).\n');
    }

    // ── Step 2: Load real products (never modified) ────────────────────────
    console.log('[SEED] Loading real product catalog...');
    const realProducts = await Product.find({}).select('_id name price discount category seller stock').lean();
    if (realProducts.length === 0) {
        console.error('[SEED] No products found. Cannot seed orders without products.');
        process.exit(1);
    }
    console.log(`[SEED] Found ${realProducts.length} real products across categories:`);
    const catCounts = {};
    realProducts.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
    Object.entries(catCounts).forEach(([cat, n]) => console.log(`       ${cat}: ${n} products`));

    // ── Step 3: Create synthetic sellers ──────────────────────────────────
    console.log(`\n[SEED] Creating ${SYNTHETIC_SELLER_COUNT} synthetic sellers...`);
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('BenchmarkPass123!', 10);

    const syntheticSellerDocs = [];
    for (let i = 0; i < SYNTHETIC_SELLER_COUNT; i++) {
        syntheticSellerDocs.push({
            fullname: `Benchmark Seller ${i + 1}`,
            email: `bench-seller-${Date.now()}-${i}@benchmark.shopsphere.dev`,
            password: hashedPassword,
            phone: 9000000000 + i,
            shopName: `BenchShop ${i + 1}`,
            shopDescription: 'Synthetic benchmark seller — safe to delete',
            isApproved: true,
            isBlocked: false,
            _isBenchmark: true
        });
    }

    // Use insertMany with ordered:false for speed
    let syntheticSellers;
    try {
        syntheticSellers = await Seller.insertMany(syntheticSellerDocs, { ordered: false });
        console.log(`[SEED] Created ${syntheticSellers.length} synthetic sellers.`);
    } catch(e) {
        // Handle duplicate email edge cases on re-run
        syntheticSellers = await Seller.find({ _isBenchmark: true }).lean();
        console.log(`[SEED] Using ${syntheticSellers.length} existing benchmark sellers.`);
    }
    const syntheticSellerIds = syntheticSellers.map(s => s._id);

    // ── Step 4: Create synthetic users ────────────────────────────────────
    console.log(`\n[SEED] Creating ${SYNTHETIC_USER_COUNT} synthetic users...`);
    const syntheticUserDocs = Array.from({ length: SYNTHETIC_USER_COUNT }, (_, i) => ({
        fullname: `Benchmark Customer ${i + 1}`,
        email: `bench-user-${Date.now()}-${i}@benchmark.shopsphere.dev`,
        password: hashedPassword,
        cart: [],
        wishlist: [],
        orders: [],
        role: 'user',
        _isBenchmark: true
    }));

    let syntheticUsers;
    try {
        syntheticUsers = await User.insertMany(syntheticUserDocs, { ordered: false });
        console.log(`[SEED] Created ${syntheticUsers.length} synthetic users.`);
    } catch(e) {
        syntheticUsers = await User.find({ _isBenchmark: true }).lean();
        console.log(`[SEED] Using ${syntheticUsers.length} existing benchmark users.`);
    }
    const syntheticUserIds = syntheticUsers.map(u => u._id);

    // ── Step 5: Generate synthetic orders ────────────────────────────────
    console.log(`\n[SEED] Generating ${TARGET_ORDERS} synthetic orders...`);

    // Date range: spread orders over last 14 months for realistic monthly trends
    const dateEnd   = new Date();
    const dateStart = new Date();
    dateStart.setMonth(dateStart.getMonth() - 14);

    const BATCH_SIZE = 500;
    let totalInserted = 0;
    let batches = Math.ceil(TARGET_ORDERS / BATCH_SIZE);

    for (let b = 0; b < batches; b++) {
        const batchCount = Math.min(BATCH_SIZE, TARGET_ORDERS - totalInserted);
        const orderDocs  = [];

        for (let i = 0; i < batchCount; i++) {
            const orderDate = randomDate(dateStart, dateEnd);
            const status    = pick(STATUS_POOL);
            const userId    = pick(syntheticUserIds);

            // Pick 1–4 distinct products for this order
            const itemCount      = randInt(ITEMS_PER_ORDER_MIN, ITEMS_PER_ORDER_MAX);
            const chosenProducts = pickN(realProducts, itemCount);

            // Build purchasedItems using REAL product prices
            // Assign a synthetic or real seller to each item
            const purchasedItems = chosenProducts.map(p => {
                // Use the product's real seller if it exists, otherwise assign a synthetic one
                const sellerId = p.seller || pick(syntheticSellerIds);
                return {
                    product:  p._id,
                    price:    p.price,
                    discount: p.discount || 0,
                    seller:   sellerId,
                    qty:      1
                };
            });

            // Calculate totalAmount matching the app's logic (sum of price-discount + ₹20 platform fee)
            const itemTotal = purchasedItems.reduce((sum, item) => {
                return sum + (item.price - item.discount);
            }, 0);
            const totalAmount = itemTotal + 20;

            const statusHistory = buildStatusHistory(status, orderDate);

            orderDocs.push({
                user:           userId,
                products:       chosenProducts.map(p => p._id),
                purchasedItems: purchasedItems,
                totalAmount:    totalAmount,
                status:         status,
                statusHistory:  statusHistory,
                paymentId:      `benchmark_pay_${Date.now()}_${i}`,
                createdAt:      orderDate,
                updatedAt:      orderDate,
                _isBenchmark:   true
            });
        }

        await Order.insertMany(orderDocs, { ordered: false });
        totalInserted += batchCount;
        process.stdout.write(`\r[SEED] Inserted ${totalInserted}/${TARGET_ORDERS} orders...`);
    }

    console.log(`\n[SEED] ✓ ${totalInserted} synthetic orders inserted.\n`);

    // ── Step 6: Verify ──────────────────────────────────────────────────────
    const [benchOrders, benchUsers, benchSellers, realOrders] = await Promise.all([
        Order.countDocuments({ _isBenchmark: true }),
        User.countDocuments({ _isBenchmark: true }),
        Seller.countDocuments({ _isBenchmark: true }),
        Order.countDocuments({ _isBenchmark: { $ne: true } }),
    ]);

    console.log('════════════════════════════════════════════════════');
    console.log(' Seeding Complete');
    console.log('════════════════════════════════════════════════════');
    console.log(` Real/demo orders (untouched) : ${realOrders}`);
    console.log(` Benchmark orders             : ${benchOrders}`);
    console.log(` Benchmark users              : ${benchUsers}`);
    console.log(` Benchmark sellers            : ${benchSellers}`);
    console.log('────────────────────────────────────────────────────');
    console.log(' To remove benchmark data: npm run clear:benchmark');
    console.log('════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
}

seed().catch(err => {
    console.error('\n[SEED] Fatal error:', err.message);
    process.exit(1);
});
