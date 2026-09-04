require('dotenv').config();
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./config/mongoose-connection');

const indexRouter = require('./routes/index');
const ownerRouter = require('./routes/ownerRouter');
const sellerRouter = require('./routes/sellerRouter');
const usersRouter = require('./routes/userRouter');
const productsRouter = require('./routes/productsRouter');
const paymentRouter = require("./routes/paymentRouter");
const aiRouter = require("./routes/aiRouter");



const cors = require('cors');
const apiRouter = require('./routes/apiRouter');
const fs = require('fs');

const expressSession = require('express-session');
const flash = require('connect-flash');

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

app.use(cors({
    origin: function(origin, callback) {
        // If in production, you might want to restrict this to your actual Railway domain
        // For a combined deployment (React served by Express), origin might be undefined
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}));

app.use(expressSession({
    secret: process.env.EXPRESS_SESSION_SECRET || 'shopsphere_secret_session',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve React client build if exists
const clientDistPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
}

app.set('view engine', 'ejs');

// API Routes
app.use('/api', apiRouter);
app.use('/payment', paymentRouter);
app.use('/ai', aiRouter);

// PDF Invoice and specialized routes
app.get('/orders/:id/invoice', indexRouter);
app.get('/sellers/orders/:id/invoice', sellerRouter);
app.get('/owners/orders/:id/invoice', ownerRouter);

// Legacy POST actions and auth routes
app.use('/users', usersRouter);
app.use('/products', productsRouter);

// SPA client serving for HTML requests
app.use(function(req, res, next) {
    if (fs.existsSync(path.join(clientDistPath, 'index.html')) && req.accepts('html') && req.method === 'GET') {
        return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
});

// Fallback to legacy EJS routes if SPA dist is not present
app.use('/', indexRouter);
app.use('/owners', ownerRouter);
app.use('/sellers', sellerRouter);

// 404 handler
app.use(function(req, res) {
    if (req.accepts('json') || req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Resource not found' });
    }
    if (fs.existsSync(path.join(clientDistPath, 'index.html')) && req.accepts('html')) {
        return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    res.status(404).render('404', { loggedin: false });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;