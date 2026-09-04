const jwt = require('jsonwebtoken');
const ownerModel = require('../models/owner-model');

module.exports = async function(req, res, next){
  const token = req.cookies.ownerToken;
  
  const isJsonRequest = req.xhr || 
    req.headers.accept?.includes('application/json') || 
    req.path.startsWith('/api') || 
    req.baseUrl?.startsWith('/api') || 
    req.baseUrl?.startsWith('/owners/orders');

  if(!token){
    if (isJsonRequest) {
      return res.status(401).json({ error: "You need to login as admin first" });
    }
    req.flash('error', "You need to login as admin first");
    return res.redirect('/owners/login');
  }

  try{ 
    let decoded = jwt.verify(token, process.env.JWT_KEY);
    let owner = await ownerModel.findOne({email: decoded.email}).select('-password');
    if(!owner){
      if (isJsonRequest) {
        return res.status(401).json({ error: "Admin session not found" });
      }
      req.flash('error', "You need to login as admin first");
      return res.redirect('/owners/login');
    }
    req.owner = owner;
    next();
  }catch(err){
    if (isJsonRequest) {
      return res.status(401).json({ error: "Invalid or expired admin token" });
    }
    req.flash('error', "You need to login as admin first");
    res.redirect('/owners/login');
  }
};
