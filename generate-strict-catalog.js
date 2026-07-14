const fs = require('fs');
const path = require('path');
const filepath = path.join(__dirname, 'products.json');

const products = [];
let nextId = 1;

const getRating = () => (Math.random() * (4.9 - 3.8) + 3.8).toFixed(1);
const getReviews = () => Math.floor(Math.random() * 850) + 45;

function createProduct(category, demographic, name, shortDescription, description, originalPrice, discount, stock, bgcolor, panelcolor, textcolor) {
    products.push({
        id: nextId++,
        name,
        category, // Exactly matches the requested categories: Backpack, Laptop Bag, Messenger, Travel, Duffel, Tote
        demographic,
        shortDescription,
        description,
        price: originalPrice,
        discount,
        stock,
        rating: Number(getRating()),
        reviews: getReviews(),
        bgcolor,
        panelcolor,
        textcolor
    });
}

// -----------------------------------------------------------------------------
// 1. School & College Boys (20 bags)
// 10 Backpacks, 5 Laptop Bags, 5 Messengers
// -----------------------------------------------------------------------------
const boysBg = ["#e3f2fd", "#e8f5e9", "#eceff1", "#efebe9"];
const boysPanel = ["#0d47a1", "#1b5e20", "#263238", "#4e342e"];
const getBoysCol = (i) => ({ bg: boysBg[i % 4], p: boysPanel[i % 4] });

// 10 Backpacks
createProduct("Backpack", "School & College Boys", "ShopSphere Pro-Gaming Backpack", "Features padded compartments for gaming laptops and accessories.", "Engineered for gamers and tech enthusiasts. The Pro-Gaming Backpack features an armored front shield to protect your gear. Includes dedicated sleeves for a 17-inch laptop, mechanical keyboard, and headset.", 3499, 1200, 45, getBoysCol(0).bg, getBoysCol(0).p, "#ffffff");
createProduct("Backpack", "School & College Boys", "ShopSphere Urban USB Backpack", "Smart backpack with integrated USB charging port.", "Stay connected on the move. Features a built-in USB port for charging your phone while commuting. Spacious main compartment fits textbooks and daily essentials.", 1899, 600, 80, getBoysCol(1).bg, getBoysCol(1).p, "#ffffff");
createProduct("Backpack", "School & College Boys", "ShopSphere Anti-Theft Shield Pack", "Secure commuter backpack with hidden zippers and slash-proof fabric.", "Travel with peace of mind. The zippers are hidden against your back, preventing unauthorized access in crowded trains or buses. Made from cut-resistant material.", 2199, 800, 65, getBoysCol(2).bg, getBoysCol(2).p, "#ffffff");
createProduct("Backpack", "School & College Boys", "ShopSphere Roll-Top Courier Pack", "Expandable roll-top design made from water-resistant tarpaulin.", "Inspired by urban bicycle couriers. The roll-top expands to offer 20% more capacity when you need to carry extra gear. Completely waterproof.", 2499, 700, 50, getBoysCol(3).bg, getBoysCol(3).p, "#ffffff");
createProduct("Backpack", "School & College Boys", "ShopSphere Turf Sports Backpack", "Athletic backpack with a ventilated compartment for sports shoes.", "Perfect for student athletes. Includes a separate bottom compartment for football cleats or gym shoes, keeping your textbooks clean and dry.", 1799, 500, 90, getBoysCol(0).bg, getBoysCol(0).p, "#ffffff");
createProduct("Backpack", "School & College Boys", "ShopSphere Neon Active Daypack", "High-visibility backpack with reflective strips for night safety.", "Ideal for students who cycle to tuition. Bright accents and highly reflective strips ensure you are seen at night.", 1499, 400, 110, getBoysCol(1).bg, getBoysCol(1).p, "#ffffff");
createProduct("Backpack", "School & College Boys", "ShopSphere Classic Canvas Rucksack", "Rugged vintage-inspired canvas rucksack with drawstring closure.", "A nod to classic outdoor gear. Made from heavy-duty cotton canvas with faux-leather strap details. Highly durable for rough daily college use.", 1999, 600, 75, getBoysCol(2).bg, getBoysCol(2).p, "#ffffff");
createProduct("Backpack", "School & College Boys", "ShopSphere Aero-Mesh Commuter Pack", "Features a suspended mesh back panel to prevent sweat during summer.", "Beat the Indian summer heat. The suspended back panel allows air to flow freely between the bag and your back, keeping you cool.", 2299, 800, 60, getBoysCol(3).bg, getBoysCol(3).p, "#ffffff");
createProduct("Backpack", "School & College Boys", "ShopSphere Minimalist Stealth Pack", "Sleek, all-black profile with matte rubberized zippers.", "A clean, tactical look for the modern student. Features a slim profile that won't bump into people in crowded spaces.", 1699, 500, 85, getBoysCol(0).bg, getBoysCol(0).p, "#ffffff");
createProduct("Backpack", "School & College Boys", "ShopSphere Heavy-Duty College Pack", "Massive 35L capacity backpack with three main compartments.", "The ultimate book bag. Built to carry heavy loads of engineering or medical textbooks without tearing. Features reinforced stitching.", 2099, 700, 100, getBoysCol(1).bg, getBoysCol(1).p, "#ffffff");

