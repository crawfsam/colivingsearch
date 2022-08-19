const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CountrySchema = new Schema({
    name: String,
    capital: String,
    wifiSpeed: {
        val: Number,
        rating: Number
    },
    crimeRate: {
        val: String,
        rating: Number
    },
    monthlyCost: {
        val: Number,
        rating: Number
    },
    colIndex: {
        val:String,
        rating: Number
    },
    emoji: String
})

module.exports = mongoose.model('Country', CountrySchema);