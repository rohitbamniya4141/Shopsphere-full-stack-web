const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middlewares/isLoggedIn');
const productModel = require('../models/product-model');
const userModel = require('../models/user-model');




router.get('/', (req, res) => {
  let error = req.flash('error');
  res.render('index', { error: error, loggedin: false });
});
router.get('/shop', isLoggedIn, async function(req, res) {

    let success = req.flash("success");

    // Read Query Parameters
    const search = req.query.search || "";
    const sort = req.query.sort || "popular";
    const price = req.query.price || "";

    // Dynamic Query
    let query = {
        name: {
            $regex: search,
            $options: "i"
        }
    };

    // Price Filter
    if(price === "0-1000"){
        query.price = {
            $gte: 0,
            $lte: 1000
        };
    }
    else if(price === "1000-3000"){
        query.price = {
            $gte: 1000,
            $lte: 3000
        };
    }
    else if(price === "3000+"){
        query.price = {
            $gte: 3000
        };
    }

    // Sorting
    let sortOption = {};

    if(sort === "price-low"){
        sortOption = { price: 1 };
    }
    else if(sort === "price-high"){
        sortOption = { price: -1 };
    }
    else if(sort === "newest"){
        sortOption = { createdAt: -1 };
    }

    // Fetch Products
    const products = await productModel
        .find(query)
        .sort(sortOption);

    // Render Page
    res.render("shop",{
        products,
        success,
        search,
        sort,
        price,
        loggedin: true
    });

});

router.get('/cart',isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({email : req.user.email}).populate('cart');
  
  let bill = 0;
  if(user.cart.length > 0){
    user.cart.forEach(item => {
      bill += Number(item.price) - Number(item.discount || 0);
    });
    bill += 20; // platform fee (once, not per item)
  }

  res.render("cart", {
        user,
        bill,
        loggedin: true
    });
});


router.get('/add-to-cart/:id',isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({email : req.user.email});
  user.cart.push(req.params.id);
  await user.save();
  req.flash('success', 'Product added to cart successfully');
  res.redirect('/shop');
});

router.get('/remove-from-cart/:id',isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({email : req.user.email});
  let index = user.cart.indexOf(req.params.id);
  if(index !== -1){
    user.cart.splice(index, 1);
    await user.save();
  }
  req.flash('success', 'Product removed from cart');
  res.redirect('/cart');
});

router.get('/logout', isLoggedIn, (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

const orderModel = require('../models/order-model');

router.get('/place-order', isLoggedIn, async function(req, res){

    let user = await userModel
        .findOne({ email: req.user.email })
        .populate("cart");

    if(user.cart.length === 0){
        req.flash("error", "Cart is empty");
        return res.redirect("/cart");
    }

    let totalAmount = 0;

    user.cart.forEach(function(product){
        totalAmount += product.price - product.discount;
    });

    let order = await orderModel.create({
        user: user._id,
        products: user.cart.map(product => product._id),
        totalAmount
    });

    user.orders.push(order._id);

    user.cart = [];

    await user.save();

    req.flash("success", "Order placed successfully");

    res.redirect("/shop");
});
  

router.get('/orders', isLoggedIn, async function(req, res){

    let user = await userModel
        .findOne({ email: req.user.email })
        .populate({
            path: 'orders',
            populate: {
                path: 'products'
            }
        });

    res.render('orders', {
        user,
        loggedin: true
    });
});

router.get('/profile', isLoggedIn, async function(req, res){

    let user = await userModel
        .findOne({ email: req.user.email })
        .populate('cart')
        .populate('orders');

    res.render('profile', {
        user,
        loggedin: true
    });
});

module.exports = router;
