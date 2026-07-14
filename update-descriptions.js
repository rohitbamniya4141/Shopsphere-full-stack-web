const fs = require('fs');
const path = require('path');

const descriptions = [
  "A spacious premium duffel bag designed for weekend trips, gym sessions, and short vacations. Features a roomy main compartment, dedicated shoe compartment, waterproof base, reinforced grab handles, adjustable shoulder strap, and durable canvas construction for comfortable everyday travel.",
  "Built for long journeys and adventure travel, this rugged duffel features expandable storage, ballistic nylon construction, premium metal zippers, separate shoe compartment, padded shoulder strap, and multiple quick-access pockets for organized packing.",
  "A stylish rectangular weekender bag crafted with waterproof nylon and premium stitching. Includes spacious storage, luggage sleeve, organizer pockets, and comfortable carry handles, making it perfect for business trips and overnight stays.",
  "A compact airline-friendly cabin bag designed to fit overhead compartments. Features a padded laptop compartment, trolley sleeve, RFID-safe pocket, premium polyester construction, and organized storage for business travelers.",
  "Designed for trekking and outdoor adventures, this rugged duffel includes compression straps, reinforced stitching, waterproof exterior, breathable shoe compartment, and heavy-duty construction built for demanding travel conditions.",
  "A premium leather-look travel bag featuring a structured rectangular design, spacious packing area, luggage sleeve, premium carry handles, and elegant styling for professionals and frequent business travelers.",
  "A modern travel bag with expandable storage, multiple zip compartments, hidden anti-theft pocket, waterproof fabric, ergonomic shoulder strap, and practical organization for frequent travelers.",
  "A lightweight cabin duffel featuring premium waterproof fabric, adjustable shoulder strap, trolley sleeve, organized interior compartments, and compact dimensions ideal for airline travel.",
  "Built for explorers and backpackers, this spacious travel bag combines weather-resistant construction, reinforced handles, compression straps, and multiple storage compartments for outdoor adventures.",
  "A luxury weekender bag crafted using premium materials with elegant detailing, waterproof lining, spacious interior, luggage sleeve, and sophisticated styling for executive travelers.",
  "A sporty duffel featuring a ventilated shoe compartment, wet pocket, bottle holder, reinforced base, and adjustable shoulder strap, making it ideal for workouts and weekend travel.",
  "A lightweight sports travel bag with dedicated shoe storage, water-resistant fabric, front organizer pocket, reinforced carry handles, and spacious compartments for gym gear and travel essentials.",
  "A versatile duffel built for students and travelers with expandable storage, anti-theft pocket, premium polyester construction, durable zippers, and smart organization for everyday use.",
  "A professional-grade expedition bag featuring waterproof construction, separate shoe compartment, expandable storage, trolley sleeve, reinforced handles, and premium travel-focused organization.",
  "A flagship luxury travel bag offering a spacious interior, waterproof canvas construction, premium metal hardware, hidden valuables pocket, luggage sleeve, reinforced handles, and sophisticated modern styling."
];

const filePath = path.join(__dirname, 'data', 'products', 'travel-bags.json');
const bags = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Update descriptions
for (let i = 0; i < 15; i++) {
  if (bags[i]) {
    bags[i].description = descriptions[i];
  }
}

// Add Royal Enfield Bike Trip Bag
bags.push({
  "name": "Ladakh Terrain Rider",
  "price": 4599,
  "discount": 500,
  "category": "Travel Bags",
  "demographic": "Bikers & Adventurers",
  "description": "Engineered exclusively for motorcycle expeditions like Leh-Ladakh, this heavy-duty waterproof rider bag features secure mounting straps, dust-proof zippers, reflective panels, and a rugged ballistic nylon exterior to withstand extreme Himalayan weather.",
  "rating": 4.9,
  "reviews": 845,
  "stock": 12,
  "bestFor": ["Bike Trips", "Outdoor Expeditions"],
  "color": "Olive Green",
  "image": "/images/products/travel-bag16.jpg",
  "bgcolor": "#F3F4F6",
  "panelcolor": "#FFFFFF",
  "textcolor": "#111827",
  "specifications": {
    "capacity": "65L",
    "waterResistant": true,
    "usbCharging": false,
    "antiTheft": true,
    "weight": "1.8kg",
    "material": "Ballistic Nylon"
  }
});

// Add Big Aeroplane Suitcase Bag
bags.push({
  "name": "Global Explorer Suitcase",
  "price": 6499,
  "discount": 800,
  "category": "Travel Bags",
  "demographic": "International Travelers",
  "description": "A massive premium check-in suitcase crafted for international flights and cross-country relocation. Features a shatterproof polycarbonate shell, TSA-approved locks, 360-degree spinner wheels, organized packing cubes, and expandable volume for extended travel.",
  "rating": 4.8,
  "reviews": 1240,
  "stock": 8,
  "bestFor": ["International Flights", "Long Vacations"],
  "color": "Dark Grey",
  "image": "/images/products/travel-bag17.jpg",
  "bgcolor": "#F3F4F6",
  "panelcolor": "#FFFFFF",
  "textcolor": "#111827",
  "specifications": {
    "capacity": "100L",
    "waterResistant": true,
    "usbCharging": true,
    "antiTheft": true,
    "weight": "4.5kg",
    "material": "Polycarbonate"
  }
});

fs.writeFileSync(filePath, JSON.stringify(bags, null, 2));
console.log('Successfully updated travel-bags.json with descriptions and new bags!');
