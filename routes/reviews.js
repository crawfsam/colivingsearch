const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');

router.post('/coliving/:id/reviews', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/coliving/:id/reviews/:reviewId', isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;