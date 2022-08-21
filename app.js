if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path')
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const Coliving = require('./models/coliving');
const Country = require('./models/country');
const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require("connect-mongo")(session);
const User = require('./models/user');
const userRoutes = require('./routes/users');
const colivingRoutes = require('./routes/colivings');
const reviewRoutes = require('./routes/reviews');

const dbUrl = process.env.DB_URL

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

const secret = process.env.SECRET;

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', userRoutes);
app.use('/coliving', colivingRoutes);
app.use('/', reviewRoutes);

app.get('/', async (req, res) => {
    const popular = ['Portugal', 'Mexico', 'Colombia']
    const countries = await Country.find({name: { $in: popular }});
    const recs = []
    for(let country of countries) {
        const n = await Coliving.find({country: country.name}).sort({'date': -1}).limit(3);
        recs.push({
            name: country.name,
            emoji: country.emoji,
            colivings: n
        })
    }
    res.render('index', { recs });
});

app.get('/:country', async (req, res) => {
    const recommendations = await Coliving.find({country: req.params.country}).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    });;
    if(!recommendations[0]) {
        res.redirect('/coliving')
    }
    const country = await Country.find({name: req.params.country});
    const countryData = country[0];

    const cs = await Coliving.find({}).select('country').distinct('country')
    availCountries = []
    for(let c of cs) {
        num = await Coliving.find({}).select('country').count({country: c})
        availCountries.push({
            name: c,
            num
        })
    }
    res.render('country-profile', { recommendations, countryData, availCountries })
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log("Serving on port 3000");
});