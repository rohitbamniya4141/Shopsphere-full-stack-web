module.exports = function(req, res, next){

    if(req.user.role !== "admin"){

        req.flash("error","Access Denied");

        return res.redirect("/shop");

    }

    next();

}