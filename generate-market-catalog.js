const fs = require('fs');
const path = require('path');
const filepath = path.join(__dirname, 'products.json');

const products = [];
let nextId = 1;

const getRating = () => (Math.random() * (4.9 - 3.8) + 3.8).toFixed(1);
const getReviews = () => Math.floor(Math.random() * 850) + 45;
const rItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

function createProduct(category, name, description, price, discount, specs, bg, panel, txt) {
    products.push({
        id: nextId++,
        name,
        category,
        description,
        price,
        discount,
        stock: Math.floor(Math.random() * 150) + 10,
        rating: Number(getRating()),
        reviews: getReviews(),
        specifications: specs,
        bgcolor: bg,
        panelcolor: panel,
        textcolor: txt
    });
}

// Color palettes for Indian market aesthetics (sporty, professional, travel)
const colors = [
    { bg: "#eceff1", panel: "#263238" }, // Urban Dark
    { bg: "#e8f5e9", panel: "#1b5e20" }, // Forest Green
    { bg: "#e3f2fd", panel: "#0d47a1" }, // Tech Blue
    { bg: "#efebe9", panel: "#4e342e" }, // Leather Brown
    { bg: "#fce4ec", panel: "#880e4f" }, // Rose
    { bg: "#f3e5f5", panel: "#4a148c" }, // Deep Purple
    { bg: "#e0f2f1", panel: "#004d40" }, // Teal
    { bg: "#fff3e0", panel: "#e65100" }  // Burnt Orange
];
const getCol = () => rItem(colors);

// -----------------------------------------------------------------------------
// 1. Laptop Bags (20)
// Inspired by: Safari, Skybags, Dell/HP OEM bags (Tech-focused)
// -----------------------------------------------------------------------------
const laptopPrefixes = ["Aero", "Urban", "TechPro", "Commuter", "Stealth", "Cyber", "Nomad", "Velocity", "Apex", "Horizon"];
const laptopSuffixes = ["Messenger", "Laptop Sleeve", "Tech Briefcase", "Business Bag", "Folio", "Overnighter"];

for (let i = 0; i < 20; i++) {
    const name = `ShopSphere ${rItem(laptopPrefixes)} ${rItem(laptopSuffixes)} ${i+1}X`;
    const specs = {
        capacity: rItem(["15L", "18L", "20L", "22L"]),
        laptopSize: rItem(["14 inch", "15.6 inch", "17 inch"]),
        waterResistant: true,
        usbCharging: Math.random() > 0.5,
        antiTheft: Math.random() > 0.6,
        weight: rItem(["650 g", "780 g", "900 g", "1.2 kg"]),
        material: rItem(["1000D Polyester", "Ballistic Nylon", "Waterproof PU", "Vegan Leather"])
    };
    const desc = `The ${name} is engineered for the modern Indian professional. With dedicated shock-absorbing padding for a ${specs.laptopSize} laptop, this bag ensures maximum safety during your daily auto or metro commute. Built with ${specs.material}, it handles monsoons with ease.`;
    const price = Math.floor(Math.random() * (4000 - 1500) + 1500);
    const discount = Math.floor(price * 0.3); // 30% off
    const col = getCol();
    createProduct("Laptop Bag", name, desc, price, discount, specs, col.bg, col.panel, "#ffffff");
}

// -----------------------------------------------------------------------------
// 2. College Backpacks (20)
// Inspired by: Wildcraft, American Tourister, Arctic Fox (Rugged, Spacious, Sporty)
// -----------------------------------------------------------------------------
const bpPrefixes = ["Campus", "Alpha", "Trek", "Freestyle", "Nitro", "Drift", "Vortex", "Rogue", "Maverick", "Explorer"];
const bpSuffixes = ["Daypack", "Backpack", "Rucksack", "Student Pack", "Active Bag"];

for (let i = 0; i < 20; i++) {
    const name = `ShopSphere ${rItem(bpPrefixes)} ${rItem(bpSuffixes)}`;
    const specs = {
        capacity: rItem(["28L", "32L", "35L", "40L"]), // College bags need more space
        laptopSize: rItem(["15.6 inch", "None"]),
        waterResistant: true,
        usbCharging: Math.random() > 0.7,
        antiTheft: false,
        weight: rItem(["450 g", "550 g", "600 g"]),
        material: rItem(["Ripstop Nylon", "600D Polyester", "Canvas"])
    };
    const desc = `Designed for the heavy loads of Indian college life. The ${name} boasts a massive ${specs.capacity} capacity, easily swallowing engineering drawing boards, medical textbooks, and gym clothes. Features ergonomic air-mesh back padding to beat the summer heat.`;
    const price = Math.floor(Math.random() * (2500 - 999) + 999);
    const discount = Math.floor(price * 0.25); 
    const col = getCol();
    createProduct("Backpack", name, desc, price, discount, specs, col.bg, col.panel, "#ffffff");
}

// -----------------------------------------------------------------------------
// 3. Travel Bags (16)
// Inspired by: Safari, American Tourister, Mokobara (Trolleys, Duffels, Spinners)
// -----------------------------------------------------------------------------
const trvlPrefixes = ["Voyage", "Odyssey", "Transit", "Wander", "Jetset", "Globetrotter", "Expedition", "Cruise"];
const trvlSuffixes = ["Cabin Spinner", "Trolley Duffel", "Weekender", "Hard-Shell Carry-On", "Overnighter"];

