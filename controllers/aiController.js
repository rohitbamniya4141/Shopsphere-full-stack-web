const { GoogleGenerativeAI } = require('@google/generative-ai');
const productModel = require('../models/product-model');
const reviewModel = require('../models/review-model');
const orderModel = require('../models/order-model');
const sellerModel = require('../models/seller-model');

// ===== Lazy Gemini Initialization =====
let genAI = null;
let model = null;

function getModel() {
    if (!model) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured');
        }
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
    return model;
}

// ===== System Prompt =====
const SYSTEM_PROMPT = `You are ShopSphere AI — a warm, friendly personal shopping assistant for ShopSphere, a premium bag store in India.

PERSONALITY:
- Be conversational, warm and helpful — like a real store assistant standing next to the customer.
- Use emojis naturally but not excessively (1-2 per message).
- Keep responses concise and scannable (under 200 words).

LANGUAGE RULES (CRITICAL):
- Auto-detect the user's language: English, Hindi, or Hinglish.
- ALWAYS reply in the SAME language the user used.
- If user writes in Hindi/Hinglish → respond in Hindi/Hinglish.
- If user writes in English → respond in English.
- Examples:
  User: "Mujhe office bag chahiye" → Reply in Hinglish.
  User: "Show me backpacks" → Reply in English.

CONVERSATION FLOW:
1. GREETINGS (hi, hello, hey, namaste, kaise ho):
   Respond warmly and show options:
   "Hi 👋 Main ShopSphere AI hoon! Kaise help karun?
   🎒 Backpacks
   👜 Handbags
   🎁 Gift Suggestions
   💼 Office Bags
   💰 Budget Picks"
   (Use English version if user greeted in English)

2. VAGUE QUERIES (only a category, no budget/details):
   Do NOT recommend immediately. Ask ONE clarifying question:
   "Sure! 😊 What's your approximate budget?
   • Under ₹2,000
   • ₹2,000 – ₹4,000
   • Above ₹4,000"

3. SPECIFIC QUERIES (category + budget + preferences):
   NOW recommend products with reasoning.

4. FOLLOW-UPS ("cheaper ones", "more options", a budget number, a color):
   Use conversation history to understand what the user wants, and respond naturally.

RECOMMENDATION FORMAT (always use this):
"I recommend **[Product Name]** (sold by [Seller Name]) because:
✓ Fits your ₹X,XXX budget
✓ [key feature relevant to their need]
✓ ₹XXX discount available
✓ X units in stock
✓ Rated X.X/5 by customers

**Why I recommend this:** [one sentence personal reason]"

COMPARISON FORMAT (when user says "compare X and Y"):
"📊 **Comparison**

| Feature | [Product A] | [Product B] |
|---|---|---|
| 💰 Price | ₹X,XXX | ₹Y,YYY |
| 🏷️ Discount | ₹X off | ₹Y off |
| ⭐ Rating | X.X/5 | Y.Y/5 |
| 📦 Stock | X units | Y units |
| 🏷️ Category | A | B |

**Best For:** ...
**🏆 Winner:** [Product] because..."

INTELLIGENT FALLBACK:
- If NO exact match exists, NEVER just say "no products found".
- Always recommend the CLOSEST alternatives:
  "We don't currently have a dedicated [X] under ₹[Y]. But here are some great alternatives that might work..."

ANALYTICS / POPULARITY QUESTIONS:
- "Which is most popular?", "Best seller?", "Most bought?" → Answer using the product data provided (ratings and stock as indicators).
- If insufficient data: "I don't have detailed sales data right now, but based on ratings and availability, here are our top picks..."

STRICT RULES:
1. ONLY answer about ShopSphere products and shopping.
2. Use ONLY the product data provided below. NEVER invent products.
3. For unrelated questions (coding, celebrities, science, math):
   English: "I'm ShopSphere AI — I can only help you with shopping and our products! 🛍️"
   Hindi: "Main ShopSphere AI hoon — sirf shopping mein help kar sakta hoon! 🛍️"
4. Format prices as ₹X,XXX (Indian format).
5. Warn if stock is low (under 5 units): "⚠️ Only X left!"
6. Always mention discounts when a product has one.

AVAILABLE PRODUCTS:
{PRODUCTS}

If the product list is empty, suggest the user browse /shop or try different keywords.`;

