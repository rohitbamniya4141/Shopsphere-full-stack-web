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



const expressSession = require('express-session');
const flash = require('connect-flash');


app.use(expressSession({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use('/', indexRouter);
app.use('/owners',ownerRouter);
app.use('/sellers',sellerRouter);
app.use('/users',usersRouter);
app.use('/products',productsRouter);
app.use('/payment', paymentRouter);
app.use('/ai', aiRouter);

// 404 catch-all
app.use(function(req, res){
    res.status(404).render('404', { loggedin: false });
});

app.listen(3000);