const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');
const Coliving = require('../models/coliving');
const Review = require('../models/review');


router.post('/coliving/:id/reviews', isLoggedIn, validateReview, catchAsync(async(req, res) => {
    const coliving = await Coliving.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    coliving.reviews.push(review);
    await review.save()
    await coliving.save()
    res.redirect(`/coliving/${coliving._id}`)
}))

router.delete('/coliving/:id/reviews/:reviewId', isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Coliving.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/coliving/${id}`);
}))

module.exports = router;