// 5 Laptop Bags (Unique & New Collections)
createProduct("Laptop Bag", "School & College Boys", "ShopSphere Carbon Fiber Tech Sleeve", "Ultra-premium carbon fiber exterior for extreme lightweight protection.", "The future of tech carry. Made from real carbon fiber weave, this sleeve is virtually indestructible while weighing next to nothing.", 3299, 1000, 120, getBoysCol(2).bg, getBoysCol(2).p, "#ffffff");
createProduct("Laptop Bag", "School & College Boys", "ShopSphere Solar Charge Laptop Messenger", "Features a built-in solar panel to charge your phone on the go.", "Never run out of battery. The exterior flap integrates a flexible solar panel that trickle-charges a built-in power bank during your sunny commutes.", 4599, 1500, 40, getBoysCol(3).bg, getBoysCol(3).p, "#ffffff");
createProduct("Laptop Bag", "School & College Boys", "ShopSphere Modular Tech Organizer Bag", "Comes with magnetic attachments to customize the interior layout.", "Build your own bag. Features a magnetic grid system inside so you can snap on different pouches for chargers, hard drives, and styluses.", 2899, 900, 70, getBoysCol(0).bg, getBoysCol(0).p, "#ffffff");
createProduct("Laptop Bag", "School & College Boys", "ShopSphere Biodegradable Cork Laptop Sleeve", "Eco-friendly laptop bag made entirely from sustainable, water-resistant cork.", "A stunning, earth-friendly alternative to leather. Naturally shock-absorbent, water-repellent, and uniquely textured.", 1899, 500, 90, getBoysCol(1).bg, getBoysCol(1).p, "#ffffff");
createProduct("Laptop Bag", "School & College Boys", "ShopSphere Faraday Privacy Tech Bag", "Lined with signal-blocking fabric to protect your devices from hacking and tracking.", "Complete digital privacy. The interior compartment acts as a Faraday cage, blocking RFID, GPS, Cellular, and Wi-Fi signals instantly.", 3999, 1200, 60, getBoysCol(2).bg, getBoysCol(2).p, "#ffffff");

// 5 Messengers
createProduct("Messenger", "School & College Boys", "ShopSphere Varsity Canvas Messenger", "Classic cross-body bag for quick access to books and gear.", "The quintessential college bag. Throw it over your shoulder and go. Made from durable washed canvas.", 1499, 400, 100, getBoysCol(3).bg, getBoysCol(3).p, "#ffffff");
createProduct("Messenger", "School & College Boys", "ShopSphere Tactical Sling Messenger", "Military-inspired design with MOLLE webbing and quick-release buckle.", "Rugged and ready. Features multiple external pockets for rapid access to keys, phone, and transit cards.", 1799, 500, 50, getBoysCol(0).bg, getBoysCol(0).p, "#ffffff");
createProduct("Messenger", "School & College Boys", "ShopSphere Urban Courier Bag", "Lightweight nylon messenger with a reflective front panel.", "Perfect for cyclists. The large flap is highly reflective, and the cross-body strap includes a stabilizing under-arm strap.", 1999, 600, 65, getBoysCol(1).bg, getBoysCol(1).p, "#ffffff");
createProduct("Messenger", "School & College Boys", "ShopSphere Denim Crossbody Messenger", "Casual denim messenger bag with upcycled aesthetic.", "A relaxed, stylish option for tuition or weekend hangouts. Soft, durable, and easily washable.", 1299, 300, 80, getBoysCol(2).bg, getBoysCol(2).p, "#ffffff");
createProduct("Messenger", "School & College Boys", "ShopSphere Mini Tablet Messenger", "Compact messenger bag designed specifically for an iPad and notebook.", "When you don't need a heavy backpack. Perfectly sized for a tablet, a single notebook, and your daily essentials.", 1199, 300, 95, getBoysCol(3).bg, getBoysCol(3).p, "#ffffff");


