const express = require('express');
const path = require('path')
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
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (req, res) => {
    const colivings = await Coliving.find({});
    res.render('index', { colivings });
});

app.listen(3000, () => {
    console.log("Serving on port 3000");
});