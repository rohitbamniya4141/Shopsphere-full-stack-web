const fs = require('fs');
const path = require('path');
const filepath = path.join(__dirname, 'products.json');

const products = [];
let nextId = 1;

// Helper to generate random realistic rating
const getRating = () => (Math.random() * (4.9 - 3.8) + 3.8).toFixed(1);
// Helper to generate random realistic reviews
const getReviews = () => Math.floor(Math.random() * 850) + 45;

function createProduct(category, subcategory, demographic, name, shortDescription, description, originalPrice, discount, stock, bgcolor, panelcolor, textcolor) {
    const p = {
        id: nextId++,
        name,
        category: subcategory, // Used by Pexels search mapping
        demographic,
        shortDescription,
        description,
        price: originalPrice,
        discount, // Selling price will be originalPrice - discount
        stock,
        rating: Number(getRating()),
        reviews: getReviews(),
        bgcolor,
        panelcolor,
        textcolor
    };
    products.push(p);
}

// -----------------------------------------------------------------------------
// 1. School & College Boys (20 bags)
// Backpacks, Laptop Bags, Messenger Bags, Sports Bags
// -----------------------------------------------------------------------------
const boysBags = [
    { sub: "Backpack", name: "ShopSphere Campus Alpha Backpack", desc: "Spacious 32L backpack with 3 compartments, perfect for heavy college textbooks.", price: 1899, disc: 600 },
    { sub: "Backpack", name: "ShopSphere Xtreme Urban Daypack", desc: "Sporty, water-resistant backpack featuring air-mesh back padding for summer commutes.", price: 1599, disc: 500 },
    { sub: "Backpack", name: "ShopSphere Tech-Pro Anti-Theft Pack", desc: "Secure backpack with hidden zippers and integrated USB charging port.", price: 2199, disc: 800 },
    { sub: "Backpack", name: "ShopSphere Classic Canvas Rucksack", desc: "Vintage-inspired canvas rucksack with drawstring closure and metal buckles.", price: 1799, disc: 400 },
    { sub: "Backpack", name: "ShopSphere Neon Active School Bag", desc: "High-visibility backpack with reflective strips, ideal for cycling to school.", price: 1499, disc: 500 },
    { sub: "Laptop Bag", name: "ShopSphere Commuter 15.6\" Laptop Backpack", desc: "Dedicated padded laptop compartment with shock-absorbing corners.", price: 2499, disc: 900 },
    { sub: "Laptop Bag", name: "ShopSphere Slim Tech Laptop Sleeve Pack", desc: "Ultra-slim profile backpack designed strictly for a laptop and a few notebooks.", price: 1299, disc: 300 },
    { sub: "Laptop Bag", name: "ShopSphere Armor Hard-Shell Pack", desc: "Gaming laptop backpack with a rigid front shell to protect expensive gear.", price: 2999, disc: 1200 },
    { sub: "Laptop Bag", name: "ShopSphere Roll-Top Laptop Bag", desc: "Expandable roll-top design made from heavy-duty waterproof tarpaulin.", price: 2299, disc: 700 },
    { sub: "Messenger Bag", name: "ShopSphere Varsity Canvas Messenger", desc: "Casual over-the-shoulder canvas bag with multiple organizer pockets.", price: 1399, disc: 400 },
    { sub: "Messenger Bag", name: "ShopSphere Urban Crossbody Courier", desc: "Lightweight nylon messenger bag, perfect for quick trips and tuition classes.", price: 1199, disc: 300 },
    { sub: "Messenger Bag", name: "ShopSphere Retro Faux-Leather Satchel", desc: "Distressed faux-leather messenger that gains character with everyday use.", price: 1999, disc: 600 },
    { sub: "Messenger Bag", name: "ShopSphere Tactical Sling Messenger", desc: "Military-inspired messenger with MOLLE webbing for attaching extra gear.", price: 1699, disc: 500 },
    { sub: "Sports Bag", name: "ShopSphere Turf Football Duffel", desc: "Includes a separate ventilated compartment specifically for muddy cleats.", price: 1499, disc: 500 },
    { sub: "Sports Bag", name: "ShopSphere Active Gym Barrel Bag", desc: "Compact cylindrical sports bag with a dedicated protein shaker pocket.", price: 999, disc: 200 },
    { sub: "Sports Bag", name: "ShopSphere Hoops Basketball Backpack", desc: "Features a front expandable mesh pocket designed to hold a full-size basketball.", price: 1899, disc: 600 },
    { sub: "Sports Bag", name: "ShopSphere Swimmer's Wet/Dry Bag", desc: "Waterproof interior lining to keep wet towels separate from dry clothes.", price: 1299, disc: 400 },
    { sub: "Backpack", name: "ShopSphere Minimalist Black Pack", desc: "Sleek, all-black design with matte finish and stealth zippers.", price: 1699, disc: 500 },
    { sub: "Backpack", name: "ShopSphere Camouflage Cargo Pack", desc: "Heavy-duty 40L bag with multiple cargo pockets and camo print.", price: 2199, disc: 700 },
    { sub: "Laptop Bag", name: "ShopSphere Hybrid Briefcase Backpack", desc: "Converts easily from a professional briefcase to a college backpack.", price: 2599, disc: 800 }
];

