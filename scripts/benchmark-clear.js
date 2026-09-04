/**
 * benchmark-clear.js
 * ─────────────────────────────────────────────────────────────────────────────
 * DEVELOPMENT-ONLY synthetic data cleaner.
 *
 * Removes ONLY documents tagged with { _isBenchmark: true }.
 * Real/demo data (products, users, sellers, orders) is NEVER touched.
 *
 * Usage:
 *   npm run clear:benchmark
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

require('dotenv').config();
const NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV !== 'development') {
    console.error('\n[CLEAR] ABORTED — benchmark clearing is only allowed in development mode.');
    process.exit(1);
}

const mongoose = require('mongoose');
const config   = require('config');
const Order    = require('../models/order-model');
const User     = require('../models/user-model');
const Seller   = require('../models/seller-model');

async function clear() {
    console.log('\n════════════════════════════════════════════════════');
    console.log(' ShopSphere Benchmark Cleaner (DEVELOPMENT ONLY)');
    console.log('════════════════════════════════════════════════════');
    console.log(' Removes ONLY documents tagged _isBenchmark: true');
    console.log(' Real/demo data will NOT be touched.');
    console.log('════════════════════════════════════════════════════\n');

    const uri = config.get('MONGODB_URI');
    console.log('[CLEAR] Connecting...');
    await mongoose.connect(uri);
    console.log('[CLEAR] Connected.\n');

    // Count before deletion
    const [benchOrders, benchUsers, benchSellers] = await Promise.all([
        Order.countDocuments({ _isBenchmark: true }),
        User.countDocuments({ _isBenchmark: true }),
        Seller.countDocuments({ _isBenchmark: true }),
    ]);

    console.log(`[CLEAR] Found to delete:`);
    console.log(`  Orders  : ${benchOrders}`);
    console.log(`  Users   : ${benchUsers}`);
    console.log(`  Sellers : ${benchSellers}`);

    if (benchOrders + benchUsers + benchSellers === 0) {
        console.log('\n[CLEAR] Nothing to delete — no benchmark data found.');
        await mongoose.disconnect();
        return;
    }

    // Delete benchmark documents
    console.log('\n[CLEAR] Deleting...');
    const [oResult, uResult, sResult] = await Promise.all([
        Order.deleteMany({ _isBenchmark: true }),
        User.deleteMany({ _isBenchmark: true }),
        Seller.deleteMany({ _isBenchmark: true }),
    ]);

    console.log(`[CLEAR] ✓ Deleted:`);
    console.log(`  Orders  : ${oResult.deletedCount}`);
    console.log(`  Users   : ${uResult.deletedCount}`);
    console.log(`  Sellers : ${sResult.deletedCount}`);

    // Verify real data is intact
    const [realOrders, realUsers, realSellers] = await Promise.all([
        Order.countDocuments({ _isBenchmark: { $ne: true } }),
        User.countDocuments({ _isBenchmark: { $ne: true } }),
        Seller.countDocuments({ _isBenchmark: { $ne: true } }),
    ]);

    console.log('\n[CLEAR] Real/demo data verification (should be unchanged):');
    console.log(`  Real orders  : ${realOrders}`);
    console.log(`  Real users   : ${realUsers}`);
    console.log(`  Real sellers : ${realSellers}`);

    console.log('\n════════════════════════════════════════════════════');
    console.log(' Cleanup Complete — benchmark data removed safely.');
    console.log('════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
}

clear().catch(err => {
    console.error('\n[CLEAR] Fatal error:', err.message);
    process.exit(1);
});
