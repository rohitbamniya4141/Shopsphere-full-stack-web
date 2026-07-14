/**
 * seed.js — ShopSphere Premium Product Seeder
 *
 * Usage:
 *   node seed.js
 *
 * What it does:
 *   1. Connects to MongoDB
 *   2. Deletes ALL existing products
 *   3. Reads all JSON files in data/products/
 *   4. Merges all products
 *   5. Inserts all products one-by-one
 */

require('dotenv').config();
const mongoose     = require('mongoose');
const config       = require('config');
const fs           = require('fs');
const path         = require('path');

// ─── Model ────────────────────────────────────────────────────────────────────
const productModel = require('./models/product-model');

// ─── Document Builder ─────────────────────────────────────────────────────────

function buildDoc(p) {
    const daysAgo   = Math.floor(Math.random() * 90);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    return {
        image      : p.image, // URL string path
        name       : p.name,
        description: p.description,
        price      : p.price,
        discount   : p.discount,
        category   : p.category,
        demographic: p.demographic,
        rating     : p.rating,
        reviews    : p.reviews,
        specifications: p.specifications || {},
        stock      : p.stock,
        bgcolor    : p.bgcolor,
        panelcolor : p.panelcolor,
        textcolor  : p.textcolor,
        seller     : null,
        createdAt,
        updatedAt  : createdAt,
    };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('');
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║   ShopSphere Premium Product Seeder v4        ║');
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');

    // 1. Connect
    console.log('🔌  Connecting to MongoDB...');
    await mongoose.connect(`${config.get('MONGODB_URI')}/shopSphere`);
    console.log('✅  Connected\n');

    // 2. Clear
    const count = await productModel.countDocuments();
    console.log(`🗑   Removing ${count} existing product(s)...`);
    await productModel.deleteMany({});
    console.log('✅  Collection cleared\n');

    // 3. Load JSON files from data/products/
    const dataDir = path.join(__dirname, 'data', 'products');
    let products = [];
    if (fs.existsSync(dataDir)) {
        const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
        console.log(`📂  Found ${files.length} JSON files in data/products/`);
        for (const file of files) {
            const filePath = path.join(dataDir, file);
            try {
                const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (Array.isArray(fileData)) {
                    products = products.concat(fileData);
                    console.log(`    + Loaded ${fileData.length} products from ${file}`);
                }
            } catch (err) {
                console.error(`    ❌ Failed to parse ${file}: ${err.message}`);
            }
        }
    } else {
        console.error('❌  data/products/ directory not found!');
        process.exit(1);
    }

    if (products.length === 0) {
        console.error('❌  No products found to seed!');
        process.exit(1);
    }

    // 4. Build docs
    console.log(`\n📦  Building ${products.length} product documents...`);
    const docs     = [];
    const catStats = {};

    for (const p of products) {
        docs.push(buildDoc(p));
        catStats[p.category] = (catStats[p.category] || 0) + 1;
    }

    // 5. Insert one-by-one to prevent BSON command limit errors
    console.log(`\n📤  Inserting ${docs.length} documents one-by-one...`);
    for (let i = 0; i < docs.length; i++) {
        await productModel.create(docs[i]);
        if ((i + 1) % 10 === 0 || i === docs.length - 1) {
            console.log(`    📦  Progress: ${i + 1}/${docs.length} inserted...`);
        }
    }

    // 6. Summary
    console.log('');
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║                  SUMMARY                      ║');
    console.log('╠═══════════════════════════════════════════════╣');
    console.log(`║  ✅  Total inserted   : ${String(docs.length).padEnd(20)} ║`);
    console.log('╠═══════════════════════════════════════════════╣');
    console.log('║  CATEGORIES                                    ║');

    Object.entries(catStats).forEach(([cat, n]) => {
        const line = `  ${cat.padEnd(18)} : ${n} products`;
        console.log(`║  ${line.padEnd(44)} ║`);
    });

    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');
    console.log('  🎉 Done!  npm run dev  →  http://localhost:3000/shop');
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
}

main().catch(err => {
    console.error('\n❌  Fatal error:', err.message);
    console.error(err);
    mongoose.disconnect().finally(() => process.exit(1));
});
