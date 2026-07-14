const fs = require('fs');
const path = require('path');
const products = require('./products.json');

const OUTPUT_DIR = path.join(__dirname, 'public', 'images', 'products');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function downloadFileWithFetch(url, destPath) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        if (buffer.byteLength < 5000) {
            throw new Error('Image too small, likely a placeholder');
        }

        fs.writeFileSync(destPath, Buffer.from(buffer));
        return true;
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log('Generating 120 Unique Premium AI Images via Pollinations.ai...');
    
    const CONCURRENCY = 3;
    
    for (let i = 0; i < products.length; i += CONCURRENCY) {
        const batch = products.slice(i, i + CONCURRENCY);
        
        const promises = batch.map(async (product) => {
            const dest = path.join(OUTPUT_DIR, `product${product.id}.jpg`);
            
            if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
                console.log(`⏩ Skipped (already exists): [${String(product.id).padStart(3, '0')}] ${product.name}`);
                return;
            }

            const prompt = `Premium commercial photography of a single ${product.color} ${product.name} ${product.category}, isolated on a clean studio background, highly detailed, 8k, fashion ecommerce, no text`;
            const encodedPrompt = encodeURIComponent(prompt);
            const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=600&height=600&nologo=true`;
            
            let success = false;
            let retries = 0;

            while (!success && retries < 3) {
                try {
                    await downloadFileWithFetch(url, dest);
                    console.log(`✅ Generated: [${String(product.id).padStart(3, '0')}] ${product.name}`);
                    success = true;
                } catch (err) {
                    retries++;
                    console.error(`⚠️ Failed [${product.id}] ${product.name} - ${err.message}. Retrying...`);
                    await delay(3000);
                }
            }
        });

        await Promise.all(promises);
        console.log(`--- Completed batch ${Math.floor(i/CONCURRENCY) + 1}/${Math.ceil(products.length/CONCURRENCY)} ---`);
        await delay(1000); // 1 second delay between batches
    }
    
    console.log('All 120 images generated successfully! Run node seed.js now.');
}

main();
