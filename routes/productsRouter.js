const express = require('express');
const router = express.Router();

const upload = require('../config/multer-config');
const productModel = require('../models/product-model');

router.post('/create', upload.single('image'), async function(req, res){
    let {name,price, discount, bgColor, panelColor, textColor} = req.body;
    try{
        let product = await productModel.create({
        image: req.file.buffer,
        name,
        price,
        discount,
        bgColor,
        panelColor,
        textColor
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