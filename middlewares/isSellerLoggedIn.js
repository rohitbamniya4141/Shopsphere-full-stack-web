const jwt = require('jsonwebtoken');
const sellerModel = require('../models/seller-model');

module.exports = async function(req, res, next){
  const token = req.cookies.sellerToken;
  
  const isJsonRequest = req.xhr || 
    req.headers.accept?.includes('application/json') || 
    req.path.startsWith('/api') || 
    req.baseUrl?.startsWith('/api') || 
    req.baseUrl?.startsWith('/sellers/orders');

  if(!token){
    if (isJsonRequest) {
      return res.status(401).json({ error: "You need to login as seller first" });
    }
    req.flash('error', "You need to login as seller first");
    return res.redirect('/sellers/login');
  }

  try{ 
    let decoded = jwt.verify(token, process.env.JWT_KEY);
    let seller = await sellerModel.findOne({email: decoded.email}).select('-password');
    if(!seller){
      if (isJsonRequest) {
        return res.status(401).json({ error: "Seller session not found" });
      }
      req.flash('error', "You need to login as seller first");
      return res.redirect('/sellers/login');
    }
    if(seller.isBlocked){
      res.clearCookie('sellerToken');
      if (isJsonRequest) {
        return res.status(403).json({ error: "Your account has been blocked. Please contact admin." });
      }
      req.flash('error', "Your account has been blocked. Please contact admin.");
      return res.redirect('/sellers/login');
    }
    if(!seller.isApproved){
      res.clearCookie('sellerToken');
      if (isJsonRequest) {
        return res.status(403).json({ error: "Your account is pending admin approval." });
      }
      req.flash('error', "Your account is pending admin approval.");
      return res.redirect('/sellers/login');
    }
    req.seller = seller;
    next();
  }catch(err){
    if (isJsonRequest) {
      return res.status(401).json({ error: "Invalid or expired seller token" });
    }
    req.flash('error', "You need to login as seller first");
    res.redirect('/sellers/login');
  }
};
