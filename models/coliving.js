const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ColivingSchema = new Schema({
    name: String,
    city: String,
    country: String,
    address: String,
    url: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
});

module.exports = mongoose.model('Coliving', ColivingSchema);