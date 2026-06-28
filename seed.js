/**
 * ShopSphere - Product Seeder Script
 * 
 * Run: node seed.js
 * 
 * This script:
 * 1. Updates prices of already-listed products to realistic values
 * 2. Seeds 100 new bag products with varied categories, realistic pricing, and images
 */

require('dotenv').config();
const mongoose = require('mongoose');
const https = require('https');
const http = require('http');
const config = require('config');
const productModel = require('./models/product-model');

// ─── Connect to MongoDB ─────────────────────────────────────────────
mongoose.connect(`${config.get('MONGODB_URI')}/shopSphere`)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => { console.error('❌ MongoDB connection error:', err); process.exit(1); });

// ─── Download an image as Buffer ────────────────────────────────────
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const handler = (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location;
        const protocol = redirectUrl.startsWith('https') ? https : http;
        protocol.get(redirectUrl, handler).on('error', reject);
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    };
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, handler).on('error', reject);
  });
}

// ─── Product Data ───────────────────────────────────────────────────

const colorSchemes = [
  { bgcolor: '#f5f0eb', panelcolor: '#1a1a2e', textcolor: '#ffffff' },    // Cream / Navy
  { bgcolor: '#e8d5c4', panelcolor: '#2d2d2d', textcolor: '#ffffff' },    // Tan / Charcoal
  { bgcolor: '#d4c5b2', panelcolor: '#3d2b1f', textcolor: '#f5f0eb' },    // Sand / Espresso
  { bgcolor: '#f0e6d3', panelcolor: '#1b4332', textcolor: '#ffffff' },    // Beige / Forest
  { bgcolor: '#e6d5c3', panelcolor: '#4a1942', textcolor: '#ffffff' },    // Warm / Plum
  { bgcolor: '#dce8e0', panelcolor: '#1a1a2e', textcolor: '#ffffff' },    // Sage / Navy
  { bgcolor: '#f5e6d0', panelcolor: '#6b3a2a', textcolor: '#ffffff' },    // Gold / Sienna
  { bgcolor: '#e8e0d8', panelcolor: '#2f4f4f', textcolor: '#ffffff' },    // Stone / Teal
  { bgcolor: '#f0ece4', panelcolor: '#191970', textcolor: '#ffffff' },    // Pearl / Midnight
  { bgcolor: '#d8cfc4', panelcolor: '#6b2737', textcolor: '#ffffff' },    // Taupe / Burgundy
  { bgcolor: '#e4ddd5', panelcolor: '#2c3e50', textcolor: '#ffffff' },    // Linen / Slate
  { bgcolor: '#f2ebe3', panelcolor: '#34495e', textcolor: '#ecf0f1' },    // Ivory / Blue-Grey
  { bgcolor: '#ede4db', panelcolor: '#1c1c1c', textcolor: '#d4a574' },    // Almond / Black-Gold
  { bgcolor: '#dfd8cf', panelcolor: '#4a3728', textcolor: '#f0e6d3' },    // Ash / Walnut
  { bgcolor: '#e9e1d9', panelcolor: '#2c1810', textcolor: '#ffffff' },    // Cream / Mahogany
  { bgcolor: '#cfd5d0', panelcolor: '#1a1a2e', textcolor: '#e0c097' },    // Mint / Navy-Gold
  { bgcolor: '#f7f0e8', panelcolor: '#5c3d2e', textcolor: '#ffffff' },    // Snow / Cocoa
  { bgcolor: '#e0d8d0', panelcolor: '#3b0d11', textcolor: '#f5e6d0' },    // Pebble / Maroon
  { bgcolor: '#d9d0c7', panelcolor: '#0d1b2a', textcolor: '#ffffff' },    // Dune / Dark Navy
  { bgcolor: '#f5ede5', panelcolor: '#3e2723', textcolor: '#ffccbc' },    // Blush / Chocolate
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

// ─── SVG Image Generator ────────────────────────────────────────────
// Creates clean, professional product placeholder images as SVG → Buffer

const categoryIcons = {
  handbag:  `<path d="M60,45 Q60,30 75,25 L125,25 Q140,30 140,45 L140,80 Q140,90 130,90 L70,90 Q60,90 60,80 Z" fill="ACCENT" opacity="0.9"/><path d="M85,25 Q85,15 100,12 Q115,15 115,25" fill="none" stroke="ACCENT" stroke-width="3" stroke-linecap="round"/>`,
  backpack: `<rect x="65" y="35" width="70" height="60" rx="8" fill="ACCENT" opacity="0.9"/><path d="M80,35 Q80,22 100,18 Q120,22 120,35" fill="none" stroke="ACCENT" stroke-width="3.5" stroke-linecap="round"/><rect x="82" y="50" width="36" height="20" rx="4" fill="BG" opacity="0.3"/>`,
  tote:     `<path d="M55,40 L65,95 L135,95 L145,40 Z" fill="ACCENT" opacity="0.9"/><path d="M75,40 Q75,20 100,16 Q125,20 125,40" fill="none" stroke="ACCENT" stroke-width="3" stroke-linecap="round"/>`,
  clutch:   `<rect x="55" y="45" width="90" height="45" rx="6" fill="ACCENT" opacity="0.9"/><line x1="55" y1="58" x2="145" y2="58" stroke="BG" stroke-width="1.5" opacity="0.3"/><circle cx="135" cy="67" r="5" fill="BG" opacity="0.25"/>`,
  laptop:   `<rect x="55" y="38" width="90" height="60" rx="5" fill="ACCENT" opacity="0.9"/><path d="M55,55 L145,55" stroke="BG" stroke-width="1.5" opacity="0.2"/><rect x="90" y="42" width="20" height="8" rx="2" fill="BG" opacity="0.2"/>`,
  travel:   `<ellipse cx="100" cy="65" rx="50" ry="30" fill="ACCENT" opacity="0.9"/><path d="M80,35 Q80,25 100,22 Q120,25 120,35" fill="none" stroke="ACCENT" stroke-width="3.5" stroke-linecap="round"/><line x1="75" y1="65" x2="125" y2="65" stroke="BG" stroke-width="1.5" opacity="0.2"/>`,
};

const categoryLabels = {
  handbag: 'HANDBAG',
  backpack: 'BACKPACK',
  tote: 'TOTE BAG',
  clutch: 'CLUTCH',
  laptop: 'LAPTOP BAG',
  travel: 'TRAVEL BAG',
};

function generateProductSVG(productName, category, bgColor, accentColor) {
  const icon = (categoryIcons[category] || categoryIcons.handbag)
    .replace(/ACCENT/g, accentColor)
    .replace(/BG/g, bgColor);

  const label = categoryLabels[category] || 'BAG';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 200 250">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${darkenColor(bgColor, 15)};stop-opacity:1" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.15"/>
      </filter>
    </defs>
    <rect width="200" height="250" fill="url(#bg)"/>
    <g filter="url(#shadow)">
      ${icon}
    </g>
    <text x="100" y="130" text-anchor="middle" font-family="Arial,sans-serif" font-size="7" font-weight="600" letter-spacing="2" fill="${accentColor}" opacity="0.4">${label}</text>
  </svg>`;

  return Buffer.from(svg);
}

function darkenColor(hex, percent) {
  hex = hex.replace('#', '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  r = Math.max(0, Math.floor(r * (1 - percent / 100)));
  g = Math.max(0, Math.floor(g * (1 - percent / 100)));
  b = Math.max(0, Math.floor(b * (1 - percent / 100)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Accent colors that look great on each bgcolor
const accentColors = [
  '#8b6914', '#5c4033', '#3d2b1f', '#2d5a27', '#6b2fa0',
  '#1a5276', '#a0522d', '#2f4f4f', '#1a237e', '#8b2252',
  '#34495e', '#2c3e50', '#1a1a2e', '#5d4037', '#3e2723',
  '#1b5e20', '#4e342e', '#880e4f', '#0d47a1', '#bf360c',
];

// ─── Main Seeder ────────────────────────────────────────────────────
async function seed() {
  try {
    console.log('\n🛍️  ShopSphere Product Seeder');
    console.log('═'.repeat(50));

    // Step 1: Update existing products' prices
    console.log('\n📦 Step 1: Updating existing products...');
    const existingProducts = await productModel.find();
    
    if (existingProducts.length > 0) {
      const realisticPrices = [1999, 2499, 2999, 3499, 3999, 4499, 4999, 5499, 5999, 6499];
      const realisticDiscounts = [0, 100, 200, 300, 400, 500];
      
      for (let i = 0; i < existingProducts.length; i++) {
        const product = existingProducts[i];
        const newPrice = realisticPrices[i % realisticPrices.length];
        const newDiscount = realisticDiscounts[i % realisticDiscounts.length];
        
        await productModel.findByIdAndUpdate(product._id, {
          price: newPrice,
          discount: newDiscount
        });
        console.log(`   ✏️  Updated "${product.name}" → ₹${newPrice} (discount: ₹${newDiscount})`);
      }
      console.log(`   ✅ Updated ${existingProducts.length} existing product(s)`);
    } else {
      console.log('   ℹ️  No existing products found');
    }

    // Step 2: Create 100 new products
    console.log('\n🆕 Step 2: Creating 100 new bag products...');
    console.log('   Generating product images...\n');

    let created = 0;
    const batchSize = 10;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const batchPromises = batch.map((product, j) => {
        const idx = i + j;
        const colors = colorSchemes[idx % colorSchemes.length];
        const accent = accentColors[idx % accentColors.length];

        // Generate SVG image for this product
        const imageBuffer = generateProductSVG(
          product.name,
          product.category,
          colors.bgcolor,
          accent
        );

        return productModel.create({
          image: imageBuffer,
          name: product.name,
          price: product.price,
          discount: product.discount,
          bgcolor: colors.bgcolor,
          panelcolor: colors.panelcolor,
          textcolor: colors.textcolor,
        });
      });

      const results = await Promise.all(batchPromises);
      created += results.length;

      const categories = batch.map(p => p.category);
      const uniqueCats = [...new Set(categories)];
      console.log(`   📦 Batch ${Math.floor(i / batchSize) + 1}/10: Created ${results.length} products [${uniqueCats.join(', ')}]`);
    }

    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log('🎉 Seeding complete!\n');
    
    const totalProducts = await productModel.countDocuments();
    console.log(`   📊 Total products in database: ${totalProducts}`);
    console.log(`   🆕 New products created: ${created}`);
    console.log(`   ✏️  Existing products updated: ${existingProducts.length}`);
    
    // Category breakdown
    console.log('\n   📋 Category breakdown (new products):');
    const categoryCounts = {};
    products.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      const label = categoryLabels[cat] || cat;
      console.log(`      • ${label}: ${count} products`);
    });

    // Price range
    const allPrices = products.map(p => p.price);
    console.log(`\n   💰 Price range: ₹${Math.min(...allPrices)} - ₹${Math.max(...allPrices)}`);
    
    console.log('\n   🌐 Visit http://localhost:3000/shop to see your products!');
    console.log('═'.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seeder
seed();
