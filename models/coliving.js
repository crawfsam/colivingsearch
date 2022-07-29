const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')

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
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

ColivingSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Coliving', ColivingSchema);