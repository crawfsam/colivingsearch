const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateColiving, isAdmin } = require('../middleware');
const coliving = require('../controllers/coliving');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(coliving.index))
    .post(isLoggedIn, isAdmin, upload.array('image'), validateColiving, catchAsync(coliving.createColiving));

router.get('/new', isLoggedIn, isAdmin, coliving.new);

router.route('/:id')
    .get(catchAsync(coliving.showColiving))
    .put(isLoggedIn, isAdmin, catchAsync(coliving.updateColiving))
    .delete(isLoggedIn, isAdmin, catchAsync(coliving.deleteColiving)); 

router.get('/:id/edit', isAdmin, catchAsync(coliving.renderEditForm));


module.exports = router;