const express = require('express');
const router = express.Router();
const ownerModel = require('../models/owner-model');
const productModel = require('../models/product-model');
const { isValidObjectId } = require('mongoose');
const orderModel = require('../models/order-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const{generateToken} = require('../utils/generateToken');

const userModel = require('../models/user-model');
const isOwnerLoggedIn = require('../middlewares/isOwnerLoggedIn');


router.get('/', (req, res) => {
    res.send('Owner route is working!');
});

if(process.env.NODE_ENV === "development"){
    router.post('/create', async function(req, res){
        let owners = await ownerModel.find({});
        if(owners.length > 0){
            return res.status(402).send("You dont have permission to create owner")
        }
        const {fullname, email, password} = req.body;

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            let createdOwner = await ownerModel.create({
                        fullname,
                        email,
                        password: hash,
                    })
         res.status(202).send(createdOwner);
    });
}

router.get('/login', (req, res) => {
    let error = req.flash('error');
    res.render('owner-login', { error, loggedin: false });
});

router.post('/login', async function(req, res){
    try{
        let {email, password} = req.body;

        if(!email || !password){
            req.flash('error', 'Email and password are required');
            return res.redirect('/owners/login');
        }

        let owner = await ownerModel.findOne({email: email});
        if(!owner){
            req.flash('error', 'Email or password is incorrect');
            return res.redirect('/owners/login');
        }

        let result = await bcrypt.compare(password, owner.password);
        if(result){
            let token = generateToken(owner);
            res.cookie("ownerToken", token);
            res.redirect("/owners/dashboard");
        }
        else{
            req.flash('error', 'Email or password is incorrect');
            res.redirect('/owners/login');
        }
    }catch(err){
        console.log(err.message);
        req.flash('error', 'Something went wrong, please try again');
        res.redirect('/owners/login');
    }
});

router.get('/admin', isOwnerLoggedIn, async function(req, res){

    let success = req.flash("success");

    const products = await productModel.find();

    const totalProducts = await productModel.countDocuments();

    const totalOrders = await orderModel.countDocuments();

    const orders = await orderModel.find();

    const revenue = orders.reduce((sum, order) => {
        return sum + order.totalAmount;
    }, 0);

    res.render("createproducts",{
        success,
        products,
        totalProducts,
        totalOrders,
        revenue,
        loggedin:true
    });

});

router.get('/delete/:id', isOwnerLoggedIn, async function(req, res){

    try{

        await productModel.findByIdAndDelete(req.params.id);

        req.flash("success","Product deleted successfully");

        res.redirect("/owners/admin");

    }catch(err){

        console.log(err);

        res.send(err);

    }

});

router.get('/edit/:id', isOwnerLoggedIn, async function(req, res){

    let product = await productModel.findById(req.params.id);

    res.render('editproduct', {
        product,
        loggedin: true
    });

});

router.post('/edit/:id', isOwnerLoggedIn, async function(req, res){

    let {name, price, discount, bgcolor, panelcolor, textcolor} = req.body;

    await productModel.findByIdAndUpdate(req.params.id, {

        name,
        price,
        discount,
        bgcolor,
        panelcolor,
        textcolor

    });

    req.flash('success', 'Product updated successfully');

    res.redirect('/owners/admin');

});

router.get("/dashboard", isOwnerLoggedIn, async (req, res) => {

    const totalProducts = await productModel.countDocuments();
    const totalOrders = await orderModel.countDocuments();
    const totalCustomers = await userModel.countDocuments();

    const orders = await orderModel.find();
    const revenue = orders.reduce((sum, order) => {
        return sum + order.totalAmount;
    }, 0);

    res.render("owner-dashboard",{
        loggedin:true,
        isAdmin:true,
        totalProducts,
        totalOrders,
        totalCustomers,
        revenue
    });

});

router.get('/products', isOwnerLoggedIn, async function(req, res){
    let success = req.flash("success");
    const products = await productModel.find().sort({ createdAt: -1 });
    res.render('admin-products', {
        products,
        success,
        loggedin: true
    });
});

router.get('/orders', isOwnerLoggedIn, async function(req, res){
    const orders = await orderModel.find()
        .populate('user')
        .populate('products')
        .sort({ createdAt: -1 });
    res.render('admin-orders', {
        orders,
        loggedin: true
    });
});

router.get('/users', isOwnerLoggedIn, async function(req, res){
    const users = await userModel.find().select('-password');
    res.render('admin-customers', {
        users,
        loggedin: true
    });
});

router.get('/logout', (req, res) => {
    res.clearCookie('ownerToken');
    res.redirect('/owners/login');
});

module.exports = router;