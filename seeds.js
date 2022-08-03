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
        url: "https://www.hektorstay.com/container/en/discover-container-hotel",
        description: 'Located in a refurbished soviet train depot, this coliving is made of shipping containers, with a thriving digital nomad community living inside them',
        images: [{
            url: "https://res.cloudinary.com/dv6ovhli2/image/upload/v1659138204/ColivingSearch/tileaqx5auqkrdi9nqvc.jpg",
            filename: "ColivingSearch/tileaqx5auqkrdi9nqvc"
        }],
    },
    {
        name: "Arctic Coworking Lodge",
        city: "Bøstad",
        country: "Norway",
        address: "Tangstad 191, 8360 Bøstad, Norway",
        url: "https://www.arcticcoworking.com",
        description: 'Cowork and colive in the beautiful fjords of Lofoten. The perfect place to seek adventure with other professionals',
        images: [{
            url: "https://res.cloudinary.com/dv6ovhli2/image/upload/v1659138204/ColivingSearch/tileaqx5auqkrdi9nqvc.jpg",
            filename: "ColivingSearch/tileaqx5auqkrdi9nqvc"
        }],
    },
    {
        name: "Gastón Coliving",
        city: "Medellín",
        country: "Colombia",
        address: "Cra 83 #4635, Medellín, La América, Medellín, Antioquia, Colombia",
        url: "http://gaston-coliving.medellin-hotels.com",
        description: 'A coliving community in Nomad hotspot Medellín, for travellers who seek to live and work in a more unconventional way.',
        images: [{
            url: "https://res.cloudinary.com/dv6ovhli2/image/upload/v1659138204/ColivingSearch/tileaqx5auqkrdi9nqvc.jpg",
            filename: "ColivingSearch/tileaqx5auqkrdi9nqvc"
        }],
    },
    {
        name: "The Blue Bank (Blábankinn",
        city: "Þingeyri",
        country: "Iceland",
        address: "Fjarðargata 2, 470 Thingeyri, Iceland",
        url: "https://www.blabankinn.is/",
        description: 'Coliving in the Westfjords of Iceland with community hub and coworking space.',
        images: [{
            url: "https://res.cloudinary.com/dv6ovhli2/image/upload/v1659138204/ColivingSearch/tileaqx5auqkrdi9nqvc.jpg",
            filename: "ColivingSearch/tileaqx5auqkrdi9nqvc"
        }],
    }
]

const seedDB = async () => {
    console.log('seeding...')
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
    console.log('seeding completed')
};


seedDB()