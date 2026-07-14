const express = require('express');
const router = express.Router();

const upload = require('../config/multer-config');
const productModel = require('../models/product-model');
const isOwnerLoggedIn = require('../middlewares/isOwnerLoggedIn');

router.post('/create', isOwnerLoggedIn, upload.single('image'), async function(req, res){
    let {name,price, discount, category, stock, bgcolor, panelcolor, textcolor} = req.body;
    try{
        let imageString = '';
        if (req.file) {
            imageString = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }
        let product = await productModel.create({
        image: imageString,
        name,
        price,
        discount,
        category: category || 'General',
        stock: stock || 0,
        bgcolor,
        panelcolor,
        textcolor
        });
        req.flash('success', 'Product created successfully');
        res.redirect("/owners/admin");
    } catch (error) {
        res.send(error);
    }
});

router.get('/', (req, res) => {
    res.send('product route is working!');
});

module.exports = router;