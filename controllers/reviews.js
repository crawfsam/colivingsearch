const Coliving = require('../models/coliving');
const Review = require('../models/review');

module.exports.createReview = async(req, res) => {
    const coliving = await Coliving.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    coliving.reviews.push(review);
    await review.save()
    await coliving.save()
    res.redirect(`/coliving/${coliving._id}`)
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Coliving.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/coliving/${id}`);
};