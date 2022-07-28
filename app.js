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

app.listen(3000, () => {
    console.log("Serving on port 3000");
});