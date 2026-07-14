const fs = require('fs');
const path = require('path');
const filepath = path.join(__dirname, 'products.json');

const products = [];
let nextId = 1;

// Helper to create a product
function createProduct(category, demographic, name, shortDescription, description, price, discount, stock, bgcolor, panelcolor, textcolor, promptKeywords) {
    const p = {
        id: nextId++,
        name,
        category,
        demographic,
        shortDescription,
        description,
        price,
        discount,
        stock,
        bgcolor,
        panelcolor,
        textcolor,
        imagePrompt: `Isolated product photography of ONE single bag: ${name}, ${category}, ${promptKeywords}. STRICTLY bag only. NO clothes, NO mannequins, NO people, NO body parts. Pure white studio background, high quality, 8k resolution.`
    };
    products.push(p);
}

// -----------------------------------------------------------------------------
// 1. Fashion Related (40 bags)
// -----------------------------------------------------------------------------
const fashionNames = [
    "Luxe Ruched Cloud Bag", "Geometric Crossbody Clutch", "Satin Pearl Evening Bag", "Iridescent Holographic Tote",
    "Crocodile Embossed Satchel", "Velvet Quilted Chain Bag", "Micro Box Baguette", "Metallic Party Sling",
    "Faux Fur Trim Handbag", "Woven Vegan Leather Pouch", "Neon Transparent Sling", "Crystal Embellished Minaudiere",
    "Ostrich Texture Top Handle", "Acrylic Tortoiseshell Clutch", "Macrame Fringe Boho Bag", "Studded Rocker Crossbody",
    "Patent Leather Dome Satchel", "Half-Moon Crescent Hobo", "Bamboo Handle Straw Tote", "Chunky Chain Flap Bag",
    "Ombre Gradient Shoulder Bag", "Rhinestone Mesh Pouch", "Abstract Art Canvas Tote", "Clear PVC Stadium Bag",
    "Vegan Python Print Crossbody", "Slouchy Suede Hobo", "Origami Folded Handbag", "Resin Handle Tote",
    "Metallic Mesh Drawstring", "Checkerboard Knit Tote", "Denim Patchwork Sling", "Braided Leather Crossover",
    "Sequined Party Box", "Matte Black Minimalist Clutch", "Glitter Box Satchel", "Circular Rattan Crossbody",
    "Fringed Western Bucket Bag", "Glossy Enamel Top Handle", "Silk Scarf Wrapped Tote", "Asymmetrical Modernist Bag"
];

fashionNames.forEach((name, i) => {
    const cats = ["Handbags", "Crossbody Bags", "Tote Bags", "Sling Bags"];
    const colors = [
        {bg: "#fce4ec", p: "#c2185b", t: "#ffffff"}, {bg: "#e0f7fa", p: "#006064", t: "#ffffff"},
        {bg: "#fff8e1", p: "#f57f17", t: "#ffffff"}, {bg: "#212121", p: "#000000", t: "#e0e0e0"}
    ];
    const col = colors[i % colors.length];
    createProduct(
        cats[i % 4], "Fashion", name, 
        "Trendy fashion-forward bag for stylish outings.", 
        `The ${name} is the ultimate fashion statement. Designed for trendsetters, it features premium materials and striking aesthetic details. Perfect for parties, brunches, and fashion events. Features a spacious main compartment and secure closure. Elevate your outfit instantly with this masterpiece.`,
        2499 + (i * 50), 500, 30 + i, col.bg, col.p, col.t, "fashionable, trendy, elegant"
    );
});

