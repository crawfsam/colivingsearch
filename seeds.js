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

const seedDB = async () => {
    await Coliving.deleteMany({});
    const c = new Coliving({
        name: "Hektor",
        location: "Tallinn, Estonia",
        description: "A container hotel where you can stay long or short term",
        url: "https://www.hektorstay.com/container/en/discover-container-hotel/",
    });
    await c.save();
};


seedDB()