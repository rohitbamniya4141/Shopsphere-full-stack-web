/**
 * ShopSphere - Real Image Seeder
 * 
 * Downloads REAL bag product photos from Unsplash (free, high-quality)
 * and updates all products in the database.
 * 
 * Run: node seed-real-images.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const https = require('https');
const http = require('http');
const config = require('config');
const productModel = require('./models/product-model');

// ─── MongoDB Connection ─────────────────────────────────────────────
mongoose.connect(`${config.get('MONGODB_URI')}/shopSphere`)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => { console.error('❌ MongoDB error:', err); process.exit(1); });

// ─── Image downloader with redirect support ─────────────────────────
function downloadImage(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const attempt = (url, retriesLeft) => {
      const protocol = url.startsWith('https') ? https : http;
      const req = protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          attempt(res.headers.location, retriesLeft);
          return;
        }
        if (res.statusCode !== 200) {
          if (retriesLeft > 0) {
            setTimeout(() => attempt(url, retriesLeft - 1), 1000);
          } else {
            reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          }
          return;
        }
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (buffer.length < 1000) {
            reject(new Error(`Image too small (${buffer.length} bytes)`));
          } else {
            resolve(buffer);
          }
        });
        res.on('error', reject);
      });
      req.on('error', (err) => {
        if (retriesLeft > 0) {
          setTimeout(() => attempt(url, retriesLeft - 1), 1000);
        } else {
          reject(err);
        }
      });
      req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    };
    attempt(url, retries);
  });
}

// ─── Real bag image URLs from Unsplash (free to use) ────────────────
// These are actual high-quality product photos of bags

const imageUrls = {
  handbag: [
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1614179689702-355944cd0918?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop&crop=center',
  ],
  backpack: [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1622560480654-1e9a7c3e6d16?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1580087256394-dc596e1c8f4f?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1559893088-c0787ebfc084?w=400&h=500&fit=crop&crop=center',
  ],
  tote: [
    'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1612902456551-404b5c7c9890?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1611010344444-5f9e4d86a6e5?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400&h=500&fit=crop&crop=center',
  ],
  clutch: [
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1614179689702-355944cd0918?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3?w=400&h=500&fit=crop&crop=center',
  ],
  laptop: [
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1580087256394-dc596e1c8f4f?w=400&h=500&fit=crop&crop=center',
  ],
  travel: [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1559893088-c0787ebfc084?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1622560480654-1e9a7c3e6d16?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400&h=500&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=500&fit=crop&crop=center',
  ]
};

// ─── Product definitions with realistic pricing ─────────────────────
const colorSchemes = [
  { bgcolor: '#f5f0eb', panelcolor: '#1a1a2e', textcolor: '#ffffff' },
  { bgcolor: '#e8d5c4', panelcolor: '#2d2d2d', textcolor: '#ffffff' },
  { bgcolor: '#d4c5b2', panelcolor: '#3d2b1f', textcolor: '#f5f0eb' },
  { bgcolor: '#f0e6d3', panelcolor: '#1b4332', textcolor: '#ffffff' },
  { bgcolor: '#e6d5c3', panelcolor: '#4a1942', textcolor: '#ffffff' },
  { bgcolor: '#dce8e0', panelcolor: '#1a1a2e', textcolor: '#ffffff' },
  { bgcolor: '#f5e6d0', panelcolor: '#6b3a2a', textcolor: '#ffffff' },
  { bgcolor: '#e8e0d8', panelcolor: '#2f4f4f', textcolor: '#ffffff' },
  { bgcolor: '#f0ece4', panelcolor: '#191970', textcolor: '#ffffff' },
  { bgcolor: '#d8cfc4', panelcolor: '#6b2737', textcolor: '#ffffff' },
  { bgcolor: '#e4ddd5', panelcolor: '#2c3e50', textcolor: '#ffffff' },
  { bgcolor: '#f2ebe3', panelcolor: '#34495e', textcolor: '#ecf0f1' },
  { bgcolor: '#ede4db', panelcolor: '#1c1c1c', textcolor: '#d4a574' },
  { bgcolor: '#dfd8cf', panelcolor: '#4a3728', textcolor: '#f0e6d3' },
  { bgcolor: '#e9e1d9', panelcolor: '#2c1810', textcolor: '#ffffff' },
  { bgcolor: '#cfd5d0', panelcolor: '#1a1a2e', textcolor: '#e0c097' },
  { bgcolor: '#f7f0e8', panelcolor: '#5c3d2e', textcolor: '#ffffff' },
  { bgcolor: '#e0d8d0', panelcolor: '#3b0d11', textcolor: '#f5e6d0' },
  { bgcolor: '#d9d0c7', panelcolor: '#0d1b2a', textcolor: '#ffffff' },
  { bgcolor: '#f5ede5', panelcolor: '#3e2723', textcolor: '#ffccbc' },
];

const products = [
  // ── HANDBAGS (20) ───────────────────────────────────────────
  { name: 'Classic Leather Satchel',       price: 3499, discount: 300, category: 'handbag' },
  { name: 'Milan Crossbody Bag',           price: 2799, discount: 200, category: 'handbag' },
  { name: 'Parisian Shoulder Bag',         price: 4299, discount: 500, category: 'handbag' },
  { name: 'Velvet Evening Purse',          price: 1999, discount: 0,   category: 'handbag' },
  { name: 'Quilted Chain Bag',             price: 3899, discount: 400, category: 'handbag' },
  { name: 'Suede Bucket Bag',              price: 2599, discount: 200, category: 'handbag' },
  { name: 'Croc-Embossed Handbag',         price: 5499, discount: 700, category: 'handbag' },
  { name: 'Mini Flap Crossbody',           price: 1799, discount: 100, category: 'handbag' },
  { name: 'Structured Top-Handle Bag',     price: 4799, discount: 500, category: 'handbag' },
  { name: 'Woven Leather Hobo Bag',        price: 3299, discount: 300, category: 'handbag' },
  { name: 'Canvas & Leather Duo',          price: 2299, discount: 0,   category: 'handbag' },
  { name: 'Pebble Grain Sling Bag',        price: 1599, discount: 100, category: 'handbag' },
  { name: 'Saddle Bag Luxe',               price: 3999, discount: 400, category: 'handbag' },
  { name: 'Art Deco Clutch Bag',           price: 2899, discount: 200, category: 'handbag' },
  { name: 'Monogram Print Purse',          price: 6499, discount: 800, category: 'handbag' },
  { name: 'Soft Pleat Shoulder Bag',       price: 2199, discount: 0,   category: 'handbag' },
  { name: 'Double Zip Crossbody',          price: 1899, discount: 150, category: 'handbag' },
  { name: 'Fringe Detail Bag',             price: 2699, discount: 200, category: 'handbag' },
  { name: 'Pearl Strap Handbag',           price: 4599, discount: 500, category: 'handbag' },
  { name: 'Envelope Flap Purse',           price: 1499, discount: 100, category: 'handbag' },

  // ── BACKPACKS (20) ─────────────────────────────────────────
  { name: 'Urban Explorer Backpack',       price: 2999, discount: 300, category: 'backpack' },
  { name: 'Leather Commuter Pack',         price: 4599, discount: 500, category: 'backpack' },
  { name: 'Campus Classic Rucksack',       price: 1799, discount: 0,   category: 'backpack' },
  { name: 'Tech-Pro Laptop Backpack',      price: 3499, discount: 400, category: 'backpack' },
  { name: 'Adventure Trail Pack',          price: 2599, discount: 200, category: 'backpack' },
  { name: 'Minimalist Day Pack',           price: 1999, discount: 150, category: 'backpack' },
  { name: 'Heritage Canvas Backpack',      price: 2799, discount: 200, category: 'backpack' },
  { name: 'Anti-Theft Smart Backpack',     price: 3999, discount: 500, category: 'backpack' },
  { name: 'Roll-Top Waterproof Pack',      price: 3299, discount: 300, category: 'backpack' },
  { name: 'Vegan Leather Day Bag',         price: 2399, discount: 0,   category: 'backpack' },
  { name: 'Ergonomic Office Pack',         price: 4299, discount: 400, category: 'backpack' },
  { name: 'Sporty Zip Backpack',           price: 1599, discount: 100, category: 'backpack' },
  { name: 'Convertible Sling Pack',        price: 2199, discount: 200, category: 'backpack' },
  { name: 'Executive Business Pack',       price: 5299, discount: 600, category: 'backpack' },
  { name: 'Nylon Travel Backpack',         price: 2899, discount: 300, category: 'backpack' },
  { name: 'Slim Profile Laptop Bag',       price: 3699, discount: 400, category: 'backpack' },
  { name: 'Mountain Hiking Pack',          price: 4999, discount: 500, category: 'backpack' },
  { name: 'Casual Weekend Rucksack',       price: 1899, discount: 0,   category: 'backpack' },
  { name: 'Multi-Pocket Utility Pack',     price: 2499, discount: 200, category: 'backpack' },
  { name: 'Premium Suede Backpack',        price: 5799, discount: 700, category: 'backpack' },

  // ── TOTE BAGS (15) ─────────────────────────────────────────
  { name: 'Everyday Canvas Tote',          price: 1299, discount: 100, category: 'tote' },
  { name: 'Oversized Leather Tote',        price: 4999, discount: 500, category: 'tote' },
  { name: 'Beach Day Straw Tote',          price: 1699, discount: 0,   category: 'tote' },
  { name: 'Structured Work Tote',          price: 3799, discount: 400, category: 'tote' },
  { name: 'Printed Shopper Tote',          price: 999,  discount: 0,   category: 'tote' },
  { name: 'Reversible Tote Bag',           price: 2199, discount: 200, category: 'tote' },
  { name: 'Laptop Tote with Pockets',      price: 3299, discount: 300, category: 'tote' },
  { name: 'Eco-Friendly Jute Tote',        price: 899,  discount: 0,   category: 'tote' },
  { name: 'Metallic Accent Tote',          price: 2799, discount: 200, category: 'tote' },
  { name: 'Drawstring Leather Tote',       price: 3999, discount: 400, category: 'tote' },
  { name: 'Zippered Carryall Tote',        price: 2499, discount: 200, category: 'tote' },
  { name: 'Color-Block Canvas Tote',       price: 1499, discount: 100, category: 'tote' },
  { name: 'Travel-Ready Tote Bag',         price: 2899, discount: 300, category: 'tote' },
  { name: 'Pleated Soft Tote',             price: 3499, discount: 300, category: 'tote' },
  { name: 'Market Basket Tote',            price: 1199, discount: 0,   category: 'tote' },

  // ── CLUTCHES (15) ──────────────────────────────────────────
  { name: 'Sequin Evening Clutch',         price: 1999, discount: 200, category: 'clutch' },
  { name: 'Leather Fold-Over Clutch',      price: 2499, discount: 0,   category: 'clutch' },
  { name: 'Crystal Embellished Clutch',    price: 3299, discount: 300, category: 'clutch' },
  { name: 'Satin Box Clutch',              price: 2799, discount: 200, category: 'clutch' },
  { name: 'Geometric Acrylic Clutch',      price: 1899, discount: 100, category: 'clutch' },
  { name: 'Wristlet Pouch Clutch',         price: 999,  discount: 0,   category: 'clutch' },
  { name: 'Pearl Handle Clutch',           price: 3599, discount: 400, category: 'clutch' },
  { name: 'Tassel Zip Pouch',              price: 1299, discount: 100, category: 'clutch' },
  { name: 'Metallic Frame Clutch',         price: 2199, discount: 200, category: 'clutch' },
  { name: 'Embroidered Silk Clutch',       price: 4299, discount: 500, category: 'clutch' },
  { name: 'Chain Strap Mini Clutch',       price: 1799, discount: 0,   category: 'clutch' },
  { name: 'Feather Detail Clutch',         price: 2999, discount: 300, category: 'clutch' },
  { name: 'Envelope Velvet Clutch',        price: 1599, discount: 100, category: 'clutch' },
  { name: 'Ring Handle Clutch',            price: 2699, discount: 200, category: 'clutch' },
  { name: 'Mirror Work Clutch',            price: 3899, discount: 400, category: 'clutch' },

  // ── LAPTOP / MESSENGER BAGS (15) ──────────────────────────
  { name: 'Leather Laptop Sleeve',         price: 2999, discount: 300, category: 'laptop' },
  { name: 'Professional Messenger Bag',    price: 3499, discount: 400, category: 'laptop' },
  { name: 'Canvas Laptop Satchel',         price: 2199, discount: 200, category: 'laptop' },
  { name: 'Slim MacBook Case',             price: 1999, discount: 0,   category: 'laptop' },
  { name: 'Padded Tech Briefcase',         price: 4999, discount: 500, category: 'laptop' },
  { name: 'Vintage Leather Messenger',     price: 4599, discount: 400, category: 'laptop' },
  { name: 'Nylon Laptop Tote',             price: 2799, discount: 200, category: 'laptop' },
  { name: 'Crossbody Laptop Bag',          price: 3299, discount: 300, category: 'laptop' },
  { name: 'Expandable Work Bag',           price: 3799, discount: 400, category: 'laptop' },
  { name: 'Ultra-Slim Document Case',      price: 2599, discount: 200, category: 'laptop' },
  { name: 'Rugged Field Messenger',        price: 3999, discount: 300, category: 'laptop' },
  { name: 'Smart Organizer Briefcase',     price: 5499, discount: 600, category: 'laptop' },
  { name: 'Faux Leather Office Bag',       price: 1799, discount: 0,   category: 'laptop' },
  { name: 'Waxed Canvas Work Bag',         price: 3699, discount: 300, category: 'laptop' },
  { name: 'Executive Leather Folio',       price: 6999, discount: 800, category: 'laptop' },

  // ── TRAVEL / DUFFLE BAGS (15) ─────────────────────────────
  { name: 'Leather Weekender Duffle',      price: 5999, discount: 600, category: 'travel' },
  { name: 'Carry-On Travel Bag',           price: 3999, discount: 400, category: 'travel' },
  { name: 'Gym & Sport Duffle',            price: 1999, discount: 200, category: 'travel' },
  { name: 'Canvas Overnight Bag',          price: 2799, discount: 200, category: 'travel' },
  { name: 'Rolling Duffle Bag',            price: 6499, discount: 700, category: 'travel' },
  { name: 'Compact Travel Pouch Set',      price: 1599, discount: 0,   category: 'travel' },
  { name: 'Garment Bag Deluxe',            price: 4799, discount: 500, category: 'travel' },
  { name: 'Waterproof Adventure Duffle',   price: 3499, discount: 300, category: 'travel' },
  { name: 'Foldable Travel Tote',          price: 1299, discount: 100, category: 'travel' },
  { name: 'Luxury Cabin Bag',              price: 7999, discount: 900, category: 'travel' },
  { name: 'Sport Barrel Bag',              price: 2299, discount: 200, category: 'travel' },
  { name: 'Monogrammed Duffle',            price: 5499, discount: 500, category: 'travel' },
  { name: 'Quilted Weekender',             price: 4299, discount: 400, category: 'travel' },
  { name: 'Leather Trim Holdall',          price: 6299, discount: 600, category: 'travel' },
  { name: 'Convertible Duffle-Backpack',   price: 3799, discount: 300, category: 'travel' },
];

// ─── Main Seeder ────────────────────────────────────────────────────
async function seed() {
  try {
    console.log('\n🛍️  ShopSphere - Real Image Seeder');
    console.log('═'.repeat(55));

    // Step 1: Download all unique images first (cache them)
    console.log('\n📸 Step 1: Downloading real bag photos from Unsplash...');
    const imageCache = {};
    let totalImages = 0;

    for (const [category, urls] of Object.entries(imageUrls)) {
      imageCache[category] = [];
      for (let i = 0; i < urls.length; i++) {
        try {
          process.stdout.write(`   📥 Downloading ${category} image ${i + 1}/${urls.length}...`);
          const buffer = await downloadImage(urls[i]);
          imageCache[category].push(buffer);
          totalImages++;
          console.log(` ✅ (${(buffer.length / 1024).toFixed(0)} KB)`);
        } catch (err) {
          console.log(` ⚠️ Failed: ${err.message}`);
        }
        // Small delay to be respectful to the server
        await new Promise(r => setTimeout(r, 300));
      }
    }
    console.log(`\n   ✅ Downloaded ${totalImages} unique bag images\n`);

    // Step 2: Delete old seeded products (keep original 4 manually uploaded)
    console.log('🗑️  Step 2: Clearing old seeded products...');
    const existingProducts = await productModel.find();
    
    // Update the original products' prices
    let origCount = 0;
    const originalNames = ['Clingue Brown', 'Backpack', 'Multi Purpose', 'Pink Special'];
    const originalPrices = [
      { price: 2499, discount: 200 },
      { price: 3299, discount: 300 },
      { price: 1999, discount: 150 },
      { price: 3799, discount: 400 },
    ];

    for (const prod of existingProducts) {
      const origIdx = originalNames.indexOf(prod.name);
      if (origIdx !== -1) {
        await productModel.findByIdAndUpdate(prod._id, originalPrices[origIdx]);
        console.log(`   ✏️  Updated "${prod.name}" → ₹${originalPrices[origIdx].price}`);
        origCount++;
      }
    }

    // Delete all non-original products
    const deleteResult = await productModel.deleteMany({
      name: { $nin: originalNames }
    });
    console.log(`   🗑️  Removed ${deleteResult.deletedCount} old seeded products`);

    // Step 3: Create 100 new products with REAL images
    console.log('\n🆕 Step 3: Creating 100 products with real images...\n');
    let created = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const colors = colorSchemes[i % colorSchemes.length];
      
      // Pick a real image for this category
      const categoryImages = imageCache[product.category] || imageCache.handbag;
      const image = categoryImages[i % categoryImages.length];

      if (!image) {
        console.log(`   ⚠️ Skipping "${product.name}" - no image available`);
        continue;
      }

      await productModel.create({
        image: image,
        name: product.name,
        price: product.price,
        discount: product.discount,
        bgcolor: colors.bgcolor,
        panelcolor: colors.panelcolor,
        textcolor: colors.textcolor,
      });

      created++;
      if (created % 10 === 0) {
        const cats = products.slice(i - 9, i + 1).map(p => p.category);
        const uniqueCats = [...new Set(cats)];
        console.log(`   📦 Progress: ${created}/100 products created [${uniqueCats.join(', ')}]`);
      }
    }

    // Summary
    const total = await productModel.countDocuments();
    console.log('\n' + '═'.repeat(55));
    console.log('🎉 Seeding complete with REAL bag photos!\n');
    console.log(`   📊 Total products in database: ${total}`);
    console.log(`   📸 Real images downloaded: ${totalImages}`);
    console.log(`   🆕 New products created: ${created}`);
    console.log(`   ✏️  Original products updated: ${origCount}`);
    console.log('\n   📋 Categories:');
    console.log('      • Handbags: 20');
    console.log('      • Backpacks: 20');
    console.log('      • Tote Bags: 15');
    console.log('      • Clutches: 15');
    console.log('      • Laptop Bags: 15');
    console.log('      • Travel Bags: 15');
    console.log(`\n   💰 Price range: ₹899 - ₹7,999`);
    console.log('\n   🌐 Restart server and visit http://localhost:3000/shop');
    console.log('═'.repeat(55) + '\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

seed();
