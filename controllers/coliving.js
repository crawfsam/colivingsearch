const Coliving = require('../models/coliving');
const Country = require('../models/country');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });
const { cloudinary } = require('../cloudinary');
const country = require('../models/country');
 
 module.exports.index = async (req, res) => {
    const coliving = await Coliving.find({}).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    });

    const cs = await Coliving.find({}).select('country').distinct('country')
    availCountries = []
    for(let c of cs) {
        num = await Coliving.find({}).select('country').count({country: c})
        availCountries.push({
            name: c,
            num
        })
    }
    res.render('coliving/index', {coliving, availCountries} );
};

module.exports.new = (req, res) => {
    res.render('coliving/new');
};

module.exports.createColiving = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.coliving.address,
        limit: 1
    }).send()
    const coliving = new Coliving(req.body.coliving);
    coliving.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    coliving.geometry = geoData.body.features[0].geometry;
    await coliving.save();
    res.redirect(`/coliving/${coliving._id}`)
};

module.exports.showColiving = async (req, res,) => {
    const allColivings = await Coliving.find({});
    const coliving = await Coliving.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    });
    const country = await Country.find({
        name: coliving.country
    })
    const countryData = country[0]
    const recommendations = await Coliving.find({
        country: coliving.country,
        _id: { $ne: coliving._id }
    }).sort({'date': -1}).limit(20)
    if (!coliving) {
        req.flash('error', 'Cannot find that coliving!');
        return res.redirect('/coliving');
    }
    res.render('coliving/show', { coliving, allColivings, countryData, recommendations});
};

module.exports.renderEditForm = async (req, res) => {
    const coliving = await Coliving.findById(req.params.id)
    if (!coliving) {
        req.flash('error', 'Cannot find that coliving!');
        return res.redirect('/coliving');
    }
    res.render('coliving/edit', { coliving });
};

module.exports.updateColiving = async (req, res) => {
    const { id } = req.params;
    const coliving = await Coliving.findByIdAndUpdate(id, { ...req.body.coliving });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    coliving.images.push(...imgs);
    await coliving.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    res.redirect(`/coliving/${coliving._id}`)
};

module.exports.deleteColiving = async (req, res) => {
    const { id } = req.params;
    await Coliving.findByIdAndDelete(id);
    res.redirect('/coliving');
};