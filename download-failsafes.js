require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const OUTPUT_DIR = path.join(__dirname, 'public', 'images', 'products');

function searchPexels(query) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.pexels.com',
            path: `/v1/search?query=${encodeURIComponent(query)}&per_page=15`,
            method: 'GET',
            headers: { 'Authorization': PEXELS_API_KEY }
        };
        https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject).end();
    });
}

function downloadImage(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                fs.unlinkSync(destPath);
                return reject(new Error(`Failed to download: ${response.statusCode}`));
            }
            response.pipe(file);
            file.on('finish', () => file.close(resolve));
        }).on('error', (err) => {
            fs.unlinkSync(destPath);
            reject(err);
        });
    });
}

async function getIsolatedImage(query, destPath) {
    try {
        const res = await searchPexels(query);
        const forbiddenWords = ['person', 'people', 'man', 'woman', 'men', 'women', 'girl', 'boy', 'holding', 'standing', 'wearing', 'carrying'];
        const photo = res.photos.find(p => {
            const alt = (p.alt || '').toLowerCase();
            return !forbiddenWords.some(w => alt.includes(w));
        });
        if (photo) {
            const url = photo.src.large2x || photo.src.large || photo.src.original;
            await downloadImage(url, destPath);
            console.log(`Successfully downloaded for ${destPath}`);
            return true;
        }
    } catch (e) {
        console.error(e);
    }
    return false;
}

async function run() {
    await getIsolatedImage('green hiking backpack isolated', path.join(OUTPUT_DIR, 'backpack18.jpg'));
    await getIsolatedImage('black laptop backpack isolated', path.join(OUTPUT_DIR, 'backpack19.jpg'));
    await getIsolatedImage('black travel backpack isolated', path.join(OUTPUT_DIR, 'backpack20.jpg'));
}

run();
