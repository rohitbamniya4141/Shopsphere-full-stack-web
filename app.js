const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./config/mongoose-connection');

const ownerRouter = require('./routes/ownerRouter');
const usersRouter = require('./routes/userRouter');
const productsRouter = require('./routes/productsRouter');


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use('/owner',ownerRouter);
app.use('/users',usersRouter);
app.use('/products',productsRouter);

app.get('/', (req, res) => {
   res.send('Welcome to ShopSphere!');
});

app.listen(3000);