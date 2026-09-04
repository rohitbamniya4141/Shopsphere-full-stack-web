/**
 * add-indexes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * DEVELOPMENT-ONLY script to add MongoDB indexes to the orders and products
 * collections.
 *
 * Run this AFTER capturing BEFORE benchmark results and BEFORE running the
 * AFTER benchmark.
 *
 * Each index is explained before creation. Indexes are created with
 * background:true so the app keeps running during creation.
 *
 * Usage:
 *   npm run add:indexes
 *
 * Safe to run multiple times — uses { background: true } and Mongoose will
 * skip existing indexes gracefully.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

require('dotenv').config();
const NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV !== 'development') {
    console.error('[INDEX] ABORTED — only allowed in development mode.');
    process.exit(1);
}

const mongoose = require('mongoose');
const config   = require('config');
const Order    = require('../models/order-model');
const Product  = require('../models/product-model');

async function addIndexes() {
    console.log('\n════════════════════════════════════════════════════');
    console.log(' ShopSphere — Add Analytics Indexes');
    console.log('════════════════════════════════════════════════════\n');

    const uri = config.get('MONGODB_URI');
    await mongoose.connect(uri);
    console.log('[INDEX] Connected.\n');

    // ── BEFORE state ──────────────────────────────────────────────────────────
    console.log('── Indexes BEFORE ──────────────────────────────────');
    const beforeOrders   = await Order.collection.indexes();
    const beforeProducts = await Product.collection.indexes();
    console.log('  orders:');
    beforeOrders.forEach(i => console.log(`    ${JSON.stringify(i.key).padEnd(45)} name=${i.name}`));
    console.log('  products:');
    beforeProducts.forEach(i => console.log(`    ${JSON.stringify(i.key).padEnd(45)} name=${i.name}`));

    // ── Create indexes ────────────────────────────────────────────────────────
    console.log('\n── Creating Indexes ────────────────────────────────\n');

    const indexesToCreate = [
        // ── orders collection ────────────────────────────────────────────────
        {
            collection: Order,
            name: 'idx_orders_purchasedItems_seller',
            spec: { 'purchasedItems.seller': 1 },
            purpose: 'Seller revenue aggregate: $unwind purchasedItems → $match seller. ' +
                     'Without this: full COLLSCAN of all orders before seller filter. ' +
                     'With this: index on the embedded seller field avoids scanning unrelated docs.'
        },
        {
            collection: Order,
            name: 'idx_orders_products',
            spec: { 'products': 1 },
            purpose: 'Seller order lookup: find({ products: { $in: sellerProductIds } }). ' +
                     'Without this: full COLLSCAN on every products array element. ' +
                     'With this: multikey index on the products array.'
        },
        {
            collection: Order,
            name: 'idx_orders_createdAt',
            spec: { createdAt: -1 },
            purpose: 'Time-range filters for monthly analytics and recent-orders queries. ' +
                     'Enables efficient date range scans instead of full COLLSCAN.'
        },
        {
            collection: Order,
            name: 'idx_orders_status',
            spec: { status: 1 },
            purpose: 'Status-based counts (Pending, Delivered, Cancelled). ' +
                     'Enables countDocuments({ status: X }) with index scan instead of COLLSCAN.'
        },
        {
            collection: Order,
            name: 'idx_orders_user',
            spec: { user: 1 },
            purpose: 'User order history lookup: find({ user: userId }). ' +
                     'Used in customer order page and review validation.'
        },
        {
            collection: Order,
            name: 'idx_orders_isBenchmark',
            spec: { _isBenchmark: 1 },
            purpose: 'Benchmark data isolation: countDocuments({ _isBenchmark: true/false }). ' +
                     'Speeds up data-quality.js and benchmark scripts.'
        },
        // ── products collection ──────────────────────────────────────────────
        {
            collection: Product,
            name: 'idx_products_seller',
            spec: { seller: 1 },
            purpose: 'Seller product lookup: find({ seller: sellerId }). ' +
                     'Used in seller dashboard and analytics to find seller\'s products.'
        },
        {
            collection: Product,
            name: 'idx_products_category_stock',
            spec: { category: 1, stock: -1 },
            purpose: 'AI chat + shop filter: find({ category: X, stock: { $gt: 0 } }). ' +
                     'Compound index covers both category filter and stock sort/filter together.'
        },
        {
            collection: Product,
            name: 'idx_products_price_stock',
            spec: { price: 1, stock: -1 },
            purpose: 'Shop price-range filter + sort: find({ price: { $gte, $lte }, stock: { $gt: 0 } }). ' +
                     'Covers budget filtering in AI chat and /shop page.'
        },
    ];

    const results = [];

    for (const idx of indexesToCreate) {
        console.log(`  Creating: ${idx.name}`);
        console.log(`  Spec    : ${JSON.stringify(idx.spec)}`);
        console.log(`  Purpose : ${idx.purpose}`);

        const t0 = Date.now();
        try {
            await idx.collection.collection.createIndex(idx.spec, {
                name: idx.name,
                background: true
            });
            const elapsed = Date.now() - t0;
            console.log(`  ✓ Created in ${elapsed} ms\n`);
            results.push({ name: idx.name, status: 'created', ms: elapsed });
        } catch (err) {
            if (err.code === 85 || err.code === 86 || err.message.includes('already exists')) {
                console.log(`  ✓ Already exists (skipped)\n`);
                results.push({ name: idx.name, status: 'already_exists', ms: 0 });
            } else {
                console.log(`  ✗ Failed: ${err.message}\n`);
                results.push({ name: idx.name, status: 'failed', error: err.message });
            }
        }
    }

    // ── AFTER state ───────────────────────────────────────────────────────────
    console.log('── Indexes AFTER ───────────────────────────────────');
    const afterOrders   = await Order.collection.indexes();
    const afterProducts = await Product.collection.indexes();
    console.log('  orders:');
    afterOrders.forEach(i => console.log(`    ${JSON.stringify(i.key).padEnd(45)} name=${i.name}`));
    console.log('  products:');
    afterProducts.forEach(i => console.log(`    ${JSON.stringify(i.key).padEnd(45)} name=${i.name}`));

    console.log('\n── Summary ─────────────────────────────────────────');
    results.forEach(r => {
        const status = r.status === 'created' ? `✓ created (${r.ms}ms)` :
                       r.status === 'already_exists' ? '✓ already existed' :
                       `✗ FAILED: ${r.error}`;
        console.log(`  ${r.name.padEnd(42)} ${status}`);
    });

    console.log('\n════════════════════════════════════════════════════');
    console.log(' Indexes applied. Run: npm run benchmark -- --label "AFTER_indexes_Nk_orders"');
    console.log('════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
}

addIndexes().catch(err => {
    console.error('[INDEX] Fatal:', err.message);
    process.exit(1);
});
