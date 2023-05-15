
const path = require('path')
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async'); //最後沒用到
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp');





// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public

exports.getBootcamps = async (req,res,next) => {
    try{
       
        res.status(200).json(res.advancedResults)

    } catch(error){
        res.status(400).json({success:false})
        
    }
}

//使用asyncHandler
/*
exports.getBootcamps = asyncHandler(async(req,res,next) => {
    
        const bootcamps = await Bootcamp.find();

        res.status(200).json({
            success:true,
            count:bootcamps.length,
            data:bootcamps
        })
    
        res.status(400).json({success:false})
         
});
*/





// @desc Get single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = async (req,res,next) => {
   try{
    const bootcamp = await Bootcamp.findById(req.params.id)

    if(!bootcamp){    //輸入id長度一樣，但內容不一致，還是會跑出200。用這方法，這樣就會有400
        return res.status(400).json({
            success:false
        })

    } else {

        return res.status(200).json({
            success:true,
            data:bootcamp
        })
    }

   }catch(error){  //id長度與正確的id長度比較，太長或太短，會跑出400
       //res.status(400).json({success:false})
       //這是另外一種方法
       next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}` ,404))
   }
}


// @desc Create new bootcamp
// @route POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = async (req,res,next) => {
  
    try{
        //Add user to req.body
        req.body.user = req.userrr._id //req.userrrr is from middleware/auth/protect
        console.log('computer');
        console.log(req.userrr);
        console.log(req.userrr.id);//這樣寫也ok，雖然object裡面只有_id
        //Check for published bootcamps
        const publishedBootcamp = await Bootcamp.findOne({user: req.userrr._id})

        //If the user is not an admin, they can only add one bootcamp
        if(publishedBootcamp && req.userrr.role !== 'admin'){
            return next(new ErrorResponse(`The user with IDd ${req.userrr._id} has already published a bootcamp`))
        }
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({
            success: true,
            data:bootcamp
        })
    }catch(error){
        console.log(error)
        res.status(400).json({
            success:false
        })
    }
  
  
  
}

// @desc Update bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = async(req,res,next) => {
   try{
    let bootcamp = await Bootcamp.findById(req.params.id);
   
    if(!bootcamp){
        return res.status(400).json({
            success:false
       })
    }
    //Make sure user is bootcamp owner
    console.log(bootcamp.user.toString())
    console.log(req.userrr)
    console.log('car')
    if(bootcamp.user.toString() !== req.userrr._id.toString() && req.userrr.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`,401))
    }
    bootcamp = await Bootcamp.findOneAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })

    res.status(200).json({
        success:true,
        data:bootcamp
    })

   }catch(error){
       res.status(400).json({
            success:false
       })
   }
}


// @desc Delete bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = async (req,res,next) => {

    try{
        const bootcamp = await Bootcamp.findById(req.params.id)
        if(!bootcamp){
            return res.status(400).json("this bootcamp doesn\'t exist")
        } else {

            //Make sure user is bootcamp owner
            console.log(bootcamp.user.toString())
            console.log(req.userrr)
            console.log('car')
            if(bootcamp.user.toString() !== req.userrr._id.toString() && req.userrr.role !== 'admin'){
                return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`,401))
            }


            bootcamp.remove();
            return res.status(200).json("already deleted");
        }

    }catch(error){
        res.status(500).json({
            success:false
        })
    }

}






// @desc Get bootcamps within a radius
// @route Get /api/v1/bootcamps/radius/:zipcode/:distance
// @access Private
exports.getBootcampsInRadius = async (req,res,next) => {
    
    try {
        const {zipcode,distance} = req.params;

        //Get lat/lng from geocoder
        const loc = await geocoder.geocode(zipcode);
        console.log('apple')
        console.log(loc)
        const lat = loc[0].latitude;
        const lng = loc[0].longitude;
        //calc radius using radians
        //divide distance by radius of Earth
        //Earch Radius = 3,963 mi or 6378 km
        const radius = distance / 3963;
        const bootcamps = await Bootcamp.find({
            location: {
                $geoWithin: {$centerSphere: [[lng,lat],radius]}
            }
          
        })
        console.log('apple2')
        console.log(bootcamps);
    
        if(bootcamps.length > 0){
            res.status(200).json({
                success:true,
                count: bootcamps.length,
                data: bootcamps
            })
        } else {
            res.status(200).json({
                success:true,
                count: bootcamps.length,
                data: 'no data'
            })
        }
    
    }catch(error){
        console.log(error);
    }
 
}






// @desc upload photo for bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access Private
exports.bootcampPhotoUpload = async (req,res,next) => {

    try{
        const bootcamp = await Bootcamp.findById(req.params.id)
        //console.log(bootcamp)
        if(!bootcamp){
            return res.status(400).json("this bootcamp doesn\'t exist")
        }

        //console.log(req.files)

        
        if(!req.files){
            return next(new ErrorResponse(`Please upload a file`,400))
        } 

       const file = req.files.file

       //Make sure the image is a photo
       if(!file.mimetype.startsWith('image')){
        return next(new ErrorResponse(`Please upload an image file`,400))
       } 

       //check filesize
       if(file.size > process.env.MSX_FILE_UPLOAD){
            return next(new ErrorResponse(`Please upload an image less than ${process.env.MSX_FILE_UPLOAD}`,400))
       }


       //create custom filename
       file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
       //console.log(file.name)
       file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
           if(err){
               console.error(err);
               return next(new ErrorResponse(`Problem with file upload`,500))
           }
            await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});
         
           res.status(200).json({
               success: true,
               data: file.name
           })


       })
    }catch(error){
        res.status(500).json({
            success:false
        })
    }

}