// ===== Category Keyword Mappings =====
const CATEGORY_KEYWORDS = {
    // English
    'handbag': 'Handbags',
    'handbags': 'Handbags',
    'hand bag': 'Handbags',
    'purse': 'Handbags',
    'backpack': 'Backpacks',
    'backpacks': 'Backpacks',
    'back pack': 'Backpacks',
    'rucksack': 'Backpacks',
    'laptop bag': 'Backpacks',
    'laptop': 'Backpacks',
    'school bag': 'Backpacks',
    'college bag': 'Backpacks',
    'clutch': 'Clutches',
    'clutches': 'Clutches',
    'evening bag': 'Clutches',
    'tote': 'Tote Bags',
    'tote bag': 'Tote Bags',
    'tote bags': 'Tote Bags',
    'shopper': 'Tote Bags',
    'crossbody': 'Crossbody',
    'cross body': 'Crossbody',
    'sling': 'Crossbody',
    'sling bag': 'Crossbody',
    'messenger': 'Crossbody',
    'wallet': 'Wallets',
    'wallets': 'Wallets',
    'card holder': 'Wallets',
    // Hindi / Hinglish
    'haath bag': 'Handbags',
    'haath ka bag': 'Handbags',
    'peeth bag': 'Backpacks',
    'peeth ka bag': 'Backpacks',
    'batua': 'Wallets',
    'thaila': 'Tote Bags',
    'jhola': 'Tote Bags',
};

// ===== Use Case → Category Mappings =====
const USE_CASE_MAP = {
    // English
    'travel': ['Backpacks', 'Tote Bags'],
    'travelling': ['Backpacks', 'Tote Bags'],
    'vacation': ['Backpacks', 'Tote Bags'],
    'trip': ['Backpacks', 'Tote Bags'],
    'hiking': ['Backpacks'],
    'office': ['Handbags', 'Crossbody', 'Tote Bags'],
    'work': ['Handbags', 'Crossbody', 'Tote Bags'],
    'formal': ['Handbags', 'Clutches'],
    'professional': ['Handbags', 'Tote Bags'],
    'college': ['Backpacks', 'Crossbody'],
    'school': ['Backpacks'],
    'university': ['Backpacks', 'Crossbody'],
    'student': ['Backpacks', 'Crossbody'],
    'party': ['Clutches', 'Handbags'],
    'evening': ['Clutches'],
    'wedding': ['Clutches', 'Handbags'],
    'date': ['Clutches', 'Handbags', 'Crossbody'],
    'casual': ['Crossbody', 'Tote Bags', 'Backpacks'],
    'daily': ['Crossbody', 'Tote Bags'],
    'daily use': ['Crossbody', 'Tote Bags'],
    'everyday': ['Crossbody', 'Tote Bags'],
    'gym': ['Backpacks', 'Tote Bags'],
    'fashion': ['Handbags', 'Clutches', 'Crossbody'],
    'stylish': ['Handbags', 'Clutches', 'Crossbody'],
    'trendy': ['Handbags', 'Clutches', 'Crossbody'],
    'luxury': ['Handbags', 'Clutches'],
    'premium': ['Handbags', 'Clutches'],
    'gift': null,
    'present': null,
    'gift for sister': null,
    'gift for mother': null,
    'gift for mom': null,
    'gift for wife': null,
    'gift for girlfriend': null,
    'gift for friend': null,
    'gift for her': null,
    'gift for him': ['Backpacks', 'Wallets'],
    'gift for brother': ['Backpacks', 'Wallets'],
    'gift for dad': ['Backpacks', 'Wallets'],
    'gift for father': ['Backpacks', 'Wallets'],
    // Hindi / Hinglish
    'safar': ['Backpacks', 'Tote Bags'],
    'yatra': ['Backpacks', 'Tote Bags'],
    'ghoomne': ['Backpacks', 'Tote Bags'],
    'padhne': ['Backpacks', 'Crossbody'],
    'padhai': ['Backpacks', 'Crossbody'],
    'kaam': ['Handbags', 'Crossbody', 'Tote Bags'],
    'daftar': ['Handbags', 'Crossbody', 'Tote Bags'],
    'shaadi': ['Clutches', 'Handbags'],
    'tohfa': null,
    'behan ke liye': null,
    'sister ke liye': null,
    'maa ke liye': null,
    'mom ke liye': null,
    'bhai ke liye': ['Backpacks', 'Wallets'],
    'dost ke liye': null,
    'friend ke liye': null,
};

