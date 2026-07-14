require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
if (!PEXELS_API_KEY) {
    console.error("❌ ERROR: PEXELS_API_KEY not found in .env file.");
    console.error("Please add your Pexels API Key to .env and run this script again.");
    process.exit(1);
}

const filepath = path.join(__dirname, 'products.json');
const OUTPUT_DIR = path.join(__dirname, 'public', 'images', 'products');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Track used image IDs to prevent duplicates
const usedImageIds = new Set();
let products;
try {
    products = JSON.parse(fs.readFileSync(filepath, 'utf8'));
} catch (e) {
    console.error("Failed to read products.json", e);
    process.exit(1);
}

function getQueriesForCategory(category) {
    const cat = category.toLowerCase();
    
    // User's exact requested queries
    if (cat.includes('handbag')) return ['premium leather handbag isolated', 'leather handbag white background'];
    if (cat.includes('laptop')) return ['business laptop briefcase isolated', 'men laptop bag white background'];
    if (cat.includes('backpack')) return ['modern backpack isolated', 'backpack white background'];
    if (cat.includes('travel') || cat.includes('duffel') || cat.includes('cabin') || cat.includes('weekender')) return ['travel duffel bag isolated', 'duffel bag white background'];
    if (cat.includes('wallet')) return ['leather wallet isolated', 'premium wallet white background'];
    if (cat.includes('messenger')) return ['messenger bag isolated', 'messenger bag white background'];
    if (cat.includes('sling')) return ['sling bag isolated', 'sling bag white background'];
    if (cat.includes('tote')) return ['tote bag isolated', 'tote bag white background'];
    if (cat.includes('crossbody')) return ['crossbody bag isolated', 'crossbody bag white background'];
    if (cat.includes('briefcase')) return ['leather briefcase isolated', 'business briefcase white background'];
    
    return ['bag isolated', 'bag product photography isolated'];
}

// Helper to make API request
function searchPexels(query) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.pexels.com',
            path: `/v1/search?query=${encodeURIComponent(query)}&per_page=30`,
            method: 'GET',
            headers: {
                'Authorization': PEXELS_API_KEY
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Pexels API Error ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Helper to download the actual image
function downloadImage(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                fs.unlinkSync(destPath);
                return reject(new Error(`Failed to download image, status code: ${response.statusCode}`));
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlinkSync(destPath);
            reject(err);
        });
    });
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log(`Starting Pexels Download for ${products.length} products...`);
    
    let downloaded = 0;
    let skipped = 0;
    let failed = 0;

    for (const product of products) {
        const destPath = path.join(OUTPUT_DIR, `product${product.id}.jpg`);
        
        if (fs.existsSync(destPath) && fs.statSync(destPath).size > 10000) {
            console.log(`  ⏩ [${String(product.id).padStart(3, '0')}] ${product.name.padEnd(40)} | Skipped (already exists)`);
            skipped++;
            continue;
        }

        const queries = getQueriesForCategory(product.category);
        let imageFound = false;

        for (const query of queries) {
            if (imageFound) break;

            try {
                const response = await searchPexels(query);
                if (response.photos && response.photos.length > 0) {
                    
                    // Find a photo we haven't used yet AND that doesn't have people in it
                    const forbiddenWords = ['person', 'people', 'man', 'woman', 'men', 'women', 'girl', 'boy', 'holding', 'standing', 'wearing', 'carrying'];
                    
                    const photo = response.photos.find(p => {
                        if (usedImageIds.has(p.id)) return false;
                        
                        const altText = (p.alt || '').toLowerCase();
                        // Reject if the alt text contains any forbidden words
                        if (forbiddenWords.some(word => altText.includes(word))) return false;
                        
                        return true;
                    });
                    
                    if (photo) {
                        usedImageIds.add(photo.id);
                        // Prefer original size, fallback to large2x or large
                        const imgUrl = photo.src.large || photo.src.large2x || photo.src.medium || photo.src.original;
                        
                        await downloadImage(imgUrl, destPath);
                        console.log(`  ✅ [${String(product.id).padStart(3, '0')}] ${product.name.padEnd(40)} | Downloaded via "${query}"`);
                        imageFound = true;
                        downloaded++;
                        
                        // Respect API rate limits
                        await delay(1000); 
                    }
                }
            } catch (err) {
                console.log(`     ⚠️  Query "${query}" failed: ${err.message}`);
            }
        }

        if (!imageFound) {
            console.log(`  ❌ [${String(product.id).padStart(3, '0')}] ${product.name.padEnd(40)} | FAILED (No unique images found)`);
            failed++;
        }
    }

    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║            FINAL REPORT               ║');
    console.log('╠═══════════════════════════════════════╣');
    console.log(`║  ✅ Downloaded : ${String(downloaded).padEnd(20)} ║`);
    console.log(`║  ⏩ Skipped    : ${String(skipped).padEnd(20)} ║`);
    console.log(`║  ❌ Failed     : ${String(failed).padEnd(20)} ║`);
    console.log('╚═══════════════════════════════════════╝\n');
}

main().catch(err => {
    console.error("Fatal Error:", err);
});