// -----------------------------------------------------------------------------
// 2. School & College Girls (20 bags)
// 10 Backpacks, 5 Laptop Bags, 5 Totes
// -----------------------------------------------------------------------------
const girlsBg = ["#fce4ec", "#fff3e0", "#f3e5f5", "#e0f2f1"];
const girlsPanel = ["#c2185b", "#e65100", "#6a1b9a", "#00695c"];
const getGirlsCol = (i) => ({ bg: girlsBg[i % 4], p: girlsPanel[i % 4] });

// 10 Backpacks
createProduct("Backpack", "School & College Girls", "ShopSphere Pastel Campus Pack", "Lightweight daily backpack in soft pastel hues with ample space.", "A beautifully designed college backpack. Features comfortable padded straps and a spacious interior for heavy books.", 1599, 400, 110, getGirlsCol(0).bg, getGirlsCol(0).p, "#ffffff");
createProduct("Backpack", "School & College Girls", "ShopSphere Clear Stadium Backpack", "Trendy transparent PVC backpack with colorful fabric trims.", "Make a statement at college fests. Completely transparent design allows for quick security checks and a unique aesthetic.", 1399, 300, 85, getGirlsCol(1).bg, getGirlsCol(1).p, "#ffffff");
createProduct("Backpack", "School & College Girls", "ShopSphere Floral Embroidered Pack", "Durable canvas backpack featuring intricate floral embroidery.", "Blends traditional aesthetics with modern utility. Features a padded laptop sleeve and dual water bottle pockets.", 1899, 600, 70, getGirlsCol(2).bg, getGirlsCol(2).p, "#ffffff");
createProduct("Backpack", "School & College Girls", "ShopSphere Minimalist Faux-Leather Backpack", "Clean, structured faux-leather backpack for a polished college look.", "Looks like a premium handbag, functions like a college backpack. Water-resistant and easily wipes clean.", 2199, 700, 60, getGirlsCol(3).bg, getGirlsCol(3).p, "#ffffff");
createProduct("Backpack", "School & College Girls", "ShopSphere Corduroy Vintage Pack", "Soft ribbed corduroy backpack with a relaxed, vintage vibe.", "Perfect for winter semesters. The soft corduroy fabric is incredibly durable and adds texture to any outfit.", 1699, 500, 90, getGirlsCol(0).bg, getGirlsCol(0).p, "#ffffff");
createProduct("Backpack", "School & College Girls", "ShopSphere Compact Mini Backpack", "Small, stylish backpack for days when you only need a notebook.", "A cute alternative to heavy bags. Perfect for light class days or weekend cafe study sessions.", 1299, 300, 100, getGirlsCol(1).bg, getGirlsCol(1).p, "#ffffff");
createProduct("Backpack", "School & College Girls", "ShopSphere Holographic Accent Pack", "Sporty backpack featuring iridescent, color-shifting panels.", "Stand out from the crowd. The holographic panels catch the sunlight brilliantly. Includes a dedicated laptop slot.", 1999, 600, 50, getGirlsCol(2).bg, getGirlsCol(2).p, "#ffffff");
createProduct("Backpack", "School & College Girls", "ShopSphere Quilted Nylon Backpack", "Ultra-lightweight quilted design that feels like a puffy jacket.", "Incredibly light on your shoulders. The quilted nylon material is naturally water-repellent and very trendy.", 1799, 500, 80, getGirlsCol(3).bg, getGirlsCol(3).p, "#ffffff");
createProduct("Backpack", "School & College Girls", "ShopSphere Gingham Checkered Pack", "Classic preppy gingham print backpack with tan faux-leather accents.", "Channel an academic aesthetic. Features a robust base to prevent sagging under the weight of textbooks.", 1599, 400, 75, getGirlsCol(0).bg, getGirlsCol(0).p, "#ffffff");
createProduct("Backpack", "School & College Girls", "ShopSphere Multi-Pocket Organizer Pack", "Features 6 external pockets to keep small items perfectly organized.", "Never lose your keys or pens again. Intelligently designed with a pocket for every specific need.", 2099, 700, 65, getGirlsCol(1).bg, getGirlsCol(1).p, "#ffffff");