// ===== Greeting Patterns =====
const GREETING_PATTERNS = /^(hi|hello|hey|hii+|helloo+|hola|namaste|namaskar|namaskaar|kaise ho|how are you|good morning|good evening|good afternoon|howdy|sup|yo)\b/i;

// ===== Intent Extraction (Pure JS — no AI cost) =====
function extractIntent(message) {
    const msg = message.toLowerCase().trim();

    const intent = {
        category: null,
        categories: [],
        minPrice: null,
        maxPrice: null,
        keywords: [],
        wantsDiscount: false,
        wantsComparison: false,
        compareNames: [],
        wantsBestRated: false,
        wantsCheapest: false,
        wantsPremium: false,
        wantsPopular: false,
        isGreeting: false,
    };

    // Greeting detection
    if (GREETING_PATTERNS.test(msg)) {
        intent.isGreeting = true;
    }

    // 1. Category detection (longest match first)
    const sortedKeywords = Object.keys(CATEGORY_KEYWORDS).sort((a, b) => b.length - a.length);
    for (const keyword of sortedKeywords) {
        if (msg.includes(keyword)) {
            intent.category = CATEGORY_KEYWORDS[keyword];
            break;
        }
    }

    // 2. Use case detection (longest match first)
    if (!intent.category) {
        const sortedUseCases = Object.keys(USE_CASE_MAP).sort((a, b) => b.length - a.length);
        for (const useCase of sortedUseCases) {
            if (msg.includes(useCase)) {
                const categories = USE_CASE_MAP[useCase];
                if (categories) intent.categories = categories;
                break;
            }
        }
    }

    // 3. Price extraction
    // "between X and Y" / "X to Y" / "X se Y"
    const betweenMatch = msg.match(/(?:between|from|beech)?\s*(?:₹|rs\.?|inr)?\s*(\d+)\s*(?:to|and|se|aur|-|–)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
    if (betweenMatch) {
        intent.minPrice = parseInt(betweenMatch[1]);
        intent.maxPrice = parseInt(betweenMatch[2]);
    }

    // "under / below / less than / ke andar / se kam" X
    if (!intent.maxPrice) {
        const underMatch = msg.match(/(?:under|below|less than|within|max|upto|up to|budget of|budget|ke andar|se kam|tak|mein)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
        if (underMatch) intent.maxPrice = parseInt(underMatch[1]);
    }

    // "above / over / more than / se zyada" X
    if (!intent.minPrice) {
        const aboveMatch = msg.match(/(?:above|over|more than|min|at least|starting from|starting at|se zyada|se upar)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
        if (aboveMatch) intent.minPrice = parseInt(aboveMatch[1]);
    }

    // Standalone number with ₹/rs prefix → budget ceiling
    if (!intent.maxPrice && !intent.minPrice) {
        const standalonePrice = msg.match(/(?:₹|rs\.?)\s*(\d+)/i);
        if (standalonePrice) intent.maxPrice = parseInt(standalonePrice[1]);
    }

    // Just a plain number (like a follow-up "3000") → treat as budget
    if (!intent.maxPrice && !intent.minPrice && !intent.isGreeting) {
        const plainNumber = msg.match(/^\s*(\d{3,6})\s*$/);
        if (plainNumber) intent.maxPrice = parseInt(plainNumber[1]);
    }

    // 4. Preference flags
    if (/discount|sale|offer|deal|affordable|value|saving|sasta|saste|offer wala|chhota price/.test(msg)) {
        intent.wantsDiscount = true;
    }
    if (/best rated|highest rated|top rated|best review|highly rated|sabse accha|best wala|sabse acchi rating/.test(msg)) {
        intent.wantsBestRated = true;
    }
    if (/cheapest|lowest price|most affordable|budget|economical|inexpensive|sabse sasta|kam price|kam daam/.test(msg)) {
        intent.wantsCheapest = true;
    }
    if (/premium|luxury|luxurious|expensive|high.?end|best quality|finest|exclusive|mehnga|mehenga/.test(msg)) {
        intent.wantsPremium = true;
    }
    if (/popular|best sell|most bought|most ordered|trending|most sold|famous|sabse zyada bikne|lokpriya|sabse popular/.test(msg)) {
        intent.wantsPopular = true;
    }

    // 5. Comparison detection
    const compareMatch = msg.match(/compare\s+(.+?)\s+(?:and|vs\.?|versus|with|aur|se)\s+(.+?)(?:\.|$)/i);
    if (compareMatch) {
        intent.wantsComparison = true;
        intent.compareNames = [compareMatch[1].trim(), compareMatch[2].trim()];
    } else if (/\bcompare\b|\bvs\b|\bversus\b|difference between|dono mein|comparison/i.test(msg)) {
        intent.wantsComparison = true;
    }

    // 6. General keyword extraction (remove stop words)
    const stopWords = new Set([
        'i', 'me', 'my', 'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be',
        'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'can', 'need', 'want', 'looking',
        'for', 'show', 'find', 'get', 'give', 'some', 'any', 'please', 'thanks',
        'thank', 'you', 'something', 'good', 'nice', 'great', 'recommend',
        'suggest', 'help', 'with', 'of', 'in', 'on', 'at', 'to', 'from',
        'and', 'or', 'but', 'not', 'no', 'yes', 'what', 'which', 'that',
        'this', 'it', 'its', 'bag', 'bags', 'product', 'products', 'item',
        'items', 'one', 'ones', 'under', 'below', 'above', 'between', 'price',
        'priced', 'rs', 'inr', 'rupees', 'rupee', 'tell', 'about', 'like',
        'also', 'too', 'very', 'much', 'more', 'most', 'best', 'better',
        'hey', 'hi', 'hello', 'there', 'how',
        // Hindi stop words
        'mujhe', 'mujhko', 'mera', 'mere', 'hai', 'hain', 'tha', 'thi',
        'chahiye', 'chahie', 'dikhao', 'dikha', 'batao', 'bata', 'karo',
        'karna', 'kar', 'dedo', 'do', 'kuch', 'koi', 'ek', 'ke', 'ka',
        'ki', 'ko', 'se', 'mein', 'main', 'hoon', 'wala', 'wali', 'wale',
        'liye', 'acha', 'accha', 'acchi', 'aur', 'ya', 'par', 'nahi',
        'haa', 'nahin', 'kya', 'kaun', 'kaise', 'kidhar', 'yeh', 'woh',
        'suggest', 'recommendation'
    ]);
    const words = msg.replace(/[^\w\s]/g, '').split(/\s+/);
    intent.keywords = words.filter(w => w.length > 2 && !stopWords.has(w) && isNaN(w));

    return intent;
}

// ===== MongoDB Query Builder =====
function buildQuery(intent) {
    const query = { stock: { $gt: 0 } };

    if (intent.category) {
        query.category = intent.category;
    } else if (intent.categories.length > 0) {
        query.category = { $in: intent.categories };
    }

    if (intent.minPrice || intent.maxPrice) {
        query.price = {};
        if (intent.minPrice) query.price.$gte = intent.minPrice;
        if (intent.maxPrice) query.price.$lte = intent.maxPrice;
    }

    // Apply keyword regex only when no strong filters exist
    if (intent.keywords.length > 0 && !intent.category && intent.categories.length === 0) {
        query.name = { $regex: intent.keywords.join('|'), $options: 'i' };
    }

    return query;
}

// ===== Sort Option =====
function getSortOption(intent) {
    if (intent.wantsCheapest) return { price: 1 };
    if (intent.wantsPremium) return { price: -1 };
    if (intent.wantsDiscount) return { discount: -1 };
    return { createdAt: -1 };
}

// ===== Fetch Average Ratings =====
async function getProductRatings(productIds) {
    const ratings = await reviewModel.aggregate([
        { $match: { product: { $in: productIds } } },
        { $group: { _id: '$product', avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
    ]);
    const map = {};
    ratings.forEach(r => {
        map[r._id.toString()] = {
            avgRating: Math.round(r.avgRating * 10) / 10,
            totalReviews: r.totalReviews
        };
    });
    return map;
}

// ===== Fetch Popular Products (by order count) =====
async function getPopularProducts() {
    try {
        const popular = await orderModel.aggregate([
            { $unwind: '$products' },
            { $group: { _id: '$products', orderCount: { $sum: 1 } } },
            { $sort: { orderCount: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            { $match: { 'product.stock': { $gt: 0 } } }
        ]);
        return popular.map(function(item) {
            const p = item.product;
            p.orderCount = item.orderCount;
            return p;
        });
    } catch (err) {
        return [];
    }
}

// ===== Fetch Top Rated Products =====
async function getTopRatedProducts() {
    try {
        const topRated = await reviewModel.aggregate([
            { $group: { _id: '$product', avgRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
            { $match: { reviewCount: { $gte: 1 } } },
            { $sort: { avgRating: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            { $match: { 'product.stock': { $gt: 0 } } }
        ]);
        return topRated.map(function(item) {
            const p = item.product;
            return p;
        });
    } catch (err) {
        return [];
    }
}

// ===== Format Products for Gemini (minimal, no sensitive data) =====
function formatProductsForAI(products, ratingMap) {
    if (products.length === 0) return 'No products match the current criteria.';

    return products.map((p, i) => {
        const rating = ratingMap[p._id.toString()];
        const effectivePrice = p.price - (p.discount || 0);
        const sellerName = p.seller && p.seller.shopName ? p.seller.shopName : 'ShopSphere Official';
        return `${i + 1}. ${p.name}
   Price: ₹${p.price}${p.discount > 0 ? ` (₹${p.discount} off → Pay ₹${effectivePrice})` : ''}
   Category: ${p.category}
   Sold by: ${sellerName}
   In Stock: ${p.stock} units${p.stock < 5 ? ' ⚠️ LOW STOCK' : ''}
   Rating: ${rating ? `${rating.avgRating}/5 (${rating.totalReviews} reviews)` : 'No reviews yet'}`;
    }).join('\n\n');
}

// ===== Main Chat Handler =====
exports.chat = async function(req, res) {
    try {
        const { message, history } = req.body;

        // Validate input
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.json({
                reply: "Please ask me something about our products! 🛍️",
                products: []
            });
        }

        if (message.trim().length > 500) {
            return res.json({
                reply: "That message is a bit long! Could you keep it shorter? 😊",
                products: []
            });
        }

        const userMessage = message.trim();

        // Step 1: Extract intent
        const intent = extractIntent(userMessage);

        // Step 2: MongoDB search
        let products = [];

        if (intent.isGreeting) {
            // For greetings, send top 5 products as general context
            products = await productModel
                .find({ stock: { $gt: 0 } })
                .select('-image -bgcolor -panelcolor -textcolor')
                .populate('seller', 'shopName')
                .sort({ createdAt: -1 })
                .limit(5);

        } else if (intent.wantsPopular) {
            // Fetch most ordered products
            products = await getPopularProducts();
            if (products.length === 0) {
                // Fallback to newest
                products = await productModel
                    .find({ stock: { $gt: 0 } })
                    .select('-image -bgcolor -panelcolor -textcolor')
                    .populate('seller', 'shopName')
                    .sort({ createdAt: -1 })
                    .limit(5);
            }

        } else if (intent.wantsBestRated) {
            // Fetch highest rated products
            products = await getTopRatedProducts();
            if (products.length === 0) {
                products = await productModel
                    .find({ stock: { $gt: 0 } })
                    .select('-image -bgcolor -panelcolor -textcolor')
                    .populate('seller', 'shopName')
                    .sort({ createdAt: -1 })
                    .limit(5);
            }

        } else if (intent.wantsComparison && intent.compareNames.length === 2) {
            // Comparison: fetch both products by name
            const [p1, p2] = await Promise.all([
                productModel.findOne({ name: { $regex: intent.compareNames[0], $options: 'i' } })
                    .select('-image -bgcolor -panelcolor -textcolor')
                    .populate('seller', 'shopName'),
                productModel.findOne({ name: { $regex: intent.compareNames[1], $options: 'i' } })
                    .select('-image -bgcolor -panelcolor -textcolor')
                    .populate('seller', 'shopName')
            ]);
            products = [p1, p2].filter(Boolean);

        } else {
            // Normal search with progressive broadening
            const query = buildQuery(intent);
            const sortOption = getSortOption(intent);

            products = await productModel
                .find(query)
                .select('-image -bgcolor -panelcolor -textcolor')
                .populate('seller', 'shopName')
                .sort(sortOption)
                .limit(5);

            // Broaden: try keyword search
            if (products.length === 0 && intent.keywords.length > 0) {
                products = await productModel
                    .find({
                        stock: { $gt: 0 },
                        name: { $regex: intent.keywords.join('|'), $options: 'i' }
                    })
                    .select('-image -bgcolor -panelcolor -textcolor')
                    .populate('seller', 'shopName')
                    .sort(sortOption)
                    .limit(5);
            }

            // Broaden: try just category
            if (products.length === 0 && (intent.category || intent.categories.length > 0)) {
                const catQuery = { stock: { $gt: 0 } };
                if (intent.category) catQuery.category = intent.category;
                else catQuery.category = { $in: intent.categories };

                products = await productModel
                    .find(catQuery)
                    .select('-image -bgcolor -panelcolor -textcolor')
                    .populate('seller', 'shopName')
                    .sort(sortOption)
                    .limit(5);
            }

            // Fallback: top 5 newest in-stock products
            if (products.length === 0) {
                products = await productModel
                    .find({ stock: { $gt: 0 } })
                    .select('-image -bgcolor -panelcolor -textcolor')
                    .populate('seller', 'shopName')
                    .sort({ createdAt: -1 })
                    .limit(5);
            }
        }

        // Step 3: Get ratings
        const productIds = products.map(p => p._id);
        const ratingMap = await getProductRatings(productIds);

        // Step 4: Format for Gemini
        const productsContext = formatProductsForAI(products, ratingMap);
        const systemPrompt = SYSTEM_PROMPT.replace('{PRODUCTS}', productsContext);

        // Step 5: Build conversation contents
        const contents = [];

        if (history && Array.isArray(history)) {
            history.slice(-6).forEach(function(msg) {
                contents.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                });
            });
        }

        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        // Step 6: Call Gemini
        const geminiModel = getModel();

        const result = await geminiModel.generateContent({
            contents,
            systemInstruction: systemPrompt,
            generationConfig: {
                temperature: 0.75,
                maxOutputTokens: 600,
                topP: 0.9,
            }
        });

        const reply = result.response.text();

        // Step 7: Return response
        const productData = products.map(function(p) {
            return {
                _id: p._id,
                name: p.name,
                price: p.price,
                discount: p.discount || 0,
                category: p.category,
                stock: p.stock,
                avgRating: ratingMap[p._id.toString()]?.avgRating || 0,
                totalReviews: ratingMap[p._id.toString()]?.totalReviews || 0
            };
        });

        res.json({ reply, products: productData });

    } catch (err) {
        console.error('AI Chat Error:', err.message);

        let errorMessage = "I'm having trouble right now. Please try again in a moment! 🙏";

        if (err.message && err.message.includes('API_KEY')) {
            errorMessage = "AI assistant is not configured yet. Please add your Gemini API key. 🔧";
        } else if (err.message && (err.message.includes('quota') || err.message.includes('rate') || err.message.includes('429'))) {
            errorMessage = "I'm getting too many questions! Please wait a few seconds and try again. ⏳";
        } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET') {
            errorMessage = "That took too long. Could you try asking again? ⏱️";
        }

        res.status(500).json({ reply: errorMessage, products: [] });
    }
};
