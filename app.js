const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./config/mongoose-connection');

const ownerRouter = require('./routes/ownerRouter');
const usersRouter = require('./routes/userRouter');
const productsRouter = require('./routes/productsRouter');

require('dotenv').config();


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

app.use('/owners',ownerRouter);
app.use('/users',usersRouter);
app.use('/products',productsRouter);

app.get('/', (req, res) => {
  res.render("index", {
    error: req.flash("error")
   });
});

app.listen(3000);