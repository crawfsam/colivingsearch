const express = require('express');
const path = require('path')
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const Coliving = require('./models/coliving');

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


app.get('/', async (req, res) => {
    res.render('index');
});

app.get('/coliving', async (req, res) => {
    res.render('coliving');
});

app.get('/login', async (req, res) => {
    res.render('login');
});

app.listen(3000, () => {
    console.log("Serving on port 3000");
});