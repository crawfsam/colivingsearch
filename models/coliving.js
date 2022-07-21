const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ColivingSchema = new Schema({
    name: String,
    location: String,
    description: String,
    url: String,
});

module.exports = mongoose.model('Coliving', ColivingSchema);