for (let i = 0; i < 16; i++) {
    const name = `ShopSphere ${rItem(trvlPrefixes)} ${rItem(trvlSuffixes)}`;
    const isSpinner = name.includes("Spinner") || name.includes("Hard-Shell");
    const specs = {
        capacity: rItem(["45L", "55L", "65L", "80L"]),
        laptopSize: isSpinner ? "None" : rItem(["15.6 inch", "None"]),
        waterResistant: true,
        usbCharging: Math.random() > 0.5,
        antiTheft: true, // TSA Locks
        weight: isSpinner ? rItem(["2.5 kg", "3.2 kg"]) : rItem(["1.2 kg", "1.5 kg"]),
        material: isSpinner ? rItem(["Polycarbonate", "ABS Hard-Shell"]) : rItem(["Ballistic Nylon", "Tear-Resistant Canvas"])
    };
    const desc = `Your ultimate travel companion for flights and trains. The ${name} features ${isSpinner ? 'silent Japanese 360-degree spinner wheels and a TSA-approved lock' : 'a rugged, heavy-duty build perfect for throwing into the boot of a car'}. Spacious ${specs.capacity} interior fits a week's worth of clothes.`;
    const price = Math.floor(Math.random() * (7000 - 2500) + 2500);
    const discount = Math.floor(price * 0.4); 
    const col = getCol();
    createProduct("Travel", name, desc, price, discount, specs, col.bg, col.panel, "#ffffff");
}

// -----------------------------------------------------------------------------
// 4. Office Bags (12)
// Inspired by: Mokobara, Premium Brands (Sleek, Minimalist, Corporate)
// -----------------------------------------------------------------------------
const offPrefixes = ["Executive", "Boardroom", "CEO", "Metro", "Corporate", "Director"];
const offSuffixes = ["Briefcase", "Leather Messenger", "Folio", "Business Tote"];

for (let i = 0; i < 12; i++) {
    const name = `ShopSphere ${rItem(offPrefixes)} ${rItem(offSuffixes)}`;
    const specs = {
        capacity: rItem(["12L", "15L", "18L"]),
        laptopSize: "15.6 inch",
        waterResistant: true,
        usbCharging: false,
        antiTheft: Math.random() > 0.5,
        weight: rItem(["900 g", "1.1 kg"]),
        material: rItem(["Premium PU Leather", "Full-Grain Vegan Leather", "Waxed Canvas"])
    };
    const desc = `Command presence in any meeting. The ${name} is crafted from ${specs.material} offering a sophisticated, structured silhouette that won't collapse when empty. Features specialized compartments for business cards, tablets, and a ${specs.laptopSize} laptop.`;
    const price = Math.floor(Math.random() * (5000 - 2000) + 2000);
    const discount = Math.floor(price * 0.35); 
    const col = getCol();
    createProduct("Office Bag", name, desc, price, discount, specs, col.bg, col.panel, "#ffffff");
}

// -----------------------------------------------------------------------------
// 5. Sling & Tote (8)
// Inspired by: Everyday carry, Urban utility
// -----------------------------------------------------------------------------
const stPrefixes = ["Everyday", "City", "Minimal", "Utility", "Essential"];
const stSuffixes = ["Crossbody Sling", "Canvas Tote", "Tech Pouch", "Shopper"];

for (let i = 0; i < 8; i++) {
    const name = `ShopSphere ${rItem(stPrefixes)} ${rItem(stSuffixes)}`;
    const isSling = name.includes("Sling") || name.includes("Pouch");
    const specs = {
        capacity: isSling ? rItem(["3L", "5L"]) : rItem(["20L", "25L"]),
        laptopSize: isSling ? "None" : rItem(["14 inch", "None"]),
        waterResistant: true,
        usbCharging: false,
        antiTheft: isSling,
        weight: isSling ? "250 g" : "400 g",
        material: isSling ? "Water-repellent Nylon" : "Heavy-Duty Cotton Canvas"
    };
    const desc = `For those quick trips around the city. The ${name} is incredibly lightweight (${specs.weight}) and keeps your essentials organized. ${isSling ? 'Perfect for carrying a phone, power bank, and wallet securely.' : 'Massive open compartment ideal for groceries or light college days.'}`;
    const price = Math.floor(Math.random() * (1500 - 699) + 699);
    const discount = Math.floor(price * 0.2); 
    const col = getCol();
    createProduct(isSling ? "Sling Bag" : "Tote Bag", name, desc, price, discount, specs, col.bg, col.panel, "#ffffff");
}

// -----------------------------------------------------------------------------
// 6. Handbags (4)
// Kept to exactly 4 as requested. Minimalist fashion.
// -----------------------------------------------------------------------------
const hbNames = [
    "ShopSphere Classic Faux-Leather Satchel",
    "ShopSphere Evening Envelope Clutch",
    "ShopSphere Boho Macrame Crossbody",
    "ShopSphere Structured Work Handbag"
];

hbNames.forEach((name, i) => {
    const specs = {
        capacity: "8L",
        laptopSize: "None",
        waterResistant: true,
        usbCharging: false,
        antiTheft: false,
        weight: "600 g",
        material: "Premium Vegan Leather"
    };
    const desc = `An elegant addition to your wardrobe. The ${name} features minimalist Indian styling with modern utility. Secure zip closures and a water-resistant ${specs.material} exterior make it perfect for daily use.`;
    const price = Math.floor(Math.random() * (3000 - 1200) + 1200);
    const discount = Math.floor(price * 0.3); 
    const col = getCol();
    createProduct("Handbag", name, desc, price, discount, specs, col.bg, col.panel, "#ffffff");
});


fs.writeFileSync(filepath, JSON.stringify(products, null, 2));
console.log(`Successfully generated EXACTLY ${products.length} products analyzing Indian market trends.`);
console.log(`Split: 20 Laptop, 20 College, 16 Travel, 12 Office, 8 Sling/Tote, 4 Handbag.`);
