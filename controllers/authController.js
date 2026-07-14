const userModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const{generateToken} = require('../utils/generateToken');

module.exports.registerUser = async function(req, res){
    try{
        const {fullname, email, password} = req.body;

        if(!fullname || !email || !password){
            req.flash('error', 'All fields are required');
            return res.redirect('/');
        }

        let user = await userModel.findOne({email: email});
        if(user){
            req.flash('error', 'User already exists with this email, Please login');
            return res.redirect('/');
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        let createdUser = await userModel.create({
            fullname,
            email,
            password: hash,
        });
                    
        let token = generateToken(createdUser);
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
        res.redirect("/shop");
    }catch(err){
        console.log(err.message);
        req.flash('error', 'Something went wrong, please try again');
        res.redirect('/');
    }
} 

module.exports.loginUser = async function(req, res){
    try{
        let {email, password} = req.body;

        if(!email || !password){
            req.flash('error', 'Email and password are required');
            return res.redirect('/');
        }

        let user = await userModel.findOne({email: email});
        if(!user){
            req.flash('error', 'Email or password is incorrect');
            return res.redirect('/');
        }

        let result = await bcrypt.compare(password, user.password);
        if(result){
            let token = generateToken(user);
            res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
            res.redirect("/shop");
        }
        else{
            req.flash('error', 'Email or password is incorrect');
            res.redirect('/');
        }
    }catch(err){
        console.log(err.message);
        req.flash('error', 'Something went wrong, please try again');
        res.redirect('/');
    }
}