const express = require('express');
const router = express.Router();
const ownerModel = require('../models/owner-Model');

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

router.get('/admin', async function(req, res){
    let success = req.flash('success');
    res.render("createproducts", { success });
});
module.exports = router;