// 5 Laptop Bags (Unique & New Collections)
createProduct("Laptop Bag", "School & College Girls", "ShopSphere Origami Foldable Laptop Sleeve", "Transforms into an ergonomic laptop stand when unfolded.", "Work anywhere comfortably. This unique sleeve folds along precise geometric lines to become a sturdy, angled stand for typing in cafes.", 1899, 600, 85, getGirlsCol(2).bg, getGirlsCol(2).p, "#ffffff");
createProduct("Laptop Bag", "School & College Girls", "ShopSphere Transparent PVC Tech Messenger", "Y2K-inspired completely clear laptop bag with neon accents.", "Show off your tech. A bold fashion statement made from heavy-duty clear PVC, allowing you to display your laptop decals and accessories.", 1599, 400, 90, getGirlsCol(3).bg, getGirlsCol(3).p, "#ffffff");
createProduct("Laptop Bag", "School & College Girls", "ShopSphere Convertible Tote-to-Backpack Bag", "Instantly changes from a professional tote to a comfortable backpack.", "The ultimate shape-shifter. Pull the straps to convert it in 2 seconds. Perfect for commuting when your laptop gets too heavy for one shoulder.", 2299, 700, 110, getGirlsCol(0).bg, getGirlsCol(0).p, "#ffffff");
createProduct("Laptop Bag", "School & College Girls", "ShopSphere Iridescent Holographic Laptop Sleeve", "Color-shifting metallic exterior that changes hue in the sunlight.", "Turn heads on campus. The mesmerizing holographic finish is not only stunning but completely water-proof and scratch-resistant.", 1499, 400, 70, getGirlsCol(1).bg, getGirlsCol(1).p, "#ffffff");
createProduct("Laptop Bag", "School & College Girls", "ShopSphere Vegan Cactus Leather Tech Tote", "Made from 100% sustainable cactus leather with a luxurious soft feel.", "Ethical luxury. This spacious tech tote is crafted from innovative Mexican cactus leather, offering the durability of real leather without the environmental impact.", 3499, 1200, 50, getGirlsCol(2).bg, getGirlsCol(2).p, "#ffffff");

// 5 Tote Bags
createProduct("Tote", "School & College Girls", "ShopSphere Heavy Canvas College Tote", "Massive, highly durable 100% cotton canvas tote with a zip closure.", "Unlike standard open totes, this features a full zip closure to keep your belongings secure on crowded local trains.", 999, 200, 150, getGirlsCol(3).bg, getGirlsCol(3).p, "#ffffff");
createProduct("Tote", "School & College Girls", "ShopSphere Motivation Quote Tote", "Eco-friendly canvas tote featuring bold, inspiring typography.", "Carry your positivity. A lightweight, easily washable tote perfect for light class days or grocery runs.", 799, 200, 120, getGirlsCol(0).bg, getGirlsCol(0).p, "#ffffff");
createProduct("Tote", "School & College Girls", "ShopSphere Reversible Faux-Leather Tote", "Two looks in one! A sleek tote that reverses to a bright contrast color.", "Match it with any outfit. Made from soft, unlined faux leather that drapes beautifully over the shoulder.", 1899, 600, 60, getGirlsCol(1).bg, getGirlsCol(1).p, "#ffffff");
createProduct("Tote", "School & College Girls", "ShopSphere Puffer Cloud Tote", "Trendy, ultra-lightweight quilted puffer tote bag.", "The cloud bag trend comes to college. Incredibly soft, spacious, and comfortable to carry all day.", 1699, 500, 80, getGirlsCol(2).bg, getGirlsCol(2).p, "#ffffff");
createProduct("Tote", "School & College Girls", "ShopSphere Multi-Pocket Study Tote", "Features internal dividers and external pockets for ultimate organization.", "A tote that actually keeps you organized. Includes dedicated slots for your water bottle, umbrella, and pens.", 1499, 400, 95, getGirlsCol(3).bg, getGirlsCol(3).p, "#ffffff");