boysBags.forEach((b, i) => {
    const bgColors = ["#e3f2fd", "#e8f5e9", "#efebe9", "#eceff1"];
    const panelColors = ["#0d47a1", "#1b5e20", "#4e342e", "#263238"];
    createProduct("Boys", b.sub, "School & College Boys", b.name, b.desc, `The ${b.name} is built for the dynamic lifestyle of Indian students. Whether you are navigating crowded metros or running between college blocks, this bag offers premium comfort and durability. Features heavy-duty zippers, water-resistant fabrics, and smart compartments. Original ShopSphere design.`, b.price, b.disc, 50 + i, bgColors[i % 4], panelColors[i % 4], "#ffffff");
});


// -----------------------------------------------------------------------------
// 2. School & College Girls (20 bags)
// Mix of Backpacks, Tote Bags, Sling Bags, Crossbody Bags, Laptop Bags
// -----------------------------------------------------------------------------
const girlsBags = [
    { sub: "Backpack", name: "ShopSphere Pastel Flora Backpack", desc: "Soft pastel backpack with subtle floral embroidery and gold zippers.", price: 1699, disc: 500 },
    { sub: "Backpack", name: "ShopSphere Aesthetic Corduroy Pack", desc: "Trendy ribbed corduroy backpack, perfect for an artsy college look.", price: 1499, disc: 400 },
    { sub: "Backpack", name: "ShopSphere Clear Stadium Backpack", desc: "Transparent PVC backpack with bright neon trims for college fests.", price: 1299, disc: 300 },
    { sub: "Backpack", name: "ShopSphere Quilted Velvet Daypack", desc: "Luxurious velvet texture with thick padding for ultimate comfort.", price: 1899, disc: 600 },
    { sub: "Laptop Bag", name: "ShopSphere Blush Pink Laptop Tote", desc: "Elegant tote bag with a highly padded 14-inch laptop sleeve built-in.", price: 2199, disc: 700 },
    { sub: "Laptop Bag", name: "ShopSphere Mint Green Tech Backpack", desc: "Water-resistant tech pack with dedicated slots for tablet, laptop, and stylus.", price: 1999, disc: 600 },
    { sub: "Laptop Bag", name: "ShopSphere Professional Canvas Laptop Bag", desc: "Slim canvas laptop sleeve-bag with a detachable crossbody strap.", price: 1599, disc: 500 },
    { sub: "Tote Bag", name: "ShopSphere Oversized Canvas Tote", desc: "Massive 100% cotton canvas tote that easily fits textbooks, lunch, and a jacket.", price: 899, disc: 200 },
    { sub: "Tote Bag", name: "ShopSphere Reversible Faux-Leather Tote", desc: "Two looks in one! A sleek faux-leather tote that reverses to a bright contrast color.", price: 1799, disc: 600 },
    { sub: "Tote Bag", name: "ShopSphere Zippered College Tote", desc: "Unlike standard totes, this features a full top zipper to keep your belongings secure.", price: 1199, disc: 300 },
    { sub: "Tote Bag", name: "ShopSphere Puffer Cloud Tote", desc: "Ultra-lightweight quilted puffer tote, feels like carrying a cloud.", price: 1499, disc: 400 },
    { sub: "Sling Bag", name: "ShopSphere Minimalist Phone Sling", desc: "Compact sling designed strictly for your smartphone, ID, and some cash.", price: 799, disc: 200 },
    { sub: "Sling Bag", name: "ShopSphere Holographic Festival Sling", desc: "Eye-catching iridescent sling bag perfect for college events and concerts.", price: 999, disc: 300 },
    { sub: "Sling Bag", name: "ShopSphere Denim Patchwork Sling", desc: "Upcycled-look denim sling bag with unique patchwork details.", price: 1199, disc: 400 },
    { sub: "Crossbody Bag", name: "ShopSphere Woven Vegan Crossbody", desc: "Intricately woven vegan leather crossbody with a beautiful ethnic strap.", price: 1599, disc: 500 },
    { sub: "Crossbody Bag", name: "ShopSphere Geometric Envelope Bag", desc: "Structured crossbody bag featuring a modern geometric flap design.", price: 1699, disc: 600 },
    { sub: "Crossbody Bag", name: "ShopSphere Macrame Fringe Crossbody", desc: "Boho-chic macrame bag, perfect for casual outings and weekend brunches.", price: 1399, disc: 400 },
    { sub: "Backpack", name: "ShopSphere Gingham Checkered Pack", desc: "Classic preppy gingham print backpack with tan faux-leather accents.", price: 1599, disc: 500 },
    { sub: "Tote Bag", name: "ShopSphere Motivation Quote Tote", desc: "Eco-friendly tote featuring inspiring typography for daily motivation.", price: 699, disc: 150 },
    { sub: "Laptop Bag", name: "ShopSphere Faux-Suede 15\" Laptop Messenger", desc: "Soft faux-suede finish with sturdy protection for larger laptops.", price: 2099, disc: 700 }
];

