const fs = require('fs');
const https = require('https');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'public', 'images', 'products');

// Ensure directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 12 Curated Premium Bag Photos from Unsplash
const premiumPhotos = [
    "photo-1584916201218-f4242ceb4809", // Handbag
    "photo-1591561954557-26941169b49e", // Elegant Bag
    "photo-1548036328-c9fa89d128fa", // Tote
    "photo-1566150905458-1bf1fc113f0d", // White Handbag
    "photo-1590874103328-eac38a683ce7", // Brown Handbag
    "photo-1598532163257-ae3c6b2524b6", // Canvas Tote
    "photo-1628149462153-066cb0cb6e72", // Backpack
    "photo-1553062407-98eeb64c6a62", // Minimalist Backpack
    "photo-1622560480654-d96214fdc887", // Wallet
    "photo-1521579626354-9ee7ebcb1c26", // Casual Bag
    "photo-1575037614876-c38e4d28eff6", // Satchel
    "photo-1590739225287-bd31519780c5"  // Leather Bag
];

async function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
                return resolve(downloadFile(res.headers.location, destPath));
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            const file = fs.createWriteStream(destPath);
            res.pipe(file);
            file.on('finish', () => resolve());
            file.on('error', reject);
        }).on('error', reject);
    });
}

async function main() {
    console.log('Downloading 12 Premium Base Images...');
    for (let i = 0; i < premiumPhotos.length; i++) {
        const id = premiumPhotos[i];
        const dest = path.join(OUTPUT_DIR, `premium${i + 1}.jpg`);
        const url = `https://images.unsplash.com/${id}?w=600&h=600&fit=crop`;
        try {
            await downloadFile(url, dest);
            console.log(`✅ Downloaded premium${i + 1}.jpg`);
        } catch (err) {
            console.error(`❌ Failed premium${i + 1}.jpg:`, err.message);
        }
    }
    console.log('Done! Now run seed.js');
}

main();
