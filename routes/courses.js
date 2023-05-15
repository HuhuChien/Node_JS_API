const express = require('express')

const router = express.Router({mergeParams:true})//You must pass {mergeParams: true} to the child router if you want to access the params from the parent router.
const {protect,authorize} = require('../middleware/auth')
const {getCourses, getCourse, addCourse,updateCourse,deleteCourse} = require('../controllers/courses')

const Course = require('../models/Course')
const advancedResults = require('../middleware/advancedResults')

router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/',protect,authorize('publisher', 'admin'),addCourse); //代表api/v1/bootcamp/:bootcampId/courses
router.put('/:id',protect,authorize('publisher', 'admin'),updateCourse);
router.delete('/:id',protect,authorize('publisher', 'admin'),deleteCourse);

module.exports = router;

