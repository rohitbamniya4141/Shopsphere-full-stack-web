const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');
const products = require('./products.json');

const OUTPUT_DIR = path.join(__dirname, 'public', 'images', 'products');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function downloadFile(urlStr, destPath, maxRedirects = 5) {
    return new Promise(function(resolve, reject) {
        if (maxRedirects <= 0) return reject(new Error('Too many redirects'));

        const protocol = urlStr.startsWith('https') ? https : http;

        protocol.get(urlStr, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } }, function(res) {
            if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
                const location = res.headers.location;
                if (!location) return reject(new Error('Redirect with no location header'));
                const nextUrl = new URL(location, urlStr).href;
                return resolve(downloadFile(nextUrl, destPath, maxRedirects - 1));
            }

            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode} for ${urlStr}`));
            }

            const file = fs.createWriteStream(destPath);
            res.pipe(file);

            file.on('finish', function() {
                file.close(function() {
                    const stats = fs.statSync(destPath);
                    resolve(stats.size);
                });
            });

            file.on('error', function(err) {
                fs.unlink(destPath, function() {});
                reject(err);
            });
        }).on('error', reject).on('timeout', () => reject(new Error('Request timed out')));
    });
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log('Generating 120 Unique Bag Images via LoremFlickr...');
    let succeeded = 0;
    
    // We will download sequentially to avoid rate limiting, but it is fast.
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const destPath = path.join(OUTPUT_DIR, `product${product.id}.jpg`);
        
        // Use a simple, broad category name to ensure LoremFlickr has enough variety
        // e.g. "Handbags" -> "handbag", "Tote Bags" -> "tote"
        let keyword = product.category.toLowerCase().replace(' bags', '').replace('s', '');
        
        // Provide lock to get a unique image per product
        const url = `https://loremflickr.com/600/600/${keyword},bag/all?lock=${product.id}`;
        
        process.stdout.write(`  ⬇   [${String(product.id).padStart(3, '0')}] ${product.name.padEnd(40)} `);
        
        try {
            const bytes = await downloadFile(url, destPath);
            if (bytes < 5000) throw new Error('Too small');
            process.stdout.write(`✅  ${(bytes / 1024).toFixed(0)} KB\n`);
            succeeded++;
            await delay(500); // 0.5s delay to be polite to the API
        } catch (err) {
            process.stdout.write(`❌  Failed: ${err.message}\n`);
            // Cleanup on failure
            if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        }
    }
    
    console.log(`\nSuccessfully downloaded ${succeeded}/120 unique images.`);
    console.log('Run `node seed.js` now.');
}

main();
