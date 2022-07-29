const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateColiving, isAdmin } = require('../middleware');
const Coliving = require('../models/coliving');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });

router.get('/', catchAsync(async (req, res) => {
    const coliving = await Coliving.find({})
    res.render('coliving', {coliving} );
}));

router.get('/new', isAdmin, (req, res) => {
    res.render('coliving/new');
})

router.post('/', isLoggedIn, isAdmin, validateColiving, catchAsync(async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.coliving.address,
        limit: 1
    }).send()
    const coliving = new Coliving(req.body.coliving);
    coliving.geometry = geoData.body.features[0].geometry;
    await coliving.save();
    res.redirect(`/coliving/${coliving._id}`)
}));

router.get('/:id', catchAsync(async (req, res,) => {
    const coliving = await Coliving.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    });
    if (!coliving) {
        req.flash('error', 'Cannot find that coliving!');
        return res.redirect('/coliving');
    }
    res.render('coliving/show', { coliving });
}));    

router.get('/:id/edit', isAdmin, catchAsync(async (req, res) => {
    const coliving = await Coliving.findById(req.params.id)
    if (!coliving) {
        req.flash('error', 'Cannot find that coliving!');
        return res.redirect('/coliving');
    }
    res.render('coliving/edit', { coliving });
}));

router.put('/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params;
    const coliving = await Coliving.findByIdAndUpdate(id, { ...req.body.coliving });
    res.redirect(`/coliving/${coliving._id}`)
}));

router.delete('/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Coliving.findByIdAndDelete(id);
    res.redirect('/coliving');
}));

module.exports = router;