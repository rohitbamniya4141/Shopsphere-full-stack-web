require('dotenv').config();
const https = require('https');
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

function searchPexels(query) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.pexels.com',
            path: `/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
            method: 'GET',
            headers: { 'Authorization': PEXELS_API_KEY }
        };
        https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).end();
    });
}

async function test() {
    const q1 = await searchPexels('bag mockup white background');
    console.log("Q1:", q1.photos[0]?.alt);
    const q2 = await searchPexels('backpack product shot');
    console.log("Q2:", q2.photos[0]?.alt);
    const q3 = await searchPexels('leather briefcase isolated');
    console.log("Q3:", q3.photos[0]?.alt);
    const q4 = await searchPexels('travel bag studio');
    console.log("Q4:", q4.photos[0]?.alt);
}
test();
