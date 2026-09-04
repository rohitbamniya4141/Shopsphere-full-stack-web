const jwt = require('jsonwebtoken');
const userModel = require('../models/user-model');

module.exports = async function(req, res, next){
  const token = req.cookies.token;
  
  const isJsonRequest = req.xhr || 
    req.headers.accept?.includes('application/json') || 
    req.path.startsWith('/api') || 
    req.baseUrl?.startsWith('/api') || 
    req.baseUrl?.startsWith('/payment') || 
    req.baseUrl?.startsWith('/ai');

  if(!token){
    if (isJsonRequest) {
      return res.status(401).json({ error: "You must be logged in" });
    }
    req.flash('error', "you need to login first");
    return res.redirect('/');
  }

  try{ 
    let decoded = jwt.verify(token, process.env.JWT_KEY);
    let user = await userModel.findOne({email: decoded.email}).select('-password');
    if (!user) {
      if (isJsonRequest) {
        return res.status(401).json({ error: "User session not found" });
      }
      return res.redirect('/');
    }
    req.user = user;
    next();
  }catch(err){
    if (isJsonRequest) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.flash('error', "you need to login first");
    res.redirect('/');
  }
};