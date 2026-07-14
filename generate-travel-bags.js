const fs = require('fs');
const path = require('path');

const products = [
    { sku: 'TB001', name: 'Voyager Duffel Bag', demographic: 'Travelers', price: 1999 },
    { sku: 'TB002', name: 'Expedition Travel Duffel', demographic: 'Travelers', price: 2499 },
    { sku: 'TB003', name: 'Urban Weekender Bag', demographic: 'Professionals', price: 2299 },
    { sku: 'TB004', name: 'Explorer Cabin Bag', demographic: 'Business Travelers', price: 2999 },
    { sku: 'TB005', name: 'TrailMaster Duffel', demographic: 'Adventure Travelers', price: 2799 },
    { sku: 'TB006', name: 'Metro Weekender', demographic: 'Office Professionals', price: 2399 },
    { sku: 'TB007', name: 'Journey Pro Travel Bag', demographic: 'Frequent Travelers', price: 3199 },
    { sku: 'TB008', name: 'Aero Cabin Duffel', demographic: 'Flight Travelers', price: 2899 },
    { sku: 'TB009', name: 'Nomad Travel Bag', demographic: 'Backpackers', price: 2699 },
    { sku: 'TB010', name: 'Elite Weekender', demographic: 'Business Users', price: 3499 },
    { sku: 'TB011', name: 'Active Gym Duffel', demographic: 'Gym Users', price: 1799 },
    { sku: 'TB012', name: 'FitCarry Sports Bag', demographic: 'Gym + Travel', price: 1899 },
    { sku: 'TB013', name: 'PowerMove Duffel', demographic: 'Students & Travelers', price: 2199 },
    { sku: 'TB014', name: 'Premium Expedition Bag', demographic: 'Professionals', price: 3799 },
    { sku: 'TB015', name: 'Ultimate Voyager Bag', demographic: 'Premium Travelers', price: 3999 }
];

const colors = ['Black', 'Navy Blue', 'Olive Green', 'Charcoal Grey', 'Brown', 'Forest Green', 'Dark Grey', 'Sand Beige'];
const capacities = ['35L', '40L', '45L', '50L', '55L'];
const materials = ['Premium Polyester', 'Ballistic Nylon', 'Waterproof Nylon', 'Canvas', 'PU Leather'];
const weights = ['850g', '950g', '1.1kg', '1.3kg'];

const allFeatures = [
    'Water Resistant', 'Waterproof Base', 'Shoe Compartment', 'USB Charging',
    'Anti Theft Pocket', 'Luggage Sleeve', 'Expandable Storage', 'Bottle Pocket',
    'Wet Compartment', 'Compression Straps'
];

const bestForOptions = [
    ["Travel", "Weekend Trips"],
    ["Business Travel", "Flight"],
    ["Gym", "Travel"],
    ["Road Trips", "Outdoor"],
    ["Cabin Luggage", "Office"]
];

function getRandomItems(arr, count) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const finalProducts = products.map((p, index) => {
    const discount = Math.floor(Math.random() * 5 + 1) * 100; // 100 to 500
    const rating = (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1);
    const reviews = Math.floor(Math.random() * 800) + 50;
    const stock = Math.floor(Math.random() * 40) + 5;
    
    // Pick 3-5 random features
    const numFeatures = Math.floor(Math.random() * 3) + 3;
    const features = getRandomItems(allFeatures, numFeatures);

    const specifications = {
        capacity: getRandomItem(capacities),
        waterResistant: features.includes('Water Resistant'),
        usbCharging: features.includes('USB Charging'),
        antiTheft: features.includes('Anti Theft Pocket'),
        weight: getRandomItem(weights),
        material: getRandomItem(materials),
        shoeCompartment: features.includes('Shoe Compartment')
    };

    return {
        name: p.name,
        price: p.price,
        discount: discount,
        category: 'Travel Bags',
        demographic: p.demographic,
        description: `A premium ${p.demographic.toLowerCase()} bag designed for ultimate convenience. Features include ${features.slice(0, 3).join(', ')}.`,
        rating: Number(rating),
        reviews: reviews,
        stock: stock,
        bestFor: getRandomItem(bestForOptions),
        color: getRandomItem(colors),
        image: `/images/products/travel-bag${index + 1}.jpg`,
        bgcolor: '#F3F4F6',
        panelcolor: '#FFFFFF',
        textcolor: '#111827',
        specifications: specifications
    };
});

fs.writeFileSync(path.join(__dirname, 'data', 'products', 'travel-bags.json'), JSON.stringify(finalProducts, null, 2));
console.log('Successfully generated travel-bags.json');