// -----------------------------------------------------------------------------
// 2. School/College Boys (40 bags)
// -----------------------------------------------------------------------------
const boysNames = [
    "Urban Xtreme Sport Backpack", "Tech-Pro Laptop Backpack", "Gamer's Edge Gear Bag", "Camo Tactical Rucksack",
    "Streetwear Skater Backpack", "Neon Accent College Bag", "Anti-Theft Commuter Pack", "Heavy-Duty Gym Duffel",
    "Sleek Waterproof Daypack", "Football Turf Duffel Bag", "Carbon Fiber Texture Pack", "Graffiti Print School Bag",
    "Rider's Hard-Shell Backpack", "Messenger Bag for Laptops", "Utility Chest Rig Sling", "Canvas Vintage Messenger",
    "Basketball Equipment Pack", "Reflective Night-Rider Bag", "Solar Charger Tech Backpack", "Ripstop Nylon Hiking Pack",
    "Minimalist Black College Pack", "Shoe-Compartment Gym Bag", "Cross-Body Tech Sling", "Camo Print Duffel",
    "Drawstring Sport Sack", "Drop-Leg Tactical Pouch", "Rolltop Courier Backpack", "Padded Tablet Messenger",
    "Ergonomic Posture Pack", "Skateboard Carry Backpack", "Matte Rubberized Backpack", "Athletic Turf Sling",
    "Trekking 40L Rucksack", "Vintage Leather Messenger", "Denim College Backpack", "Urban Camouflage Sling",
    "Water-Resistant Tech Tote", "Cyberpunk Style Sling", "Heavy Canvas Duffle", "Multi-Pocket Utility Bag"
];

boysNames.forEach((name, i) => {
    const cats = ["Backpacks", "Duffel Bags", "Messenger Bags", "Sling Bags"];
    const colors = [
        {bg: "#e3f2fd", p: "#0d47a1", t: "#ffffff"}, {bg: "#e8f5e9", p: "#1b5e20", t: "#ffffff"},
        {bg: "#efebe9", p: "#4e342e", t: "#ffffff"}, {bg: "#eceff1", p: "#263238", t: "#ffffff"}
    ];
    const col = colors[i % colors.length];
    createProduct(
        cats[i % 4], "College/School Boys", name, 
        "Rugged, tech-friendly bag designed for active students.", 
        `The ${name} is engineered for the modern student. It features robust zippers, reinforced stitching, and multiple compartments for textbooks, gadgets, and gym gear. The padded shoulder straps provide ergonomic support during long college days. Water-resistant and durable, it's built to withstand the rigors of student life.`,
        1499 + (i * 30), 400, 50 + i, col.bg, col.p, col.t, "cool, masculine, sporty, durable"
    );
});

// -----------------------------------------------------------------------------
// 3. School/College Girls (40 bags)
// -----------------------------------------------------------------------------
const girlsNames = [
    "Pastel Aesthetic Backpack", "Kawaii Plush Charm Bag", "Daisy Print Canvas Tote", "Holographic Pencil/Sling Bag",
    "Mint Green College Pack", "Corduroy Mini Backpack", "Polka Dot Daypack", "Clear Stadium Backpack",
    "Floral Embroidered Tote", "Lilac Quilted Backpack", "Rose Gold Laptop Sleeve Bag", "Soft Faux-Leather Rucksack",
    "Macaron Color Block Pack", "Butterfly Print School Bag", "Ribbon Tie Canvas Bag", "Iridescent Transparent Tote",
    "Fairycore Vintage Satchel", "Faux Fur Fluffy Tote", "Checkered Pattern Backpack", "Gingham Print Daypack",
    "Cherry Print Canvas Tote", "Preppy Plaid School Bag", "Soft Velvet Mini Backpack", "Starry Night Galaxy Pack",
    "Watermelon Canvas Tote", "Peach Blossom Crossbody", "Unicorn Holographic Sling", "Denim Daisy Backpack",
    "Sunny Yellow College Bag", "Blush Pink Tech Backpack", "Glitter Trim Satchel", "Cat Ear Mini Backpack",
    "Pearl Embellished Sling", "Boba Tea Print Tote", "Cottagecore Straw Bag", "Mermaid Scale Backpack",
    "Tie-Dye Swirl Daypack", "Heart Shaped Crossbody", "Rainbow Strap Canvas Bag", "Cozy Teddy Bear Backpack"
];

