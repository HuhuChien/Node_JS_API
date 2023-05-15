const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const Review = require('../models/Review');




//兩個route寫在一起
// @desc Get reviews
// @route GET /api/v1/reviews
// @route GET /api/v1/bootcamps/:boootcampId/reviews
// @access Public
exports.getReviews = async(req,res,next) => {
    try{
        if(req.params.bootcampId){
            const reviews = await Review.find({
                bootamp:req.params.bootcampId
            });
            
            console.log(reviews)
            return res.status(200).json({
                success:true,
                count:reviews.length,
                data:reviews
            })

        } else {
            console.log('plane')
            //console.log(res)
            res.status(200).json(res.advancedResults)
        }
    }catch(error){
        console.log('nboio')
       console.log(error)
    }
}