module.exports = function(req, res, next){

    if(req.user.role !== "admin"){

        req.flash("error","Access Denied");

        res.redirect("/owners/dashboard");

    }

    next();

}