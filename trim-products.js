const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'products.json');
const products = JSON.parse(fs.readFileSync(filepath, 'utf8'));

// We have 160 products right now. 4 categories of 40 each.
// We need exactly 80 products (20 from each category).
// The categories were added in order: 40 Fashion, 40 Boys, 40 Girls, 40 Seniors

const fashion = products.slice(0, 20);
const boys = products.slice(40, 60);
const girls = products.slice(80, 100);
const seniors = products.slice(120, 140);

const trimmedProducts = [...fashion, ...boys, ...girls, ...seniors];

// Re-assign IDs 1 to 80 to maintain sequence
trimmedProducts.forEach((p, index) => {
    p.id = index + 1;
});

fs.writeFileSync(filepath, JSON.stringify(trimmedProducts, null, 2));
console.log(`Trimmed products.json down to ${trimmedProducts.length} products (20 from each demographic) and re-sequenced IDs.`);
