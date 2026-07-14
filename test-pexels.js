require('dotenv').config();
const https = require('https');
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

function searchPexels(query) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.pexels.com',
            path: `/v1/search?query=${encodeURIComponent(query)}&per_page=1&color=white`,
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

searchPexels('business laptop bag').then(res => {
    console.log(res);
});
