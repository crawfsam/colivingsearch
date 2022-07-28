if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const Coliving = require('./models/coliving');
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

const seeds = [
    {
        name: "Hektor Container Hotel",
        city: "Tallinn",
        country: "Estonia",
        address: "Telliskivi 62, 10412 Tallinn, Estonia",
        url: "https://www.hektorstay.com/container/en/discover-container-hotel/"
    },
    {
        name: "Arctic Coworking Lodge",
        city: "Bøstad",
        country: "Norway",
        address: "Tangstad 191, 8360 Bøstad, Norway",
        url: "https://www.arcticcoworking.com/"
    },
    {
        name: "Gastón Coliving",
        city: "Medellín",
        country: "Colombia",
        address: "Cra 83 #4635, Medellín, La América, Medellín, Antioquia, Colombia",
        url: "http://gaston-coliving.medellin-hotels.com/en/"
    }
]

const seedDB = async () => {
    await Coliving.deleteMany({});
    for(let seed of seeds) {
        let geoData = await geocoder.forwardGeocode({
            query: seed.address,
            limit: 1
        }).send()
        let geometry = geoData.body.features[0].geometry;

        let c = new Coliving({
            name: seed.name,
            city: seed.city,
            country: seed.country,
            address: seed.address,
            url: seed.url,
            geometry: geometry
        })
        await c.save()
    }
};


seedDB()