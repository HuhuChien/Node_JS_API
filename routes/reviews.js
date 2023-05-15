const express = require('express')
const {getReviews} = require('../controllers/reviews')
const Review = require('../models/Review')
const router = express.Router({mergeParams:true})//要再搞懂與前一行的差別，解釋再下面
//You must pass {mergeParams: true} to the child router if you want to access the params from the parent router.
const {protect,authorize} = require('../middleware/auth')



const advancedResults = require('../middleware/advancedResults')






router.get('/', advancedResults(Review,{
    path:'bootcamp',
    select: 'name description'
}),getReviews);







module.exports = router;