// -----------------------------------------------------------------------------
// 3. Office Professionals (20 bags)
// 10 Laptop Bags, 5 Backpacks, 5 Messengers
// -----------------------------------------------------------------------------
const officeBg = ["#fafafa", "#efebe9", "#f5f5f5", "#e8eaf6"];
const officePanel = ["#424242", "#4e342e", "#616161", "#283593"];
const getOfficeCol = (i) => ({ bg: officeBg[i % 4], p: officePanel[i % 4] });

// 10 Laptop Bags (Unique & New Collections)
createProduct("Laptop Bag", "Office Professionals", "ShopSphere Biometric Fingerprint Briefcase", "Genuine-look leather laptop briefcase secured by an integrated fingerprint scanner.", "Uncompromised security for corporate executives. Only your fingerprint can unlock the main compartment, keeping sensitive documents and expensive hardware safe.", 5499, 1500, 40, getOfficeCol(0).bg, getOfficeCol(0).p, "#ffffff");
createProduct("Laptop Bag", "Office Professionals", "ShopSphere Ultra-Thin Titanium Thread Brief", "Constructed using titanium-infused threads for slash-proof security without the weight.", "The strongest bag we've ever made. Despite being impossibly thin, the exterior fabric resists blades, water, and extreme abrasion.", 4299, 1200, 60, getOfficeCol(1).bg, getOfficeCol(1).p, "#ffffff");
createProduct("Laptop Bag", "Office Professionals", "ShopSphere Magnetic Snap-On Laptop Folio", "A modular folio that magnetically attaches to a larger weekend bag.", "Designed for the hybrid worker. Carry it solo to the cafe, then magnetically snap it onto your travel duffel for a weekend business trip.", 2999, 900, 50, getOfficeCol(2).bg, getOfficeCol(2).p, "#ffffff");
createProduct("Laptop Bag", "Office Professionals", "ShopSphere Self-Heating Laptop Tote", "Elegant structured tote featuring a built-in heated pocket for cold commutes.", "The ultimate luxury for winter mornings. A subtle heating element in the side pocket keeps your hands warm while waiting for the train.", 4199, 1000, 45, getOfficeCol(3).bg, getOfficeCol(3).p, "#ffffff");
createProduct("Laptop Bag", "Office Professionals", "ShopSphere Zero-Gravity Shoulder Briefcase", "Features an advanced elastic suspension strap that makes the bag feel 30% lighter.", "Save your shoulders. The patented suspension system absorbs the shock of walking, drastically reducing perceived weight during long walks.", 3799, 1200, 35, getOfficeCol(0).bg, getOfficeCol(0).p, "#ffffff");
createProduct("Laptop Bag", "Office Professionals", "ShopSphere E-Ink Display Nylon Briefcase", "Includes a customizable E-Ink display tag on the front for digital business cards.", "Network instantly. The built-in low-power E-Ink screen can display your QR code, name, or company logo, controlled via Bluetooth.", 3999, 1100, 85, getOfficeCol(1).bg, getOfficeCol(1).p, "#ffffff");
createProduct("Laptop Bag", "Office Professionals", "ShopSphere Dual-Tone Acoustic Office Bag", "Made from sound-absorbing acoustic fabric perfect for noisy open offices.", "Create your own quiet zone. The bag doubles as a desktop acoustic divider to reduce background noise while you work in an open-plan office.", 2799, 800, 55, getOfficeCol(2).bg, getOfficeCol(2).p, "#ffffff");
createProduct("Laptop Bag", "Office Professionals", "ShopSphere Anti-Microbial Copper Tech Brief", "Woven with pure copper fibers to naturally destroy 99% of surface bacteria.", "Stay healthy on public transit. The copper-infused exterior continuously sanitizes itself, perfect for germ-conscious commuters.", 3299, 1000, 40, getOfficeCol(3).bg, getOfficeCol(3).p, "#ffffff");
createProduct("Laptop Bag", "Office Professionals", "ShopSphere Soft-Sided Wireless Charging Bag", "Just drop your phone into the side pocket for instant 15W wireless charging.", "Seamless power. A built-in wireless charging pad sits hidden in the quick-access pocket. Just slide your phone in to charge.", 3199, 900, 70, getOfficeCol(0).bg, getOfficeCol(0).p, "#ffffff");
createProduct("Laptop Bag", "Office Professionals", "ShopSphere AI-Tracked Smart Briefcase", "Includes an integrated ultra-wideband (UWB) tracker built directly into the lining.", "Never lose your bag again. Pinpoint its exact location down to the inch using your smartphone. Tracker is completely hidden.", 4999, 1500, 25, getOfficeCol(1).bg, getOfficeCol(1).p, "#ffffff");