girlsBags.forEach((b, i) => {
    const bgColors = ["#fce4ec", "#fff3e0", "#f3e5f5", "#e0f2f1"];
    const panelColors = ["#ad1457", "#e65100", "#6a1b9a", "#004d40"];
    createProduct("Girls", b.sub, "School & College Girls", b.name, b.desc, `The ${b.name} combines stunning aesthetics with everyday practicality. Designed carefully for the Indian college girl, it provides secure storage, lightweight materials, and trendy designs that pair perfectly with both ethnic and western wear. Premium quality guaranteed by ShopSphere.`, b.price, b.disc, 60 + i, bgColors[i % 4], panelColors[i % 4], "#ffffff");
});


// -----------------------------------------------------------------------------
// 3. Office Professionals (20 bags)
// Leather Laptop Bags, Executive Messenger Bags, Briefcases, Business Backpacks, Office Tote Bags
// -----------------------------------------------------------------------------
const officeBags = [
    { sub: "Leather Laptop Bag", name: "ShopSphere Premium Leather 15.6\" Bag", desc: "Genuine-look PU leather laptop bag with polished silver hardware.", price: 3499, disc: 1200 },
    { sub: "Leather Laptop Bag", name: "ShopSphere Executive Slim Laptop Sleeve", desc: "Ultra-slim leather profile for the minimalist professional.", price: 2499, disc: 800 },
    { sub: "Leather Laptop Bag", name: "ShopSphere Two-Tone Office Laptop Bag", desc: "Sophisticated dual-tone leather design for a commanding boardroom presence.", price: 3199, disc: 1000 },
    { sub: "Leather Laptop Bag", name: "ShopSphere Women's Leather Laptop Tote", desc: "Structured leather tote designed specifically to safely hold a 14-inch laptop.", price: 2899, disc: 900 },
    { sub: "Executive Messenger Bag", name: "ShopSphere Classic Oxford Messenger", desc: "Timeless fold-over messenger bag with magnetic buckle closures.", price: 2199, disc: 600 },
    { sub: "Executive Messenger Bag", name: "ShopSphere Modernist Tech Messenger", desc: "Sleek, flapless messenger bag featuring waterproof zippers and clean lines.", price: 2599, disc: 800 },
    { sub: "Executive Messenger Bag", name: "ShopSphere Vintage Waxed Canvas Messenger", desc: "Rugged yet professional waxed canvas bag with rich leather accents.", price: 2799, disc: 900 },
    { sub: "Briefcase", name: "ShopSphere Heritage Hard-Shell Briefcase", desc: "Classic structured briefcase with a secure combination lock system.", price: 3999, disc: 1500 },
    { sub: "Briefcase", name: "ShopSphere Lightweight Nylon Briefcase", desc: "A modern, lightweight alternative to traditional heavy briefcases.", price: 1899, disc: 500 },
    { sub: "Briefcase", name: "ShopSphere Expandable Lawyer's Briefcase", desc: "Features a zip-expansion system for when you need to carry extra case files.", price: 3299, disc: 1100 },
    { sub: "Business Backpack", name: "ShopSphere Metro Executive Backpack", desc: "Clean, structured backpack that looks entirely professional with a suit.", price: 2699, disc: 800 },
    { sub: "Business Backpack", name: "ShopSphere TSA-Friendly Laptop Pack", desc: "Lays completely flat for easy airport security screening during business trips.", price: 2999, disc: 900 },
    { sub: "Business Backpack", name: "ShopSphere Anti-Crease Commuter Pack", desc: "Ergonomic back panel designed to prevent wrinkling your formal shirts.", price: 2499, disc: 700 },
    { sub: "Business Backpack", name: "ShopSphere Vegan Leather City Pack", desc: "Premium vegan leather construction offering a luxurious feel without the guilt.", price: 3199, disc: 1000 },
    { sub: "Office Tote Bag", name: "ShopSphere Structured Work Tote", desc: "Rigid base and walls ensure the bag stands upright on your desk or the floor.", price: 1999, disc: 500 },
    { sub: "Office Tote Bag", name: "ShopSphere Multi-Compartment Director's Tote", desc: "Features 5 interior compartments to keep documents, tech, and makeup separated.", price: 2299, disc: 600 },
    { sub: "Office Tote Bag", name: "ShopSphere Zip-Top Corporate Tote", desc: "Secure zip-top closure makes this perfect for crowded local train commutes.", price: 1799, disc: 400 },
    { sub: "Executive Messenger Bag", name: "ShopSphere Minimalist Flap Messenger", desc: "Hidden magnetic closures keep the front profile incredibly clean and sharp.", price: 2099, disc: 500 },
    { sub: "Briefcase", name: "ShopSphere Soft-Sided Document Briefcase", desc: "Slim, elegant briefcase ideal for carrying just a laptop and essential contracts.", price: 2399, disc: 700 },
    { sub: "Business Backpack", name: "ShopSphere Power-Bank Integrated Pack", desc: "Built-in wiring allows you to charge your phone seamlessly on the go.", price: 2899, disc: 900 }
];

