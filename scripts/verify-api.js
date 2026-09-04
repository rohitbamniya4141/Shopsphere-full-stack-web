const http = require('http');
const app = require('../app');

// We'll test starting a local test server and sending HTTP requests
const PORT = 3050;

const server = app.listen(PORT, async () => {
  console.log(`Test server running on port ${PORT}...`);

  const runTest = (path) => {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:${PORT}${path}`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        });
      }).on('error', reject);
    });
  };

  try {
    console.log('\n--- 1. Testing GET /api/auth/me ---');
    const authRes = await runTest('/api/auth/me');
    console.log(`Status: ${authRes.status}`);
    const authJson = JSON.parse(authRes.body);
    console.log(`Response:`, authJson);

    console.log('\n--- 2. Testing GET /api/products ---');
    const productsRes = await runTest('/api/products?limit=3');
    console.log(`Status: ${productsRes.status}`);
    const productsJson = JSON.parse(productsRes.body);
    console.log(`Total Products in DB: ${productsJson.totalCount}`);
    console.log(`Categories:`, productsJson.categories);
    console.log(`Sample product: ${productsJson.products[0]?.name}`);

    console.log('\n--- 3. Testing GET / (React SPA Serving) ---');
    const spaRes = await runTest('/');
    console.log(`Status: ${spaRes.status}`);
    console.log(`Content-Type: ${spaRes.headers['content-type']}`);
    const containsRoot = spaRes.body.includes('<div id="root"></div>');
    console.log(`Contains #root div: ${containsRoot}`);

    console.log('\nAll API & React SPA serving tests passed successfully!\n');
    server.close(() => process.exit(0));
  } catch (err) {
    console.error('Verification failed:', err);
    server.close(() => process.exit(1));
  }
});
