const jwt = require('jsonwebtoken');
const sellerModel = require('../models/seller-model');

module.exports = async function(req, res, next){

  const token = req.cookies.sellerToken;
  
  if(!token){
    req.flash('error', "You need to login as seller first");
    return res.redirect('/sellers/login');
  }

  try{ 
    let decoded = jwt.verify(token, process.env.JWT_KEY);
    let seller = await sellerModel.findOne({email: decoded.email}).select('-password');
    if(!seller){
      req.flash('error', "You need to login as seller first");
      return res.redirect('/sellers/login');
    }
    if(seller.isBlocked){
      res.clearCookie('sellerToken');
      req.flash('error', "Your account has been blocked. Please contact admin.");
      return res.redirect('/sellers/login');
    }
    if(!seller.isApproved){
      res.clearCookie('sellerToken');
      req.flash('error', "Your account is pending admin approval.");
      return res.redirect('/sellers/login');
    }
    req.seller = seller;
    next();
  }catch(err){
    req.flash('error', "You need to login as seller first");
    res.redirect('/sellers/login');
  }
};
