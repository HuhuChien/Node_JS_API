const express = require('express')
const router = express.Router()
const {protect,authorize} = require('../middleware/auth')
const {getBootcamps,  
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');

const advancedResults = require('../middleware/advancedResults');


//Include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');





//Re-route into other resource routers，將原本屬於bootcamps的route，把它放到courses的route，再被注入courses route的檔案裡，要多個mergeParams
router.use('/:bootcampId/courses', courseRouter)
//Re-route into other resource routers，將原本屬於bootcamps的route，把它放到Review的route，再被注入review route的檔案裡，要多個mergeParams
router.use('/:bootcampId/reviews', reviewRouter)


router.get('/radius/:zipcode/:distance',getBootcampsInRadius);
router.get('/', advancedResults(Bootcamp,'coursesf'),getBootcamps);
router.get('/:id',getBootcamp);
router.post('/', protect,authorize('publisher', 'admin'),createBootcamp);
router.put('/:id',protect,authorize('publisher', 'admin'),updateBootcamp);
router.delete('/:id',protect,authorize('publisher', 'admin'),deleteBootcamp);
router.put('/:id/photo',protect,authorize('publisher', 'admin'),bootcampPhotoUpload);

module.exports = router;
