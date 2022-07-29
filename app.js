if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path')
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const Coliving = require('./models/coliving');
const session = require('express-session');
const User = require('./models/user');
const catchAsync = require('./utils/catchAsync');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const userRoutes = require('./routes/users');
const geocoder = mbxGeocoding({ accessToken: mapboxToken });
const { validateColiving, isLoggedIn } = require('./middleware');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');
const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require("connect-mongo")(session);


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

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

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
}

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
})

app.use('/', userRoutes);

app.get('/', async (req, res) => {
    res.render('index');
});

app.get('/coliving', catchAsync(async (req, res) => {
    const coliving = await Coliving.find({})
    res.render('coliving', {coliving} );
}));

app.get('/login', async (req, res) => {
    res.render('login');
});

app.get('/coliving/new', (req, res) => {
    res.render('coliving/new');
})

app.post('/coliving', catchAsync(async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.coliving.address,
        limit: 1
    }).send()
    const coliving = new Coliving(req.body.coliving);
    coliving.geometry = geoData.body.features[0].geometry;
    await coliving.save();
    res.redirect(`/coliving/${coliving._id}`)
}));

app.get('/coliving/:id', catchAsync(async (req, res,) => {
    const coliving = await Coliving.findById(req.params.id)
    res.render('coliving/show', { coliving });
}));

app.get('/coliving/:id/edit', catchAsync(async (req, res) => {
    const coliving = await Coliving.findById(req.params.id)
    res.render('coliving/edit', { coliving });
}));

app.put('/coliving/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const coliving = await Coliving.findByIdAndUpdate(id, { ...req.body.coliving });
    res.redirect(`/coliving/${coliving._id}`)
}));

app.delete('/coliving/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Coliving.findByIdAndDelete(id);
    res.redirect('/coliving');
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log("Serving on port 3000");
});