// 5 Backpacks (Business Backpacks)
createProduct("Backpack", "Office Professionals", "ShopSphere Metro Executive Backpack", "Clean, structured backpack that looks completely professional with a suit.", "Ditch the briefcase without losing the professional look. Maintains a rigid, elegant shape even when empty.", 2899, 800, 60, getOfficeCol(2).bg, getOfficeCol(2).p, "#ffffff");
createProduct("Backpack", "Office Professionals", "ShopSphere Anti-Crease Commuter Pack", "Ergonomic back panel specifically designed to prevent wrinkling formal shirts.", "Arrive looking sharp. The unique suspended back system prevents the bag from pressing flat against your shirt.", 2699, 700, 65, getOfficeCol(3).bg, getOfficeCol(3).p, "#ffffff");
createProduct("Backpack", "Office Professionals", "ShopSphere Tech-Corp Business Pack", "Features dedicated padded slots for two laptops and a tablet.", "For the IT professional. Safely carry your personal and work laptops simultaneously with massive protective padding.", 3499, 1100, 45, getOfficeCol(0).bg, getOfficeCol(0).p, "#ffffff");
createProduct("Backpack", "Office Professionals", "ShopSphere Vegan Leather City Pack", "Premium vegan leather construction offering a luxurious corporate feel.", "Water-resistant, easy to clean, and sophisticated. Includes hidden passport pockets for business travel.", 3199, 900, 50, getOfficeCol(1).bg, getOfficeCol(1).p, "#ffffff");
createProduct("Backpack", "Office Professionals", "ShopSphere Convertible Briefcase Backpack", "Transforms instantly from a backpack to a professional side-carry briefcase.", "Tuck the backpack straps away and deploy the side handle to instantly transition into a formal client meeting.", 3599, 1200, 40, getOfficeCol(2).bg, getOfficeCol(2).p, "#ffffff");

// 5 Messengers (Executive Messengers)
createProduct("Messenger", "Office Professionals", "ShopSphere Classic Oxford Messenger", "Timeless fold-over messenger bag with hidden magnetic closures.", "A mature, refined messenger bag. Crafted from premium materials that age beautifully with daily use.", 2599, 700, 55, getOfficeCol(3).bg, getOfficeCol(3).p, "#ffffff");
createProduct("Messenger", "Office Professionals", "ShopSphere Modernist Tech Messenger", "Sleek, flapless messenger bag featuring waterproof zippers and clean lines.", "A futuristic, minimalist take on the classic messenger. Highly water-resistant and incredibly sleek.", 2799, 800, 50, getOfficeCol(0).bg, getOfficeCol(0).p, "#ffffff");
createProduct("Messenger", "Office Professionals", "ShopSphere Vintage Waxed Canvas Messenger", "Rugged yet professional waxed canvas bag with rich leather accents.", "For creative professionals and architects. Highly durable and completely waterproof thanks to the waxed coating.", 2999, 900, 45, getOfficeCol(1).bg, getOfficeCol(1).p, "#ffffff");
createProduct("Messenger", "Office Professionals", "ShopSphere Minimalist Flap Messenger", "Features a massive front flap that completely covers and protects the interior.", "Secure and stylish. The wide shoulder strap ensures comfort during long cross-city commutes.", 2299, 600, 70, getOfficeCol(2).bg, getOfficeCol(2).p, "#ffffff");
createProduct("Messenger", "Office Professionals", "ShopSphere Heavy-Duty Courier Brief", "Over-engineered messenger bag designed for extreme durability and heavy loads.", "Features industrial-grade buckles and reinforced stitching. Built to last a lifetime of hard corporate use.", 3199, 1000, 40, getOfficeCol(3).bg, getOfficeCol(3).p, "#ffffff");


