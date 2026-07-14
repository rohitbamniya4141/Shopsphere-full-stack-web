const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'products.json');
const products = JSON.parse(fs.readFileSync(filepath, 'utf8'));

// Start at ID 121
let nextId = 121;

const extraProducts = [
    // --- Amazon Inspired (Practical, High-Utility, Value for Money) ---
    {
        name: "ShopSphere 32L Water Resistant Laptop Backpack",
        category: "Backpacks",
        shortDescription: "Spacious everyday backpack with 3 compartments and padded laptop sleeve.",
        description: "Inspired by India's top-selling utility backpacks, this 32L capacity bag is perfect for college, office, and travel. It features three large compartments, a dedicated padded sleeve for laptops up to 15.6 inches, and an internal organizer for pens and accessories. Made from high-quality PU coated polyester, it is completely water-resistant. The ergonomic padded back panel and adjustable shoulder straps ensure all-day comfort. Includes a side mesh pocket for water bottles and umbrellas.",
        price: 1999,
        discount: 1100, // Selling at 899
        stock: 120,
        bgcolor: "#e0f2f1", panelcolor: "#00695c", textcolor: "#ffffff",
        imagePrompt: ""
    },
    {
        name: "ShopSphere Women's PU Leather Hobo Bag",
        category: "Handbags",
        shortDescription: "Stylish and spacious hobo shoulder bag for women, perfect for daily use.",
        description: "A versatile hobo bag designed for the modern woman. This bag features a soft, slouchy design made from premium PU leather with a pebble texture. It comes with a spacious main compartment divided by a central zip pocket, making organization effortless. The reinforced shoulder strap sits comfortably, and a detachable long strap allows for crossbody wear. Its elegant design makes it suitable for both office wear and casual outings.",
        price: 2499, discount: 1500, stock: 85,
        bgcolor: "#fce4ec", panelcolor: "#ad1457", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Lightweight Travel Duffle 50L",
        category: "Duffel Bags",
        shortDescription: "Foldable and lightweight 50L duffle bag for gym and weekend travel.",
        description: "The ultimate travel companion. This 50L duffle bag is incredibly lightweight yet made from tear-resistant nylon. It features a shoe compartment with ventilation holes, separating dirty gear from clean clothes. The main compartment is huge, while the front zip pocket provides quick access to tickets and phones. Dual padded handles and a detachable shoulder strap offer flexible carrying options. Perfect for sports, gym, or weekend getaways.",
        price: 1499, discount: 600, stock: 150,
        bgcolor: "#e8eaf6", panelcolor: "#283593", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Anti-Theft Backpack with USB Port",
        category: "Backpacks",
        shortDescription: "Secure urban backpack with hidden zippers and integrated charging port.",
        description: "Travel with peace of mind. This anti-theft backpack features hidden zippers that sit against your back, preventing unauthorized access while you wear it. It includes a built-in USB charging port on the exterior (power bank not included) for on-the-go charging. The interior is intelligently designed with multiple padded slots for a laptop, tablet, and camera. The exterior is crafted from cut-proof, water-repellent material with reflective safety strips.",
        price: 2999, discount: 1500, stock: 95,
        bgcolor: "#212121", panelcolor: "#000000", textcolor: "#e0e0e0", imagePrompt: ""
    },
    {
        name: "ShopSphere Men's Genuine Leather Wallet",
        category: "Wallets",
        shortDescription: "Classic bifold leather wallet with RFID blocking and coin pocket.",
        description: "A timeless classic crafted from rich, genuine-look PU leather. This bifold wallet features advanced RFID blocking technology to protect your cards from unauthorized scans. It includes two currency compartments, 6 card slots, a transparent ID window, and a secure button-closure coin pocket. Its slim profile ensures it fits comfortably in your front or back pocket without adding bulk.",
        price: 999, discount: 500, stock: 200,
        bgcolor: "#efebe9", panelcolor: "#4e342e", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Transparent Clear Sling Bag",
        category: "Sling Bags",
        shortDescription: "Stadium-approved clear PVC sling bag with adjustable strap.",
        description: "Breeze through security checks with this stylish clear sling bag. Made from heavy-duty transparent PVC, it meets all stadium and event security guidelines. The bag features a main zip compartment and a smaller front zip pocket for essentials. The black fabric trim adds durability and style, while the adjustable strap allows you to wear it across the chest or over the shoulder. Waterproof and easy to clean.",
        price: 799, discount: 300, stock: 65,
        bgcolor: "#fafafa", panelcolor: "#424242", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Kids School Backpack with Lunch Box",
        category: "Backpacks",
        shortDescription: "Fun and colorful 2-piece set featuring a durable backpack and matching lunch bag.",
        description: "Make going to school fun with this vibrant 2-piece set. The main backpack features three large compartments, perfect for textbooks, notebooks, and a light jacket. It includes a padded laptop sleeve and two side mesh pockets for water bottles. The set comes with a matching insulated lunch bag that clips onto the backpack. Ergonomically designed with heavily padded shoulder straps to protect growing backs.",
        price: 1899, discount: 600, stock: 110,
        bgcolor: "#fff3e0", panelcolor: "#e65100", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Expandable Cabin Luggage Bag",
        category: "Travel Bags",
        shortDescription: "Soft-sided 4-wheel spinner cabin luggage with 20% expansion.",
        description: "Your perfect flight companion. This soft-sided cabin bag is designed to maximize packing space while meeting most airline carry-on limits. It features a zip-expansion system that adds 20% more capacity when needed. The 360-degree spinner wheels and telescopic handle make navigating airports a breeze. The exterior boasts two large zip pockets for documents and magazines, while the interior features cross-straps and a mesh pocket.",
        price: 4999, discount: 2500, stock: 45,
        bgcolor: "#e3f2fd", panelcolor: "#1565c0", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Floral Print Canvas Tote",
        category: "Tote Bags",
        shortDescription: "Eco-friendly reusable canvas tote bag with vibrant floral print.",
        description: "Say goodbye to plastic bags with this beautiful floral canvas tote. Made from thick, 100% natural cotton canvas, this bag can comfortably hold up to 10kg of groceries, books, or beach essentials. The long shoulder straps ensure comfortable carrying even when fully loaded. The vibrant, fade-resistant floral print adds a touch of summer to any outfit. Machine washable and completely biodegradable.",
        price: 499, discount: 200, stock: 300,
        bgcolor: "#f1f8e9", panelcolor: "#33691e", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Vintage Messenger Bag for Men",
        category: "Messenger Bags",
        shortDescription: "Rugged waxed canvas and leather messenger bag for laptops up to 14 inches.",
        description: "Channel rugged vintage style with this premium messenger bag. Constructed from high-density water-resistant waxed canvas and accented with genuine-look crazy horse PU leather. The flap secures with magnetic snaps hidden beneath decorative buckles. Inside, a padded sleeve protects your 14-inch laptop, while multiple slip pockets organize your pens, phone, and keys. The wide, adjustable shoulder strap ensures comfortable cross-body wear during your daily commute.",
        price: 2999, discount: 1200, stock: 75,
        bgcolor: "#efebe9", panelcolor: "#5d4037", textcolor: "#ffffff", imagePrompt: ""
    },

    // --- Flipkart Inspired (Trendy, Youth-Focused, Sporty) ---
    {
        name: "ShopSphere Urban Xtreme Sport Backpack",
        category: "Backpacks",
        shortDescription: "Dynamic dual-tone sporty backpack with rain cover and laptop sleeve.",
        description: "Designed for the energetic youth, the Urban Xtreme features a bold, dual-tone exterior with sporty graphics. It boasts 32L of space across three compartments, including a dedicated sleeve for a 15.6-inch laptop. A concealed pocket at the bottom houses a bright waterproof rain cover, keeping your gear safe during monsoons. The back panel is heavily padded with air-mesh technology to prevent sweating during long commutes or college days.",
        price: 2199, discount: 1000, stock: 140,
        bgcolor: "#e8f5e9", panelcolor: "#1b5e20", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Glamour Sling Mini Bag",
        category: "Sling Bags",
        shortDescription: "Trendy metallic-finish sling bag with a striking chain strap.",
        description: "Add instant glamour to your party outfit. This mini sling bag features a high-shine metallic finish that catches the light beautifully. The compact interior holds just the essentials: phone, lipstick, and cards. A chunky, gold-tone chain strap adds an edgy vibe and can be worn crossbody or doubled up over the shoulder. The secure magnetic snap closure ensures your valuables stay safe while you dance the night away.",
        price: 1299, discount: 500, stock: 90,
        bgcolor: "#fff8e1", panelcolor: "#f57f17", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere College Trendsetter Tote",
        category: "Tote Bags",
        shortDescription: "Large typography-print tote bag, perfect for college and casual hangs.",
        description: "Make a statement on campus. This large tote bag features bold, trendy typography prints on the front. Made from thick polyester blend fabric, it's durable enough to carry heavy textbooks and a laptop. The main compartment features a secure zipper closure, unlike standard open totes, providing extra security. Includes a small inner zip pocket for loose change and keys. The soft webbed handles won't dig into your shoulders.",
        price: 899, discount: 300, stock: 180,
        bgcolor: "#fce4ec", panelcolor: "#c2185b", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Neo Crossbody Chest Bag",
        category: "Crossbody Bags",
        shortDescription: "Sleek, asymmetrical chest bag for men with a futuristic design.",
        description: "The ultimate streetwear accessory. The Neo Chest Bag features a futuristic, asymmetrical design made from matte-finish waterproof PU. Designed to be worn tight across the chest or back, it provides rapid access to your phone, wallet, and sunglasses. The single strap is fully adjustable and features a quick-release buckle. Ideal for bike rides, concerts, and navigating crowded city streets with your essentials secure.",
        price: 1599, discount: 700, stock: 110,
        bgcolor: "#212121", panelcolor: "#000000", textcolor: "#e0e0e0", imagePrompt: ""
    },
    {
        name: "ShopSphere Gym & Turf Duffle 30L",
        category: "Duffel Bags",
        shortDescription: "Compact 30L sports duffle with a dedicated wet-pocket for sweaty gear.",
        description: "Your daily workout partner. This compact 30L duffle bag is perfectly sized for the gym locker. It features a unique waterproof internal pocket specifically designed for wet towels or sweaty clothes, keeping the rest of your gear dry. The side mesh pocket holds a shaker bottle perfectly. Made from tough ripstop polyester with a reinforced, water-resistant base. Includes both carry handles and a shoulder strap.",
        price: 1199, discount: 400, stock: 160,
        bgcolor: "#e0f2f1", panelcolor: "#004d40", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere GenZ Croc-Print Handbag",
        category: "Handbags",
        shortDescription: "Structured croc-embossed handbag with a modern geometric shape.",
        description: "A trendy take on a classic texture. This structured handbag features a bold crocodile-embossed pattern on a unique geometric silhouette. The rigid top handle gives it a chic, retro vibe, while the included long strap allows for casual crossbody wear. The interior is lined with vibrant contrast fabric and includes a zip divider. This piece instantly elevates casual denim or compliments formal evening wear.",
        price: 2799, discount: 1200, stock: 65,
        bgcolor: "#efebe9", panelcolor: "#3e2723", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Rider's Thigh Drop Leg Bag",
        category: "Sling Bags",
        shortDescription: "Tactical drop leg bag for motorcyclists and outdoor enthusiasts.",
        description: "Designed for the open road. This tactical leg bag securely straps to your waist and thigh, keeping your essentials accessible without restricting movement while riding a motorcycle or cycling. Made from durable, water-resistant Oxford fabric, it features multiple zip compartments for your phone, wallet, keys, and riding documents. The straps are fully adjustable and feature heavy-duty clips for quick removal.",
        price: 1499, discount: 600, stock: 50,
        bgcolor: "#eceff1", panelcolor: "#263238", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Quilted Velvet Wallet",
        category: "Wallets",
        shortDescription: "Luxurious velvet long wallet with gold-tone zip-around closure.",
        description: "Elegance in the palm of your hand. This long women's wallet is crafted from plush, quilted velvet fabric that feels incredible to the touch. The gold-tone zip-around closure keeps your valuables completely secure. Inside, you'll find 8 card slots, three full-length cash compartments, and a central zip pocket for coins. It's spacious enough to hold most smartphones, allowing it to double as a mini clutch for quick errands.",
        price: 1099, discount: 400, stock: 130,
        bgcolor: "#f3e5f5", panelcolor: "#4a148c", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Active Laptop Messenger",
        category: "Messenger Bags",
        shortDescription: "Sporty, lightweight messenger bag for 15.6-inch laptops.",
        description: "A modern alternative to the traditional briefcase. This sporty messenger bag is made from lightweight, scratch-resistant nylon. It features a padded laptop compartment, a large main section for files and books, and a front organizer flap with a secure buckle closure. The wide shoulder strap features a sliding comfort pad. Perfect for college students and young professionals who prefer a casual, active aesthetic.",
        price: 1799, discount: 700, stock: 85,
        bgcolor: "#e3f2fd", panelcolor: "#0d47a1", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Weekend Trekker 45L Rucksack",
        category: "Backpacks",
        shortDescription: "Ergonomic 45L rucksack with top-loading design for weekend treks.",
        description: "Ready for the trails. This 45L rucksack features a classic top-loading design with a drawstring closure under a secure hood. The hood includes a zip pocket for quick access to maps or snacks. The ergonomic back system features metal stays for support, thick breathable padding, and an adjustable waist belt to transfer weight off your shoulders. Includes gear loops for trekking poles and a bottom compartment for a sleeping bag.",
        price: 3499, discount: 1600, stock: 60,
        bgcolor: "#f1f8e9", panelcolor: "#33691e", textcolor: "#ffffff", imagePrompt: ""
    },

    // --- Myntra Inspired (Fashion-Forward, Premium, Lifestyle) ---
    {
        name: "ShopSphere Signature Monogram Tote",
        category: "Tote Bags",
        shortDescription: "Chic structured tote featuring a subtle all-over brand monogram pattern.",
        description: "A true statement piece for the fashion-conscious. This structured tote features a subtle, elegant monogram pattern embossed across the premium PU leather exterior. The spacious interior is lined with soft microsuede and includes a secure central zip divider. The slim, rolled top handles rest comfortably on the shoulder, and polished gold-tone hardware adds a touch of luxury. Protective metal feet on the base keep the bag pristine.",
        price: 3999, discount: 1500, stock: 55,
        bgcolor: "#efebe9", panelcolor: "#4e342e", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Ruched Cloud Handbag",
        category: "Handbags",
        shortDescription: "Ultra-trendy soft ruched handbag with a magnetic frame closure.",
        description: "Embrace the 'cloud bag' trend. This ultra-soft handbag features a gathered, ruched design crafted from buttery-smooth vegan leather. The concealed magnetic frame closure snaps shut satisfyingly, keeping the silhouette clean and modern. Despite its soft appearance, the flat base provides stability. It comes with a thick, matching leather shoulder strap and a delicate gold chain for versatile styling. Perfect for brunch dates and evening events.",
        price: 2999, discount: 1100, stock: 75,
        bgcolor: "#e0f7fa", panelcolor: "#006064", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Woven Vegan Leather Crossbody",
        category: "Crossbody Bags",
        shortDescription: "Intricately hand-woven crossbody bag with a slim, elegant profile.",
        description: "Showcasing exquisite craftsmanship, this crossbody bag features an intricate basket-weave design using strips of premium vegan leather. The slim, rectangular profile is surprisingly spacious, easily accommodating a large phone, wallet, and keys. The interior is fully lined with soft fabric. The thin, adjustable strap allows for comfortable crossbody wear. A sophisticated accessory that adds texture and interest to minimalist outfits.",
        price: 2499, discount: 900, stock: 60,
        bgcolor: "#fff3e0", panelcolor: "#e65100", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Minimalist Flap Backpack",
        category: "Backpacks",
        shortDescription: "Sleek faux-leather city backpack with a magnetic flap closure.",
        description: "A backpack designed for the fashion-forward city dweller. Ditching the sporty aesthetic, this bag is crafted from smooth faux leather with clean, architectural lines. The main compartment secures with a drawstring and is covered by a sleek flap with a hidden magnetic closure. Inside, a padded sleeve protects a 13-inch laptop. The slim shoulder straps are fully adjustable. Perfect for seamlessly transitioning from the office to after-work drinks.",
        price: 3299, discount: 1200, stock: 45,
        bgcolor: "#fce4ec", panelcolor: "#880e4f", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Dome Satchel Bag",
        category: "Handbags",
        shortDescription: "Classic dome-shaped satchel with dual handles and gold-tone hardware.",
        description: "Timeless elegance redefined. This classic dome satchel features a rigid, curved silhouette that maintains its shape beautifully. Crafted from saffiano-textured PU leather, it resists scratches and scuffs, ensuring long-lasting pristine looks. The two-way top zip opens fully for easy access to the spacious, lined interior. It features sturdy rolled handles for carrying on the crook of your arm, plus a detachable strap for shoulder wear.",
        price: 3499, discount: 1400, stock: 50,
        bgcolor: "#e8eaf6", panelcolor: "#1a237e", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Luxe Suede Messenger",
        category: "Messenger Bags",
        shortDescription: "Premium faux-suede messenger bag with a soft, unstructured feel.",
        description: "A relaxed, bohemian take on the messenger bag. Crafted from incredibly soft faux suede, this bag features a slouchy, unstructured design that drapes beautifully against the body. The large front flap is unadorned, allowing the rich texture of the suede to take center stage. Inside, a zip pocket and two slip pockets keep you organized. The wide strap is comfortable for all-day wear. A perfect pairing with casual denim or flowy dresses.",
        price: 2799, discount: 1000, stock: 65,
        bgcolor: "#efebe9", panelcolor: "#3e2723", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Geometric Envelope Wallet",
        category: "Wallets",
        shortDescription: "Sleek envelope-style wallet with bold color-blocking design.",
        description: "A wallet that doubles as a miniature work of art. This envelope-style clutch wallet features a striking geometric color-blocked design in complementary pastel tones. The pointed flap secures with a concealed snap closure. The well-organized interior includes 12 card slots, two bill compartments, and a zippered coin pocket. The slim, elegant profile makes it a joy to carry, whether slipped into a tote or held on its own.",
        price: 1299, discount: 500, stock: 110,
        bgcolor: "#fff8e1", panelcolor: "#f57f17", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Round Cane Crossbody",
        category: "Crossbody Bags",
        shortDescription: "Hand-woven natural cane circular bag with a beautiful batik lining.",
        description: "Embrace resort-wear vibes every day. This stunning circular crossbody is hand-woven by artisans using natural cane. The rigid structure protects your belongings, while the genuine leather strap and snap closure add a touch of premium contrast. The interior is lined with a beautiful, authentic Batik print fabric, ensuring the bag looks as good inside as it does outside. The perfect accessory for summer dresses and beach holidays.",
        price: 1999, discount: 600, stock: 40,
        bgcolor: "#f1f8e9", panelcolor: "#33691e", textcolor: "#ffffff", imagePrompt: ""
    },
    {
        name: "ShopSphere Quilted Nylon Duffle",
        category: "Duffel Bags",
        shortDescription: "Chic and lightweight quilted duffle, perfect for weekend getaways.",
        description: "Travel in style without the weight. This weekend duffle bag is crafted from silky-smooth, lightweight nylon with an elegant diamond quilted pattern. The spacious interior can easily hold 2-3 days of clothing and toiletries. It features a trolley sleeve on the back, allowing it to slide securely over your suitcase handle for effortless airport navigation. Finished with premium metallic zippers and faux-leather trim.",
        price: 2899, discount: 1000, stock: 70,
        bgcolor: "#212121", panelcolor: "#000000", textcolor: "#e0e0e0", imagePrompt: ""
    },
    {
        name: "ShopSphere Mini Bucket Bag",
        category: "Handbags",
        shortDescription: "Trendy mini bucket bag in smooth leather finish with drawstring closure.",
        description: "The classic bucket bag, miniaturized for modern trends. This adorable mini bucket bag is crafted from smooth, high-quality PU leather. The top secures with a thick leather drawstring that doubles as a decorative element. Despite its small footprint, the circular base allows it to hold a surprising amount, including a phone, small wallet, keys, and makeup essentials. Includes a rigid top handle and a detachable crossbody strap.",
        price: 2199, discount: 800, stock: 85,
        bgcolor: "#fce8f0", panelcolor: "#c2185b", textcolor: "#ffffff", imagePrompt: ""
    }
];

extraProducts.forEach(p => {
    p.id = nextId++;
    p.imagePrompt = ""; // Leave blank, downloader script will generate it based on name/category
    products.push(p);
});

fs.writeFileSync(filepath, JSON.stringify(products, null, 2));
console.log(`Successfully added ${extraProducts.length} Amazon/Flipkart/Myntra inspired bags.`);
console.log(`Total products in catalog: ${products.length}`);
