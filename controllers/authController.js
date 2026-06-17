const userModel = require('../models/user-Model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const{generateToken} = require('../utils/generateToken');

module.exports.registerUser =async function(req, res){
    try{
        const {fullname, email, password} = req.body;
        let user = await userModel.findOne({email:email});
        if(user){
            return res.status(400).send("User already exists with this email, Please login");
        }
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                console.error('Error generating salt:', err);
                return res.status(500).send('Internal server error');
            }
            bcrypt.hash(password, salt, async function(err, hash) {
                if (err) {
                    console.error('Error hashing password:', err);
                    return res.status(500).send('Internal server error');
                }
                let createdUser = await userModel.create({
                    fullname,
                    email,
                    password: hash,
                    });
                    
                     let token = generateToken(createdUser);
                     res.cookie("token", token);
                     res.send("user created successfully");

               });
            });

           
    }catch(err){
        console.log(err.message);
    }
} 

module.exports.loginUser = async function(req, res){
    let {email, password} = req.body;

    let user = await userModel.findOne({email: email});
    if(!user){
        return res.status(400).send("Email or password is incorrect");
    }

    bcrypt.compare(password, user.password, function(err, result){
        if(result){
            let token = generateToken(user);
            res.cookie("token", token);
            res.send("You can login");
        }
        else{
            res.send("Email or password is incorrect");
        }
    })
}