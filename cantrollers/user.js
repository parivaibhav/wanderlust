const User = require("../models/user");

module.exports.renderSignupForm = async (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.userRegister = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username })
        const registeredUser = await User.register(newUser, password);
        // console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "user register Sucessfully! Welcome to wanderlust");
            res.redirect("/listings");
        })
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

module.exports.renderLoginForm = async (req, res) => {
    res.render("users/login.ejs");
}

module.exports.renderLoginPage = async (req, res) => {
    req.flash("success", "Welcome to wanderlust! You are logged In");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.renderLogout=async (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you're sucessfully logout");
        res.redirect("/listings");
    })
}