// -----------------------------------------------------------------------------
// 4. Travel (20 bags)
// 10 Travel (Trolleys/Cabin), 5 Backpacks, 5 Duffels
// -----------------------------------------------------------------------------
const travelBg = ["#e0f7fa", "#fbe9e7", "#e8f5e9", "#fff8e1"];
const travelPanel = ["#006064", "#d84315", "#2e7d32", "#f9a825"];
const getTravelCol = (i) => ({ bg: travelBg[i % 4], p: travelPanel[i % 4] });

// 10 Travel (Cabin Bags / Trolleys / Weekenders)
createProduct("Travel", "Travel & Outdoor", "ShopSphere AeroLite Cabin Spinner", "Soft-sided 4-wheel cabin trolley designed to fit overhead bins perfectly.", "Breeze through the airport. Features 360-degree spinner wheels, a telescopic handle, and an expandable zipper.", 4599, 1500, 30, getTravelCol(0).bg, getTravelCol(0).p, "#ffffff");
createProduct("Travel", "Travel & Outdoor", "ShopSphere Hard-Shell Carry-On", "Indestructible polycarbonate cabin suitcase with a built-in TSA lock.", "Ultimate protection for your belongings. Lightweight yet incredibly strong, featuring silent Japanese spinner wheels.", 5499, 1800, 25, getTravelCol(1).bg, getTravelCol(1).p, "#ffffff");
createProduct("Travel", "Travel & Outdoor", "ShopSphere Under-Seat Flight Tote", "Compact cabin bag designed strictly to fit under the airplane seat.", "Avoid overhead bin fees. This compact bag maximizes packing volume while meeting the strictest airline limits.", 2499, 700, 45, getTravelCol(2).bg, getTravelCol(2).p, "#ffffff");
createProduct("Travel", "Travel & Outdoor", "ShopSphere Business Overnighter Cabin Bag", "Features a front quick-access pocket for your laptop and boarding pass.", "Designed for fast-paced business travel. You can remove your laptop at security without opening the main clothing compartment.", 4299, 1400, 35, getTravelCol(3).bg, getTravelCol(3).p, "#ffffff");
createProduct("Travel", "Travel & Outdoor", "ShopSphere Roller-Duffel Hybrid", "Combines the spaciousness of a duffel with the convenience of smooth trolley wheels.", "The best of both worlds. Carry it over your shoulder on rough terrain, or roll it smoothly through the airport.", 3999, 1200, 40, getTravelCol(0).bg, getTravelCol(0).p, "#ffffff");
createProduct("Travel", "Travel & Outdoor", "ShopSphere Classic Canvas Weekender", "Timeless, roomy weekender bag perfect for quick 2-day getaways.", "A luxurious travel companion. Made from thick cotton canvas with vegan leather trims and sturdy metal hardware.", 2799, 800, 55, getTravelCol(1).bg, getTravelCol(1).p, "#ffffff");
createProduct("Travel", "Travel & Outdoor", "ShopSphere Quilted Nylon Weekend Bag", "Chic, lightweight, and spacious weekender that looks great at luxury resorts.", "Travel in style without the weight. The puffy quilted nylon is naturally water-resistant and highly compressible.", 2999, 900, 50, getTravelCol(2).bg, getTravelCol(2).p, "#ffffff");
createProduct("Travel", "Travel & Outdoor", "ShopSphere Heavy-Duty Cotton Holdall", "Indestructible thick cotton canvas holdall built for rugged road trips.", "Throw it in the trunk of your car. This tough-as-nails bag is designed to take a beating on long road trips.", 2299, 600, 65, getTravelCol(3).bg, getTravelCol(3).p, "#ffffff");
createProduct("Travel", "Travel & Outdoor", "ShopSphere Faux-Leather Getaway Bag", "Premium-looking weekender bag that wipes clean easily after your trip.", "Sophisticated styling for the modern traveler. Features a wide-mouth opening for easy packing and unpacking.", 3199, 1000, 45, getTravelCol(0).bg, getTravelCol(0).p, "#ffffff");
createProduct("Travel", "Travel & Outdoor", "ShopSphere 4-Wheel Soft Cabin Suitcase", "Lightweight soft-shell cabin luggage with two large front organizer pockets.", "Maximizes packing space while remaining incredibly light. The front pockets are perfect for books and travel documents.", 3899, 1100, 40, getTravelCol(1).bg, getTravelCol(1).p, "#ffffff");

