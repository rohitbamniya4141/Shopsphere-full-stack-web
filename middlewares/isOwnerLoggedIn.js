const jwt = require('jsonwebtoken');
const ownerModel = require('../models/owner-model');

module.exports = async function(req, res, next){

  const token = req.cookies.ownerToken;
  
  if(!token){
    req.flash('error', "You need to login as admin first");
    return res.redirect('/owners/login');
  }

  try{ 
    let decoded = jwt.verify(token, process.env.JWT_KEY);
    let owner = await ownerModel.findOne({email: decoded.email}).select('-password');
    if(!owner){
      req.flash('error', "You need to login as admin first");
      return res.redirect('/owners/login');
    }
    req.owner = owner;
    next();
  }catch(err){
    req.flash('error', "You need to login as admin first");
    res.redirect('/owners/login');
  }
};