girlsNames.forEach((name, i) => {
    const cats = ["Backpacks", "Tote Bags", "Handbags", "Crossbody Bags"];
    const colors = [
        {bg: "#fce4ec", p: "#ad1457", t: "#ffffff"}, {bg: "#fff3e0", p: "#e65100", t: "#ffffff"},
        {bg: "#f3e5f5", p: "#6a1b9a", t: "#ffffff"}, {bg: "#e0f2f1", p: "#004d40", t: "#ffffff"}
    ];
    const col = colors[i % colors.length];
    createProduct(
        cats[i % 4], "College/School Girls", name, 
        "Cute and stylish bag with plenty of space for books and essentials.", 
        `The ${name} perfectly balances aesthetics and utility. Designed with vibrant, trendy colors and patterns, it features spacious interiors for textbooks, laptops, and makeup pouches. The lightweight material ensures it won't weigh you down, while the multiple pockets keep everything organized. Perfect for school, college, and weekend study dates.`,
        1299 + (i * 20), 300, 60 + i, col.bg, col.p, col.t, "cute, feminine, pastel, stylish"
    );
});

// -----------------------------------------------------------------------------
// 4. Senior Citizens, Teachers, Normal/Travel (40 bags)
// -----------------------------------------------------------------------------
const normalNames = [
    "Classic Teacher's Briefcase", "Ergonomic Lumbar Backpack", "Lightweight Travel Spinner Tote", "Spacious Grocery Shopper",
    "Vintage Leather Work Tote", "Comfort Strap Crossbody", "Multi-Compartment Organizer Bag", "Secure Zip Travel Duffle",
    "Elegant Top-Handle Satchel", "Medical/First-Aid Organizer Bag", "Premium Canvas Cabin Bag", "Waterproof Walking Sling",
    "Professional Laptop Messenger", "Insulated Lunch/Picnic Tote", "Minimalist Nylon Carryall", "Sturdy Wheelchair Accessible Bag",
    "Soft Faux-Leather Handbag", "Large Capacity Family Duffle", "RFID Blocking Travel Wallet", "Classic Canvas Weekender",
    "Subtle Tone Office Backpack", "Teacher's Graded-Papers Tote", "Easy-Open Magnetic Satchel", "Orthopedic Comfort Backpack",
    "Lightweight Parachute Duffle", "Senior's Daily Essentials Bag", "Foldable Market Tote Bag", "Durable Canvas Holdall",
    "Executive Leather Portfolio", "Soft Cotton Yoga Bag", "Padded Strap Camera/Travel Bag", "Simple Zip-Top Shoulder Bag",
    "Spacious Overnight Travel Bag", "Secure Anti-Pickpocket Bag", "Neutral Tone Work Handbag", "Sturdy Base Grocery Tote",
    "Comfort-Grip Leather Duffle", "Easy-Access Medicine Sling", "Classic Plaid Travel Bag", "All-Weather Commuter Backpack"
];

normalNames.forEach((name, i) => {
    const cats = ["Tote Bags", "Duffel Bags", "Messenger Bags", "Backpacks"];
    const colors = [
        {bg: "#fafafa", p: "#424242", t: "#ffffff"}, {bg: "#efebe9", p: "#4e342e", t: "#ffffff"},
        {bg: "#f5f5f5", p: "#616161", t: "#ffffff"}, {bg: "#e8eaf6", p: "#3f51b5", t: "#ffffff"}
    ];
    const col = colors[i % colors.length];
    createProduct(
        cats[i % 4], "Seniors/Teachers/Travel", name, 
        "Practical, highly functional, and exceptionally comfortable bag.", 
        `The ${name} prioritizes comfort, utility, and classic style. Designed with accessibility in mind, it features easy-to-use zippers, lightweight materials, and exceptionally comfortable straps that reduce shoulder strain. Perfect for teachers carrying papers, seniors needing a reliable daily bag, or travelers looking for a durable, organized carry-on.`,
        1899 + (i * 40), 400, 40 + i, col.bg, col.p, col.t, "practical, classic, neutral, functional, comfortable"
    );
});

fs.writeFileSync(filepath, JSON.stringify(products, null, 2));
console.log(`Successfully generated ${products.length} demographically targeted bags in products.json.`);