// 5 Backpacks (Travel/Hiking)
createProduct("Backpack", "Travel & Outdoor", "ShopSphere Globetrotter 40L Travel Pack", "Carry-on sized backpack that zips completely open like a suitcase.", "The ultimate backpacker's bag. Meets global carry-on limits and features internal compression straps to maximize space.", 3799, 1200, 35, getTravelCol(2).bg, getTravelCol(2).p, "#ffffff");
createProduct("Backpack", "Travel & Outdoor", "ShopSphere Summit 55L Trekking Rucksack", "Professional trekking bag with internal metal frame and ergonomic hip belt.", "Conquer the Himalayas. The heavily padded hip belt transfers 80% of the weight off your shoulders. Includes rain cover.", 4999, 1600, 25, getTravelCol(3).bg, getTravelCol(3).p, "#ffffff");
createProduct("Backpack", "Travel & Outdoor", "ShopSphere Alpine 35L Day-Hiker Pack", "Lightweight hiking backpack with hydration bladder compatibility.", "Perfect for day treks. Highly breathable back mesh and numerous external loops for trekking poles and gear.", 2899, 800, 50, getTravelCol(0).bg, getTravelCol(0).p, "#ffffff");
createProduct("Backpack", "Travel & Outdoor", "ShopSphere Photographer's Travel Pack", "Customizable padded dividers specifically for DSLR cameras and drones.", "Protect your expensive lenses on the road. The interior can be rearranged to fit any camera setup perfectly.", 4599, 1500, 30, getTravelCol(1).bg, getTravelCol(1).p, "#ffffff");
createProduct("Backpack", "Travel & Outdoor", "ShopSphere Expandable City-to-City Pack", "Zips open to expand from a slim 25L daypack to a roomy 35L weekend bag.", "One bag for everything. Keep it compressed while exploring the city, expand it when packing souvenirs to go home.", 3299, 1000, 45, getTravelCol(2).bg, getTravelCol(2).p, "#ffffff");

// 5 Duffels
createProduct("Duffel", "Travel & Outdoor", "ShopSphere Expedition 60L Duffel", "Massive 60-liter capacity duffel made from tear-resistant ripstop nylon.", "Pack everything you need for a week. Features heavy-duty wrap-around webbing handles that will not tear.", 2499, 700, 60, getTravelCol(3).bg, getTravelCol(3).p, "#ffffff");
createProduct("Duffel", "Travel & Outdoor", "ShopSphere Foldable Parachute Duffel", "Ultra-lightweight duffel that folds completely into its own small pocket.", "The perfect spare bag. Pack it flat in your suitcase, and deploy it for extra souvenirs on the trip back.", 1299, 300, 100, getTravelCol(0).bg, getTravelCol(0).p, "#ffffff");
createProduct("Duffel", "Travel & Outdoor", "ShopSphere Leather Trim Travel Duffel", "Sophisticated canvas duffel enhanced with premium vegan leather handles.", "A classic gym-to-airport bag. Durable, stylish, and highly functional with an adjustable shoulder strap.", 2899, 900, 45, getTravelCol(1).bg, getTravelCol(1).p, "#ffffff");
createProduct("Duffel", "Travel & Outdoor", "ShopSphere Water-Resistant Sports Duffel", "Features a completely waterproof shoe compartment and wet-clothes pocket.", "Keep your clean clothes dry and odor-free. The dedicated shoe tunnel keeps dirty sneakers isolated from the main cabin.", 1899, 500, 80, getTravelCol(2).bg, getTravelCol(2).p, "#ffffff");
createProduct("Duffel", "Travel & Outdoor", "ShopSphere Heavy-Hauler 80L Duffel", "Gigantic 80-liter duffel designed for moving or extensive sports equipment.", "When you need to carry a lot of gear. Made from ultra-thick 1000D ballistic nylon for maximum durability.", 3199, 1000, 35, getTravelCol(3).bg, getTravelCol(3).p, "#ffffff");

fs.writeFileSync(filepath, JSON.stringify(products, null, 2));
console.log(`Successfully generated EXACTLY ${products.length} products with 0 women's handbags. Split: 30 Backpacks, 20 Laptop Bags, 10 Messengers, 10 Travel, 5 Duffel, 5 Tote.`);