officeBags.forEach((b, i) => {
    const bgColors = ["#fafafa", "#efebe9", "#f5f5f5", "#e8eaf6"];
    const panelColors = ["#424242", "#4e342e", "#616161", "#3f51b5"];
    createProduct("Office", b.sub, "Office Professionals", b.name, b.desc, `The ${b.name} is the epitome of corporate elegance. Designed for the modern Indian professional, it blends formal aesthetics with high functionality. Protect your expensive tech while maintaining a commanding presence in the boardroom. Premium craftsmanship by ShopSphere.`, b.price, b.disc, 40 + i, bgColors[i % 4], panelColors[i % 4], "#ffffff");
});


// -----------------------------------------------------------------------------
// 4. Travel & Outdoor (20 bags)
// Duffel Bags, Travel Backpacks, Cabin Bags, Hiking Backpacks, Weekender Bags
// -----------------------------------------------------------------------------
const travelBags = [
    { sub: "Duffel Bag", name: "ShopSphere Expedition 60L Duffel", desc: "Massive 60-liter capacity duffel made from tear-resistant ripstop nylon.", price: 2499, disc: 800 },
    { sub: "Duffel Bag", name: "ShopSphere Foldable Parachute Duffel", desc: "Ultra-lightweight duffel that folds into its own pocket for easy storage.", price: 1299, disc: 400 },
    { sub: "Duffel Bag", name: "ShopSphere Leather Trim Travel Duffel", desc: "Sophisticated canvas duffel enhanced with premium vegan leather handles.", price: 2899, disc: 900 },
    { sub: "Duffel Bag", name: "ShopSphere Water-Resistant Gym & Travel Duffel", desc: "Features a waterproof shoe compartment and wet-clothes pocket.", price: 1799, disc: 500 },
    { sub: "Travel Backpack", name: "ShopSphere Globetrotter 40L Backpack", desc: "Carry-on sized backpack that opens like a suitcase for easy packing.", price: 3499, disc: 1200 },
    { sub: "Travel Backpack", name: "ShopSphere Digital Nomad Travel Pack", desc: "Features a dedicated, heavily padded tech zone and a separate clothing compartment.", price: 3999, disc: 1400 },
    { sub: "Travel Backpack", name: "ShopSphere Expandable City-to-City Pack", desc: "Zips open to expand from a 25L daypack to a 35L weekend travel bag.", price: 2999, disc: 1000 },
    { sub: "Cabin Bag", name: "ShopSphere AeroLite Cabin Spinner", desc: "Soft-sided 4-wheel cabin bag designed to fit overhead bins perfectly.", price: 4499, disc: 1500 },
    { sub: "Cabin Bag", name: "ShopSphere Under-Seat Flight Tote", desc: "Compact cabin bag designed strictly to fit under the airplane seat in front of you.", price: 2199, disc: 700 },
    { sub: "Cabin Bag", name: "ShopSphere Business Overnighter Cabin Bag", desc: "Features a front quick-access pocket for your laptop and boarding pass.", price: 3799, disc: 1200 },
    { sub: "Hiking Backpack", name: "ShopSphere Summit 55L Trekking Rucksack", desc: "Professional trekking bag with internal metal frame and ergonomic hip belt.", price: 4999, disc: 1800 },
    { sub: "Hiking Backpack", name: "ShopSphere Alpine 35L Day-Hiker Pack", desc: "Lightweight hiking backpack with hydration bladder compatibility.", price: 2699, disc: 800 },
    { sub: "Hiking Backpack", name: "ShopSphere Monsoon Waterproof Rucksack", desc: "Includes an integrated, high-visibility rain cover for absolute weather protection.", price: 3199, disc: 1000 },
    { sub: "Hiking Backpack", name: "ShopSphere Multi-Day Trail Backpack", desc: "Features numerous gear loops for attaching tents, sleeping bags, and poles.", price: 4599, disc: 1600 },
    { sub: "Weekender Bag", name: "ShopSphere Classic Canvas Weekender", desc: "Timeless, roomy weekender bag perfect for quick 2-day getaways.", price: 2299, disc: 600 },
    { sub: "Weekender Bag", name: "ShopSphere Quilted Nylon Weekend Tote", desc: "Chic, lightweight, and spacious weekender that looks great at luxury resorts.", price: 2599, disc: 800 },
    { sub: "Weekender Bag", name: "ShopSphere Heavy-Duty Cotton Holdall", desc: "Indestructible thick cotton canvas holdall built for rugged road trips.", price: 1999, disc: 500 },
    { sub: "Weekender Bag", name: "ShopSphere Faux-Leather Getaway Bag", desc: "Premium-looking weekender bag that wipes clean easily after your trip.", price: 2799, disc: 900 },
    { sub: "Duffel Bag", name: "ShopSphere Roller-Duffel Hybrid", desc: "Combines the spaciousness of a duffel with the convenience of smooth trolley wheels.", price: 3599, disc: 1100 },
    { sub: "Travel Backpack", name: "ShopSphere Photographer's Travel Pack", desc: "Customizable padded dividers specifically for DSLR cameras and lenses.", price: 4299, disc: 1500 }
];

travelBags.forEach((b, i) => {
    const bgColors = ["#e8f5e9", "#fff8e1", "#e0f7fa", "#fbe9e7"];
    const panelColors = ["#2e7d32", "#f9a825", "#00838f", "#d84315"];
    createProduct("Travel", b.sub, "Travel & Outdoor", b.name, b.desc, `The ${b.name} is engineered for adventure. Whether navigating crowded Indian railway stations, boarding a flight, or trekking the Himalayas, this bag offers incredible durability and smart storage. ShopSphere travel gear is built to withstand the toughest journeys.`, b.price, b.disc, 30 + i, bgColors[i % 4], panelColors[i % 4], "#ffffff");
});

fs.writeFileSync(filepath, JSON.stringify(products, null, 2));
console.log(`Successfully generated a strictly balanced catalog of ${products.length} products.`);
