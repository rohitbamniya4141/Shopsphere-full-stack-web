/**
 * download-images.js — ShopSphere AI Product Image Generator
 *
 * Uses Pollinations.ai (free, no API key needed) to generate
 * studio-quality product photos for each of the 120 ShopSphere products.
 *
 * Usage:
 *   node download-images.js
 *
 * Output:
 *   public/images/products/product1.jpg ... product120.jpg
 */

const https  = require('https');
const http   = require('http');
const fs     = require('fs');
const path   = require('path');

const products  = require('./products.json');
const OUTPUT_DIR = path.join(__dirname, 'public', 'images', 'products');
const DELAY_MS   = 1500; // delay between requests to avoid rate limiting

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function downloadFile(urlStr, destPath, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        if (maxRedirects <= 0) return reject(new Error('Too many redirects'));

        const protocol = urlStr.startsWith('https') ? https : http;

        protocol.get(urlStr, { timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
            if ([301, 302, 307].includes(res.statusCode)) {
                const location = res.headers.location;
                if (!location) return reject(new Error('Redirect with no Location'));
                const next = new URL(location, urlStr).href;
                return resolve(downloadFile(next, destPath, maxRedirects - 1));
            }

            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode}`));
            }

            const file = fs.createWriteStream(destPath);
            res.pipe(file);
            file.on('finish', () => {
                file.close(() => {
                    const size = fs.statSync(destPath).size;
                    resolve(size);
                });
            });
            file.on('error', err => {
                fs.unlink(destPath, () => {});
                reject(err);
            });
        })
        .on('error', reject)
        .on('timeout', () => reject(new Error('Request timed out')));
    });
}

function buildImageUrl(product) {
    const prompt = `Isolated product photography of ONE single bag: ${product.name}, ${product.category}. STRICTLY bag only. NO clothes, NO mannequins, NO people, NO body parts. Pure white studio background, high quality, 8k resolution.`;
    const seed = product.id + 2000; 
    const encoded = encodeURIComponent(prompt);
    return `https://image.pollinations.ai/prompt/${encoded}?width=600&height=600&nologo=true&seed=${seed}`;
}

async function downloadProduct(product, destPath) {
    let retries = 0;
    const url = buildImageUrl(product);
    
    while (retries < 3) {
        try {
            const bytes = await downloadFile(url, destPath);
            if (bytes < 5000) throw new Error(`Too small (${bytes} bytes)`);
            return { success: true, product, bytes };
        } catch (err) {
            retries++;
            if (retries === 3) return { success: false, product, error: err };
            await delay(1000);
        }
    }
}

async function main() {
    console.log('Starting Sequential AI Image Downloads (to avoid rate limits)...');
    let success = 0, skipped = 0, failed = 0;
    
    for (const product of products) {
        const destPath = path.join(OUTPUT_DIR, `product${product.id}.jpg`);
        if (fs.existsSync(destPath) && fs.statSync(destPath).size > 10000) {
            console.log(`  ⏩ [${String(product.id).padStart(3,'0')}] ${product.name.padEnd(42)} skipped`);
            skipped++;
            continue;
        }

        process.stdout.write(`  ⬇  [${String(product.id).padStart(3,'0')}] ${product.name.padEnd(42)} `);
        
        let retries = 0;
        let downloaded = false;
        
        while (!downloaded && retries < 3) {
            try {
                const url = buildImageUrl(product);
                const bytes = await downloadFile(url, destPath);
                if (bytes < 5000) throw new Error(`Too small (${bytes} bytes)`);
                
                process.stdout.write(`✅  ${(bytes / 1024).toFixed(0)} KB\n`);
                success++;
                downloaded = true;
                
                // Sleep for 4 seconds to avoid HTTP 429
                await delay(4000);
            } catch (err) {
                retries++;
                if (retries < 3) {
                    process.stdout.write(`⚠️  Retrying (${retries}/3)...\n`);
                    process.stdout.write(`  ⬇  [${String(product.id).padStart(3,'0')}] ${product.name.padEnd(42)} `);
                    await delay(5000);
                } else {
                    process.stdout.write(`❌  Failed: ${err.message}\n`);
                    failed++;
                    if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
                }
            }
        }
    }

    console.log(`\nDONE. ✅ ${success}  ⏩ ${skipped}  ❌ ${failed}`);
    if (failed === 0) console.log('All images ready. Run seed.js next.');
}

main().catch(err => {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
});
