const fs = require('fs');
const path = require('path');

// --- Office Bags (10) ---
const officeProducts = [
    { sku: 'OB001', name: 'Executive Briefcase', demographic: 'Office Professionals', price: 2499 },
    { sku: 'OB002', name: 'Metro Office Tote', demographic: 'Business Women', price: 2199 },
    { sku: 'OB003', name: 'Signature Leather Brief', demographic: 'Executives', price: 3499 },
    { sku: 'OB004', name: 'Urban Professional Bag', demographic: 'Office Professionals', price: 1999 },
    { sku: 'OB005', name: 'Corporate Messenger', demographic: 'Business Travelers', price: 2799 },
    { sku: 'OB006', name: 'Minimalist Work Bag', demographic: 'Minimalists', price: 1899 },
    { sku: 'OB007', name: 'Elite Business Briefcase', demographic: 'Executives', price: 3999 },
    { sku: 'OB008', name: 'Tech Commuter Bag', demographic: 'Tech Professionals', price: 2599 },
    { sku: 'OB009', name: 'Classic Leather Messenger', demographic: 'Office Professionals', price: 3199 },
    { sku: 'OB010', name: 'Aero Office Briefcase', demographic: 'Frequent Travelers', price: 2899 }
];

// --- Tote & Sling Bags (10) ---
const slingProducts = [
    { sku: 'TS001', name: 'Everyday Canvas Tote', demographic: 'College Students', price: 999 },
    { sku: 'TS002', name: 'Urban Crossbody Sling', demographic: 'Daily Commuters', price: 1299 },
    { sku: 'TS003', name: 'Premium Leather Tote', demographic: 'Working Women', price: 2499 },
    { sku: 'TS004', name: 'Active Wear Sling Bag', demographic: 'Gym Users', price: 1199 },
    { sku: 'TS005', name: 'Classic Shopper Tote', demographic: 'Daily Users', price: 1499 },
    { sku: 'TS006', name: 'Tech Messenger Sling', demographic: 'Tech Professionals', price: 1799 },
    { sku: 'TS007', name: 'Minimalist City Tote', demographic: 'Minimalists', price: 1399 },
    { sku: 'TS008', name: 'Adventure Crossbody', demographic: 'Travelers', price: 1599 },
    { sku: 'TS009', name: 'Designer Evening Sling', demographic: 'Fashion Users', price: 2199 },
    { sku: 'TS010', name: 'Eco-Friendly Jute Tote', demographic: 'Environment Conscious', price: 899 }
];

function getRandomItems(arr, count) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generate(products, category, prefix, allFeatures, capacities, materials, colors, bestForOptions) {
    return products.map((p, index) => {
        const discount = Math.floor(Math.random() * 5 + 1) * 100;
        const rating = (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1);
        const reviews = Math.floor(Math.random() * 500) + 50;
        const stock = Math.floor(Math.random() * 40) + 5;
        
        const numFeatures = Math.floor(Math.random() * 3) + 2;
        const features = getRandomItems(allFeatures, numFeatures);

        const specifications = {
            capacity: getRandomItem(capacities),
            waterResistant: features.includes('Water Resistant'),
            usbCharging: features.includes('USB Charging'),
            antiTheft: features.includes('Anti Theft Pocket'),
            weight: getRandomItem(['450g', '600g', '850g', '1.1kg']),
            material: getRandomItem(materials)
        };

        return {
            name: p.name,
            price: p.price,
            discount: discount,
            category: category,
            demographic: p.demographic,
            description: `A premium ${p.demographic.toLowerCase()} bag designed for ultimate convenience. Features include ${features.slice(0, 3).join(', ')}.`,
            rating: Number(rating),
            reviews: reviews,
            stock: stock,
            bestFor: getRandomItem(bestForOptions),
            color: getRandomItem(colors),
            image: `/images/products/${prefix}${index + 1}.jpg`,
            bgcolor: '#F3F4F6',
            panelcolor: '#FFFFFF',
            textcolor: '#111827',
            specifications: specifications
        };
    });
}

const officeFeatures = ['Water Resistant', 'Laptop Compartment', 'USB Charging', 'Anti Theft Pocket', 'Luggage Sleeve', 'Pen Holders'];
const officeBags = generate(
    officeProducts, 
    'Office Bags', 
    'office-bag', 
    officeFeatures, 
    ['15L', '18L', '20L', '22L'], 
    ['Premium Leather', 'PU Leather', 'Ballistic Nylon', 'Oxford Fabric'], 
    ['Black', 'Navy Blue', 'Tan', 'Dark Brown', 'Charcoal'], 
    [["Office", "Business"], ["Commute", "Meetings"]]
);

const slingFeatures = ['Water Resistant', 'Quick Access Pocket', 'Adjustable Strap', 'Anti Theft Pocket', 'RFID Protection'];
const slingBags = generate(
    slingProducts, 
    'Tote & Sling Bags', 
    'sling-bag', 
    slingFeatures, 
    ['5L', '8L', '12L', '15L'], 
    ['Canvas', 'PU Leather', 'Cotton', 'Nylon'], 
    ['Black', 'Beige', 'Olive', 'Mustard', 'Navy Blue'], 
    [["Daily Use", "Shopping"], ["College", "Casual Outing"]]
);

fs.writeFileSync(path.join(__dirname, 'data', 'products', 'office-bags.json'), JSON.stringify(officeBags, null, 2));
console.log('✅ Generated office-bags.json');

fs.writeFileSync(path.join(__dirname, 'data', 'products', 'sling-bags.json'), JSON.stringify(slingBags, null, 2));
console.log('✅ Generated sling-bags.json');
