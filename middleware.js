const { colivingSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateColiving = (req, res, next) => {
    const { error } = colivingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        if(!req.user.isAdmin) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/coliving/${id}`);
        }
    }
    next();
}

module.exports.isAdmin = async (req, res, next) => {
    if (!req.user.isAdmin) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You do not have the appropriate permissions!');
        return res.redirect('/coliving');
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}