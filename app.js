if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path')
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const Coliving = require('./models/coliving');
const catchAsync = require('./utils/catchAsync');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });

mongoose.connect('mongodb://localhost:27017/coliving-options', {
    useNewUrlParser: true,
    useUnifiedTopology: true
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

app.post('/coliving', async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.coliving.address,
        limit: 1
    }).send()
    const coliving = new Coliving(req.body.coliving);
    coliving.geometry = geoData.body.features[0].geometry;
    await coliving.save();
    res.redirect(`/coliving/${coliving._id}`)
})

app.get('/coliving/:id', async (req, res,) => {
    const coliving = await Coliving.findById(req.params.id)
    res.render('coliving/show', { coliving });
});

app.get('/coliving/:id/edit', async (req, res) => {
    const coliving = await Coliving.findById(req.params.id)
    res.render('coliving/edit', { coliving });
})

app.put('/coliving/:id', async (req, res) => {
    const { id } = req.params;
    const coliving = await Coliving.findByIdAndUpdate(id, { ...req.body.coliving });
    res.redirect(`/coliving/${coliving._id}`)
});

app.delete('/coliving/:id', async (req, res) => {
    const { id } = req.params;
    await Coliving.findByIdAndDelete(id);
    res.redirect('/coliving');
})

app.listen(3000, () => {
    console.log("Serving on port 3000");
});