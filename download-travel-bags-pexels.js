require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const TARGET_DIR = path.join(__dirname, 'public', 'images', 'products');

if (!PEXELS_API_KEY) {
    console.error('❌ Missing PEXELS_API_KEY in .env');
    process.exit(1);
}

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

async function main() {
    console.log('🔍 Searching Pexels for Travel Bags...');
    
    // We try to find images without people
    const queries = ['duffel bag', 'luggage', 'travel bag'];
    let photos = [];
    
    for (const q of queries) {
        const response = await fetchPexels(q, 80);
        if (response.photos) {
            photos = photos.concat(response.photos);
        }
    }
    
    // Filter out people
    const forbiddenWords = ['person', 'people', 'man', 'woman', 'girl', 'boy', 'holding', 'wearing', 'carrying', 'standing', 'walking', 'model'];
    
    const validPhotos = photos.filter(p => {
        if (!p.alt) return true;
        const altLower = p.alt.toLowerCase();
        return !forbiddenWords.some(word => altLower.includes(word));
    });

    console.log(`✅ Found ${validPhotos.length} valid isolated product shots.`);
    
    const count = 15;
    for (let i = 0; i < count; i++) {
        if (validPhotos[i]) {
            const url = validPhotos[i].src.large2x || validPhotos[i].src.large;
            const dest = path.join(TARGET_DIR, `travel-bag${i + 1}.jpg`);
            await downloadImage(url, dest);
            console.log(`📸 Downloaded travel-bag${i + 1}.jpg`);
        } else {
            console.log(`⚠️ Not enough unique photos for travel-bag${i + 1}.jpg`);
        }
    }
    console.log('🎉 Done downloading all travel bags!');
}

main().catch(console.error);
