require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const TARGET_DIR = path.join(__dirname, 'public', 'images', 'products');

function fetchPexels(query, perPage = 80) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.pexels.com',
            path: `/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=square`,
            method: 'GET',
            headers: {
                'Authorization': PEXELS_API_KEY
            }
        };
        const req = https.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, res => {
            if (res.statusCode === 200) {
                const stream = fs.createWriteStream(filepath);
                res.pipe(stream);
                stream.on('finish', () => {
                    stream.close();
                    resolve();
                });
            } else {
                reject(new Error(`Status Code: ${res.statusCode}`));
            }
        });
        req.on('error', reject);
    });
}

async function downloadCategory(queries, count, prefix) {
    console.log(`\n🔍 Searching Pexels for ${prefix}...`);
    let photos = [];
    
    for (const q of queries) {
        const response = await fetchPexels(q, 80);
        if (response.photos) {
            photos = photos.concat(response.photos);
        }
    }
    
    // Filter out people strictly
    const forbiddenWords = ['person', 'people', 'man', 'woman', 'girl', 'boy', 'holding', 'wearing', 'carrying', 'standing', 'walking', 'model'];
    
    const validPhotos = photos.filter(p => {
        if (!p.alt) return true;
        const altLower = p.alt.toLowerCase();
        return !forbiddenWords.some(word => altLower.includes(word));
    });

    console.log(`✅ Found ${validPhotos.length} valid isolated product shots for ${prefix}.`);
    
    let successCount = 0;
    for (let i = 0; i < count; i++) {
        if (validPhotos[i]) {
            const url = validPhotos[i].src.large2x || validPhotos[i].src.large;
            const dest = path.join(TARGET_DIR, `${prefix}${i + 1}.jpg`);
            await downloadImage(url, dest);
            console.log(`📸 Downloaded ${prefix}${i + 1}.jpg`);
            successCount++;
        }
    }
    return successCount;
}

async function main() {
    await downloadCategory(['briefcase', 'office bag leather', 'messenger bag'], 10, 'office-bag');
    await downloadCategory(['tote bag', 'sling bag', 'shoulder bag'], 10, 'sling-bag');
    console.log('\n🎉 Done downloading all remaining bags!');
}

main().catch(console.error);
