const express = require('express');
const router = express.Router();
const ownerModel = require('../models/owner-Model');
const productModel = require('../models/product-model');
const { isValidObjectId } = require('mongoose');
const orderModel = require('../models/order-model');

const isLoggedIn = require('../middlewares/isLoggedIn');
const isAdmin = require('../middlewares/isAdmin');


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
            let createdOwner = await ownerModel.create({
                        fullname,
                        email,
                        password,
                    })
         res.status(202).send(createdOwner);
    });
}
router.get('/admin', isLoggedIn, isAdmin, async function(req, res){

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

router.get('/delete/:id',isLoggedIn, isAdmin, async function(req, res){

    try{

        await productModel.findByIdAndDelete(req.params.id);

        req.flash("success","Product deleted successfully");

        res.redirect("/owners/admin");

    }catch(err){

        console.log(err);

        res.send(err);

    }

});

router.get('/edit/:id',isLoggedIn, isAdmin, async function(req, res){

    let product = await productModel.findById(req.params.id);

    res.render('editproduct', {
        product,
        loggedin: true
    });

});

router.post('/edit/:id',isLoggedIn, isAdmin, async function(req, res){

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

module.exports = router;