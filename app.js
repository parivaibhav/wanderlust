const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const listingsRoutes = require("./routes/listing.js");
const reviewsRoutes = require("./routes/review.js");
const usersRoutes = require("./routes/user.js")
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local")
const User = require("./models/user.js");


main()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("DB connection error:", err);
    });

async function main() {
    await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000, // 20 seconds
        useNewUrlParser: true, useUnifiedTopology: true,
    });
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


const store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    crypto: {
        secret: "mysupersecretcode",
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
})

const sessionOptions = {
    store: store,
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week from now
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    // console.log(res.locals.success);
    next();
})

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "vaibhav"
//     })
//     let registerUser = await User.register(fakeUser, "Helloworld") // insert in db second is password
//     res.send(registerUser);
// })

app.use("/listings", listingsRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);
app.use("/", usersRoutes);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (res.headersSent) {
        return next(err);
    }
    if (!err.message) err.message = "Something went wrong!";
    res.status(statusCode).render("error.ejs", { err });
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});